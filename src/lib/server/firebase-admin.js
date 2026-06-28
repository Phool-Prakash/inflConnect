import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let initialized = false;

function normalizePrivateKey(raw) {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function ensureAdminApp() {
  if (initialized) return;

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Firebase Admin SDK is not configured.");
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  initialized = true;
}

function getAdminDb() {
  try {
    ensureAdminApp();
    return getFirestore();
  } catch {
    return null;
  }
}

function getAdminAuth() {
  try {
    ensureAdminApp();
    return getAuth();
  } catch {
    return null;
  }
}

function getAdminStorage() {
  try {
    ensureAdminApp();
    return getStorage();
  } catch {
    return null;
  }
}

export { getAdminDb, getAdminAuth, getAdminStorage, ensureAdminApp };
