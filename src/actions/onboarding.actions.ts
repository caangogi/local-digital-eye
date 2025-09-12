
'use server';

/**
 * @fileoverview Server Actions for the business owner onboarding process.
 */
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { auth, firestore } from '@/lib/firebase/firebase-admin-config';
import { cookies } from 'next/headers';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';
import { GetBusinessDetailsUseCase } from '@/backend/business/application/get-business-details.use-case';
import type { Business, SubscriptionPlan } from '@/backend/business/domain/business.entity';

const OnboardingLinkInputSchema = z.object({
  businessId: z.string(),
  planType: z.enum(['freemium', 'professional', 'premium']).default('freemium'),
  setupFee: z.number().optional().describe("Optional setup fee in cents"),
});

type OnboardingLinkInput = z.infer<typeof OnboardingLinkInputSchema>;

/**
 * Generates a unique, secure onboarding link for a business owner.
 * @param input The data required to generate the link.
 * @returns A promise that resolves to the full onboarding URL.
 */
export async function generateOnboardingLink(input: OnboardingLinkInput): Promise<string> {
  // 1. Validate input
  const { businessId, planType, setupFee } = OnboardingLinkInputSchema.parse(input);

  // 2. Authorize the action (ensure the user is an admin and owns the business)
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) {
    throw new Error('Authentication required.');
  }
  const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
  const userId = decodedToken.uid;

  const businessRepository = new FirebaseBusinessRepository();
  const business = await businessRepository.findById(businessId);

  if (!business) {
    throw new Error('Business not found.');
  }
  if (business.userId !== userId) {
    throw new Error('You are not authorized to generate a link for this business.');
  }

  // 3. Get JWT secret from environment variables
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('[OnboardingAction] JWT_SECRET is not set in environment variables.');
    throw new Error('Server configuration error.');
  }

  // 4. Create JWT payload
  const payload: { businessId: string, planType: SubscriptionPlan, setupFee?: number } = {
    businessId,
    planType,
  };
  if (setupFee && setupFee > 0) {
    payload.setupFee = setupFee;
  }

  // 5. Sign the token
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' }); // Token is valid for 7 days
  console.log(`[OnboardingAction] Generated onboarding token for business ${businessId} with plan ${planType} and setup fee ${setupFee}`);

  // 6. Construct the final URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  const onboardingUrl = new URL('/onboarding', baseUrl);
  onboardingUrl.searchParams.set('token', token);

  return onboardingUrl.toString();
}


/**
 * Validates an onboarding token and returns business details if valid.
 * @param token The JWT from the onboarding link.
 * @returns A promise that resolves to the business details or throws an error.
 */
export async function validateOnboardingToken(token: string): Promise<Business> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('[OnboardingAction] JWT_SECRET is not set in environment variables.');
        throw new Error('Server configuration error.');
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as { businessId: string, planType: string };
        const { businessId } = decoded;

        console.log(`[OnboardingAction] Token is valid. Fetching details for business ${businessId}`);
        
        const businessRepository = new FirebaseBusinessRepository();
        const getBusinessDetailsUseCase = new GetBusinessDetailsUseCase(businessRepository);
        const business = await getBusinessDetailsUseCase.execute(businessId);

        if (!business) {
            throw new Error("Business associated with this link not found.");
        }
        
        // You might want to add a check here to see if the business already has an ownerId
        if (business.ownerId) {
            // "This business has already been claimed."
            throw new Error("alreadyClaimed");
        }

        return business;
    } catch (error: any) {
        console.error('[OnboardingAction] Token validation failed:', error.message);
        // Provide user-friendly error messages
        if (error.name === 'TokenExpiredError') {
            // "This invitation link has expired. Please request a new one."
            throw new Error("expiredLink");
        }
        if (error.name === 'JsonWebTokenError') {
             // "This invitation link is invalid or has been tampered with."
            throw new Error("invalidLink");
        }
        throw error; // Re-throw other errors
    }
}


/**
 * Sends an onboarding invitation email to a potential business owner.
 * This function uses the Firebase "Trigger Email" extension.
 */
const SendEmailInputSchema = z.object({
  recipientEmail: z.string().email(),
  onboardingLink: z.string().url(),
  businessName: z.string(),
  planName: z.string(),
});
type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendOnboardingEmail(input: SendEmailInput): Promise<{ success: boolean; message: string; }> {
    const { recipientEmail, onboardingLink, businessName, planName } = SendEmailInputSchema.parse(input);

    const mailCollection = firestore.collection('mail');
    
    const emailDocument = {
      to: [recipientEmail],
      message: {
        subject: `Invitación para gestionar ${businessName}`,
        html: createInvitationEmailHtml({ onboardingLink, businessName, planName }),
      },
    };

    try {
      await mailCollection.add(emailDocument);
      console.log(`[OnboardingAction] Invitation email document created for ${recipientEmail}.`);
      return { success: true, message: "Email de invitación enviado correctamente." };
    } catch (error: any) {
        console.error("[OnboardingAction] Failed to create email document:", error);
        return { success: false, message: "No se pudo enviar el email. Por favor, inténtalo de nuevo." };
    }
}

function createInvitationEmailHtml({ onboardingLink, businessName, planName }: Omit<SendEmailInput, 'recipientEmail'>): string {
  const brandName = "Local Digital Eye";
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/local-digital-eye.firebasestorage.app/o/public%2Fimages%2Fds.png?alt=media&token=d12ae2c6-310e-4044-bc9b-77d60b6fe4cf";
  
  return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; padding: 30px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.07); }
              .header { text-align: center; border-bottom: 1px solid #eaeaea; padding-bottom: 20px; margin-bottom: 20px; }
              .header img { max-width: 150px; }
              .content { font-size: 16px; }
              .content h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 15px; }
              .content p { margin-bottom: 15px; }
              .business-info { background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee; }
              .button-container { text-align: center; margin-top: 30px; }
              .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
              .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header"><img src="${logoUrl}" alt="${brandName} Logo"></div>
              <div class="content">
                  <h1>¡Estás a un paso de potenciar tu negocio!</h1>
                  <p>Hola,</p>
                  <p>Has sido invitado a unirte a la plataforma <strong>${brandName}</strong> para tomar el control de la presencia online de tu negocio.</p>
                  <div class="business-info">
                      <strong>Negocio:</strong> ${businessName}<br>
                      <strong>Plan de Invitación:</strong> ${planName}
                  </div>
                  <p>Para empezar, solo tienes que crear tu cuenta a través del siguiente enlace seguro:</p>
                  <div class="button-container">
                      <a href="${onboardingLink}" class="button">Crear Cuenta y Conectar</a>
                  </div>
                  <p style="margin-top: 30px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
                  <p>Atentamente,<br>El equipo de ${brandName}</p>
              </div>
              <div class="footer">
                  <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
              </div>
          </div>
      </body>
      </html>
  `;
}

    