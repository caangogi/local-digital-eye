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

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Important: Replace escaped newlines
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    throw new Error('Firebase Admin environment variables are not set. Check your .env.local file and your hosting provider\'s environment variable settings.');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('Firebase Admin SDK initialized successfully.');
  return app;
}

// Export a single instance of the initialized app
export const firebaseAdminApp = getFirebaseAdminApp();
export const firestore = getFirebaseAdminApp().firestore();
export const auth = getFirebaseAdminApp().auth();
