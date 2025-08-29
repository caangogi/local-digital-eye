import type { Feedback } from '@/backend/feedback/domain/feedback.entity';
import type { UserRepositoryPort } from '@/backend/user/domain/user.repository.port';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';
import { firestore } from '@/lib/firebase/firebase-admin-config';

/**
 * @fileoverview Defines the use case for notifying a business owner of new negative feedback.
 * This use case creates a document in a specific Firestore collection that is monitored
 * by the "Trigger Email" Firebase Extension.
 */

export class NotifyOwnerOfNegativeFeedbackUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly businessRepository: BusinessRepositoryPort
  ) {}

  /**
   * Executes the use case.
   * @param feedback The feedback object that triggered the notification.
   */
  async execute(feedback: Feedback): Promise<void> {
    console.log(`[NotifyOwnerUseCase] Starting notification process for feedback ${feedback.id}`);

    // 1. Get the business to find the owner's userId
    const business = await this.businessRepository.findById(feedback.businessId);
    if (!business) {
      throw new Error(`Business with ID ${feedback.businessId} not found.`);
    }

    // 2. Get the user (business owner) to find their email
    const user = await this.userRepository.findById(business.userId);
    if (!user || !user.email) {
      throw new Error(`Owner (User ID: ${business.userId}) for business ${business.id} not found or has no email.`);
    }

    // 3. Create the email document in the 'mail' collection
    // The "Trigger Email" extension will be listening to this collection.
    const mailCollection = firestore.collection('mail');
    
    const emailDocument = {
      to: [user.email],
      message: {
        subject: `Nueva opinión de ${feedback.rating} estrellas para ${feedback.businessName}`,
        html: this.createEmailHtml(feedback),
      },
    };

    await mailCollection.add(emailDocument);
    console.log(`[NotifyOwnerUseCase] Email document created in 'mail' collection for user ${user.email}.`);
  }

  /**
   * Creates the HTML content for the notification email.
   * @param feedback The feedback object.
   * @returns A string containing the HTML for the email body.
   */
  private createEmailHtml(feedback: Feedback): string {
    const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
    const customerName = feedback.userName || 'un cliente';
    const customerContact = feedback.userEmail ? `(${feedback.userEmail})` : '';

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                .header { background-color: #f8f8f8; padding: 10px; border-bottom: 1px solid #ddd; text-align: center; }
                .header h1 { margin: 0; color: #d9534f; }
                .content { padding: 20px 0; }
                .rating { font-size: 24px; color: #ffcc00; }
                .comment { background-color: #f9f9f9; border-left: 4px solid #d9534f; padding: 15px; margin-top: 15px; }
                .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Atención! Nueva Opinión Negativa</h1>
                </div>
                <div class="content">
                    <p>Hola,</p>
                    <p>Has recibido una nueva opinión para tu negocio <strong>${feedback.businessName}</strong> que requiere tu atención.</p>
                    <p><strong>Calificación:</strong> <span class="rating">${stars}</span> (${feedback.rating}/5)</p>
                    <p><strong>De:</strong> ${customerName} ${customerContact}</p>
                    <div class="comment">
                        <p><strong>Comentario:</strong></p>
                        <p><em>"${feedback.comment}"</em></p>
                    </div>
                    <p>Te recomendamos gestionar esta opinión lo antes posible para mantener una buena reputación online.</p>
                    <p>Atentamente,<br>El equipo de Local Digital Eye</p>
                </div>
                <div class="footer">
                    <p>Este es un email automático. Por favor, no respondas a esta dirección.</p>
                </div>
            </div>
        </body>
        </html>
    `;
  }
}
