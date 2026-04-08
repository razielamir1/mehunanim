// Firebase client — Magic Link auth + Firestore profile sync.
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

const env = (import.meta as any).env || {};
const config = {
  apiKey: env.VITE_FB_API_KEY,
  authDomain: env.VITE_FB_AUTH_DOMAIN,
  projectId: env.VITE_FB_PROJECT_ID,
  storageBucket: env.VITE_FB_STORAGE_BUCKET,
  appId: env.VITE_FB_APP_ID,
};

export const isFirebaseConfigured = !!config.apiKey;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}

const EMAIL_KEY = 'mehunanim-pending-email';

// ---- Auth ----

export async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!auth) return { ok: false, error: 'firebase-not-configured' };
  try {
    const url = `${window.location.origin}/login?finish=1`;
    await sendSignInLinkToEmail(auth, email, {
      url,
      handleCodeInApp: true,
    });
    window.localStorage.setItem(EMAIL_KEY, email);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.code || 'send-failed' };
  }
}

export function isMagicLinkInUrl(): boolean {
  if (!auth) return false;
  return isSignInWithEmailLink(auth, window.location.href);
}

export async function completeMagicLinkSignIn(): Promise<{ user: User | null; error?: string }> {
  if (!auth) return { user: null, error: 'firebase-not-configured' };
  if (!isSignInWithEmailLink(auth, window.location.href)) return { user: null };
  let email = window.localStorage.getItem(EMAIL_KEY);
  if (!email) {
    email = window.prompt('הזן את האימייל לאישור הכניסה') || '';
    if (!email) return { user: null, error: 'no-email' };
  }
  try {
    const cred = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_KEY);
    return { user: cred.user };
  } catch (e: any) {
    return { user: null, error: e?.code || 'sign-in-failed' };
  }
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await fbSignOut(auth);
}

export function onAuth(cb: (user: User | null) => void): () => void {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, cb);
}

export function getCurrentUser(): User | null {
  return auth?.currentUser ?? null;
}

// ---- Firestore: profile sync ----

const userDocPath = (uid: string) => `users/${uid}`;

export type SyncPayload = {
  profiles: unknown[];
  activeProfileId: string;
  updatedAt: number;
};

export async function syncProfilesUp(uid: string, payload: SyncPayload): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: 'firebase-not-configured' };
  try {
    await setDoc(doc(db, userDocPath(uid)), payload, { merge: true });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.code || 'sync-up-failed' };
  }
}

export async function syncProfilesDown(uid: string): Promise<SyncPayload | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, userDocPath(uid)));
    if (!snap.exists()) return null;
    return snap.data() as SyncPayload;
  } catch {
    return null;
  }
}
