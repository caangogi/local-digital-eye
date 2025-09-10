

import type { BusinessRepositoryPort } from '../domain/business.repository.port';
import { getBusinessMetrics, getBusinessReviews } from '@/services/googleMapsService';
import type { GmbPerformanceResponse, GmbReview } from '@/services/googleMapsService';
import type { Review } from '../domain/business.entity';

/**
 * @fileoverview Defines the use case for updating the GMB insights cache for a single business.
 * This use case is intended to be run manually by the business owner.
 */

const mapGmbRatingToNumber = (rating: GmbReview['starRating']): number => {
    switch (rating) {
        case 'FIVE': return 5;
        case 'FOUR': return 4;
        case 'THREE': return 3;
        case 'TWO': return 2;
        case 'ONE': return 1;
        default: return 0;
    }
}


export class UpdateSingleBusinessCacheUseCase {
  constructor(private readonly businessRepository: BusinessRepositoryPort) {}

  /**
   * Executes the use case to update a single business.
   * @param businessId The ID of the business to update.
   * @param ownerId The ID of the owner initiating the request, for authorization.
   * @returns A promise that resolves with the raw data fetched from Google.
   */
  async execute(businessId: string, ownerId: string): Promise<{ performanceData: GmbPerformanceResponse | null, reviewsData: GmbReview[] | null }> {
    console.log(`[UpdateSingleBusinessCache] Starting cache update for business ${businessId} by owner ${ownerId}...`);

    const business = await this.businessRepository.findById(businessId);
    
    if (!business) {
        throw new Error('Business not found.');
    }
    
    // Authorization check
    if (business.ownerId !== ownerId) {
        throw new Error('You are not authorized to refresh data for this business.');
    }

    if (business.gmbStatus !== 'linked') {
        throw new Error('Business is not connected to Google. Cannot refresh data.');
    }

    if (!business.gmbRefreshToken || !business.placeId) {
        throw new Error('Business is missing GMB refresh token or placeId.');
    }
    
    // Prevent abuse: check if last update was recent (e.g., within 24 hours)
    const now = new Date();
    const lastUpdate = business.gmbInsightsCache?.lastUpdateTime;
    if (lastUpdate) {
        const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 24) {
            // This check is temporarily disabled for debugging purposes.
            // throw new Error('Data can only be refreshed once every 24 hours.');
        }
    }

    let performanceData = null;
    let reviewsData = null;

    try {
        // 1. Fetch Performance Metrics
        performanceData = await getBusinessMetrics(business.gmbRefreshToken, business.placeId);
        
        // 2. Fetch Latest Reviews
        reviewsData = await getBusinessReviews(business.gmbRefreshToken, business.placeId);

        // 3. Process and aggregate data
        const searchViews = this.sumMetric(performanceData, 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH') + this.sumMetric(performanceData, 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH');
        const mapViews = this.sumMetric(performanceData, 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS') + this.sumMetric(performanceData, 'BUSINESS_IMPRESSIONS_MOBILE_MAPS');
        const phoneActions = this.sumMetric(performanceData, 'CALL_CLICKS');
        const websiteActions = this.sumMetric(performanceData, 'WEBSITE_CLICKS');
        const directionActions = this.sumMetric(performanceData, 'BUSINESS_DIRECTION_REQUESTS');
        
        // 4. Update the business entity
        business.gmbInsightsCache = {
            searchViews,
            mapViews,
            totalViews: searchViews + mapViews,
            websiteActions,
            phoneActions,
            directionActions,
            totalActions: websiteActions + phoneActions + directionActions,
            lastUpdateTime: new Date(),
        };

        const domainReviews: Review[] = (reviewsData || [])
            .filter(review => review.starRating !== 'STAR_RATING_UNSPECIFIED')
            .map(review => ({
                authorName: review.reviewer.displayName,
                profilePhotoUrl: review.reviewer.profilePhotoUrl,
                rating: mapGmbRatingToNumber(review.starRating),
                text: review.comment || null,
                publishTime: new Date(review.createTime),
            }));

        business.topReviews = domainReviews;

        await this.businessRepository.save(business);

        console.log(`[UpdateSingleBusinessCache] Successfully updated cache for business ${business.id}`);
        
        // Return the raw data
        return { performanceData, reviewsData };

    } catch (error: any) {
        console.error(`[UpdateSingleBusinessCache] Failed to update cache for business ${business.id}:`, error.message);
        // Pass the partially fetched data along with the error
        throw {
            message: error.message,
            rawData: {
                performanceData,
                reviewsData
            }
        };
    }
  }

  private sumMetric(data: GmbPerformanceResponse | null, metricName: string): number {
    if (!data || !data.dailyMetricTimeSeries) return 0;
    const timeSeries = data.dailyMetricTimeSeries.find(ts => ts.dailyMetric === metricName);
    if (!timeSeries || !timeSeries.timeSeries?.datedValues) {
      return 0;
    }
    return timeSeries.timeSeries.datedValues.reduce((sum, current) => sum + parseInt(current.value, 10), 0);
  }
}
