import { z } from 'zod';

/**
 * @fileoverview Defines the User entity for the domain layer using Zod for validation.
 * This ensures that user data conforms to a specific structure throughout the application.
 */

// Zod schema defines the shape and validation rules for a User.
export const UserSchema = z.object({
  id: z.string().describe("Unique identifier for the user, typically from the auth provider."),
  email: z.string().email().describe("User's email address."),
  name: z.string().optional().describe("User's full name or display name."),
  avatarUrl: z.string().url().optional().describe("URL for the user's profile picture."),
  role: z.enum(['admin', 'owner', 'super_admin']).default('admin').describe("The role of the user within the application."),
});

// TypeScript type inferred from the Zod schema.
// This allows for strong typing in the application code.
export type User = z.infer<typeof UserSchema>;
