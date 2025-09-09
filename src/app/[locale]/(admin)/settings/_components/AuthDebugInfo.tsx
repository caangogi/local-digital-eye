
"use client";

import { useAuth } from '@/hooks/useAuth';
import { DebugCollapse } from '@/components/dev/DebugCollapse';

export function AuthDebugInfo() {
  const { user, firebaseUser } = useAuth();

  // Create a serializable version of the firebaseUser object
  const serializableFirebaseUser = firebaseUser ? {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    providerData: firebaseUser.providerData.map(p => ({
      providerId: p.providerId,
      uid: p.uid,
      displayName: p.displayName,
      email: p.email,
      photoURL: p.photoURL,
    })),
    metadata: {
      creationTime: firebaseUser.metadata.creationTime,
      lastSignInTime: firebaseUser.metadata.lastSignInTime,
    }
  } : null;

  return (
    <div className="space-y-4">
      <DebugCollapse title="Auth Profile (Firebase Auth)" data={serializableFirebaseUser} />
      <DebugCollapse title="User Profile (Firestore)" data={user} />
    </div>
  );
}
