// src/lib/firebase/firebase-admin-config.ts
import admin, { App } from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is a singleton pattern to ensure we only initialize Firebase Admin once.
let app: App;

function getFirebaseAdminApp(): App {
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
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch(error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's a valid JSON string.", error);
    throw new Error("Failed to initialize Firebase Admin SDK.");
  }


  console.log('Firebase Admin SDK initialized successfully.');
  return app;
}

// Export a single instance of the initialized app
export const firebaseAdminApp = getFirebaseAdminApp();
export const firestore = getFirebaseAdminApp().firestore();
export const auth = getFirebaseAdminApp().auth();
