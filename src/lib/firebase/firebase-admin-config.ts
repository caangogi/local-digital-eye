// src/lib/firebase/firebase-admin-config.ts
import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env.local RIGHT before they are needed.
config({ path: '.env.local' });

// This is a singleton pattern to ensure we only initialize Firebase Admin once.
let app: admin.app.App;

function getFirebaseAdminApp(): admin.app.App {
  if (app) {
    return app;
  }

  // On server-side, it's safe to check if any app exists.
  if (admin.apps.length > 0) {
    app = admin.app();
    return app;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountJson) {
      throw new Error('Firebase Admin environment variable "FIREBASE_SERVICE_ACCOUNT_KEY" is not set. This should contain the entire service account JSON object. Check your .env.local file and your hosting provider\'s environment variable settings.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Failed to parse or use FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
    throw new Error('Could not initialize Firebase Admin SDK. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is a valid JSON string.');
  }


  console.log('Firebase Admin SDK initialized successfully.');
  return app;
}

// Export a single instance of the initialized app
export const firebaseAdminApp = getFirebaseAdminApp();
export const firestore = getFirebaseAdminApp().firestore();
export const auth = getFirebaseAdminApp().auth();
