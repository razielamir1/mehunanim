// Firebase scaffold for cross-device profile sync.
// To enable:
// 1. Create a project at https://console.firebase.google.com
// 2. Add a Web App, copy the config object
// 3. Create .env.local with VITE_FB_API_KEY, VITE_FB_AUTH_DOMAIN, VITE_FB_PROJECT_ID,
//    VITE_FB_STORAGE_BUCKET, VITE_FB_APP_ID
// 4. In Authentication → Sign-in method, enable "Email link (passwordless sign-in)"
// 5. In Firestore Database, create a database (start in test mode for now)
// 6. Run: npm install firebase
// 7. Uncomment the imports below

// import { initializeApp, FirebaseApp } from 'firebase/app';
// import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut, onAuthStateChanged, User } from 'firebase/auth';
// import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

const env = (import.meta as any).env || {};
const config = {
  apiKey: env.VITE_FB_API_KEY,
  authDomain: env.VITE_FB_AUTH_DOMAIN,
  projectId: env.VITE_FB_PROJECT_ID,
  storageBucket: env.VITE_FB_STORAGE_BUCKET,
  appId: env.VITE_FB_APP_ID,
};

export const isFirebaseConfigured = !!config.apiKey;

// Stubbed exports — replace with real Firebase client when configured
export async function sendMagicLink(_email: string): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured) return { ok: false, error: 'firebase-not-configured' };
  // TODO: real implementation once firebase package is installed
  return { ok: false, error: 'not-implemented' };
}

export async function completeSignIn(): Promise<{ user: any | null }> {
  if (!isFirebaseConfigured) return { user: null };
  return { user: null };
}

export async function signOutUser(): Promise<void> {
  if (!isFirebaseConfigured) return;
}

export async function syncProfilesUp(_userId: string, _profiles: unknown): Promise<void> {
  if (!isFirebaseConfigured) return;
}

export async function syncProfilesDown(_userId: string): Promise<unknown | null> {
  if (!isFirebaseConfigured) return null;
}
