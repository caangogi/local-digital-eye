
'use server';

import type { BusinessRepositoryPort } from '../domain/business.repository.port';
import { getBusinessMetrics, getBusinessReviews } from '@/services/googleMapsService';
import type { GmbPerformanceResponse, GmbReview } from '@/services/googleMapsService';
import type { Review } from '../domain/business.entity';

/**
 * @fileoverview Defines the use case for updating the GMB insights cache for businesses.
 * This use case is intended to be run by a scheduled job (e.g., a daily cron job).
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

export class UpdateGmbDataCacheUseCase {
  constructor(private readonly businessRepository: BusinessRepositoryPort) {}

  /**
   * Executes the use case to update all connected businesses.
   * @returns An object with the results of the operation.
   */
  async execute(): Promise<{ success: boolean; totalProcessed: number; successful: number; failed: number; errors: any[] }> {
    console.log('[UpdateGmbDataCacheUseCase] Starting daily GMB data cache update...');

    const businessesToUpdate = await this.businessRepository.findAllConnected();
    if (businessesToUpdate.length === 0) {
      console.log('[UpdateGmbDataCacheUseCase] No connected businesses found to update.');
      return { success: true, totalProcessed: 0, successful: 0, failed: 0, errors: [] };
    }

    console.log(`[UpdateGmbDataCacheUseCase] Found ${businessesToUpdate.length} businesses to process.`);
    
    let successful = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const business of businessesToUpdate) {
      try {
        if (!business.gmbRefreshToken || !business.placeId) {
          throw new Error('Business is missing GMB refresh token or placeId.');
        }

        // 1. Fetch Performance Metrics
        const performanceData = await getBusinessMetrics(business.gmbRefreshToken, business.placeId);
        
        // 2. Fetch Latest Reviews
        const reviewsData = await getBusinessReviews(business.gmbRefreshToken, business.placeId);

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

        // Map GMB API reviews to our domain's Review entity
        const domainReviews: Review[] = reviewsData
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

        console.log(`[UpdateGmbDataCacheUseCase] Successfully updated cache for business ${business.id}`);
        successful++;

      } catch (error: any) {
        console.error(`[UpdateGmbDataCacheUseCase] Failed to update cache for business ${business.id}:`, error.message);
        failed++;
        errors.push({ businessId: business.id, error: error.message });
      }
    }

    console.log(`[UpdateGmbDataCacheUseCase] Finished processing. Successful: ${successful}, Failed: ${failed}`);
    return { success: failed === 0, totalProcessed: businessesToUpdate.length, successful, failed, errors };
  }

  private sumMetric(data: GmbPerformanceResponse, metricName: string): number {
    const timeSeries = data.timeSeries?.find(ts => ts.dailyMetric === metricName);
    if (!timeSeries || !timeSeries.timeSeries?.datedValues) {
      return 0;
    }
    return timeSeries.timeSeries.datedValues.reduce((sum, current) => sum + parseInt(current.value, 10), 0);
  }
}
