import { config } from 'dotenv';
config();

import '@/ai/flows/review-sentiment-analysis.ts';
import '@/ai/flows/service-recommendation.ts';
import '@/ai/flows/gmb-data-extraction-flow.ts'; // Added new GMB data extraction flow
