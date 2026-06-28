import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let initialized = false;

function ensureAdminApp() {
  if (initialized) return;

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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
