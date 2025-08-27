import { z } from 'zod';

/**
 * @fileoverview Defines the Feedback entity for the domain layer.
 * This represents a piece of feedback left by a customer for a business.
 */

export const FeedbackSchema = z.object({
  id: z.string().describe("Unique identifier for the feedback entry."),
  businessId: z.string().describe("The ID of the business this feedback is for."),
  businessName: z.string().describe("The name of the business."),
  rating: z.number().min(1).max(4).describe("The star rating given (1-4)."),
  comment: z.string().describe("The text comment left by the customer."),
  status: z.enum(['new', 'read', 'archived']).default('new').describe("The status of the feedback for internal management."),
  createdAt: z.date().describe("The timestamp when the feedback was submitted."),
  userName: z.string().optional().describe("The name of the customer who left the feedback."),
  userEmail: z.string().email().optional().describe("The email of the customer who left the feedback."),
});

export type Feedback = z.infer<typeof FeedbackSchema>;
