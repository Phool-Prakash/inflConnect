import "server-only";

let initPromise = null;

function normalizePrivateKey(raw) {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n");

  // Vercel often stores the PEM as one line — re-wrap for OpenSSL
  if (
    key.includes("-----BEGIN PRIVATE KEY-----") &&
    key.includes("-----END PRIVATE KEY-----") &&
    !key.includes("\n")
  ) {
    const body = key
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s+/g, "");
    const lines = body.match(/.{1,64}/g) || [];
    key = `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----\n`;
  }

  return key;
}

function resolveAdminCredentials() {
  const jsonRaw =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (jsonRaw) {
    try {
      const cred = JSON.parse(jsonRaw);
      return {
        projectId: cred.project_id,
        clientEmail: cred.client_email,
        privateKey: normalizePrivateKey(cred.private_key),
      };
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON.");
    }
  }

  return {
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  };
}

async function ensureAdminApp() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let credentials;
    try {
      credentials = resolveAdminCredentials();
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON.");
    }

    const { projectId, clientEmail, privateKey } = credentials;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Firebase Admin SDK is not configured.");
    }

    const { initializeApp, getApps, cert } = await import("firebase-admin/app");

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  })();

  try {
    await initPromise;
  } catch (error) {
    initPromise = null;
    throw error;
  }
}

async function getAdminDb() {
  try {
    await ensureAdminApp();
    const { getFirestore } = await import("firebase-admin/firestore");
    return getFirestore();
  } catch (error) {
    console.error("getAdminDb:", error.message);
    return null;
  }
}

async function getAdminAuth() {
  try {
    await ensureAdminApp();
    const { getAuth } = await import("firebase-admin/auth");
    return getAuth();
  } catch (error) {
    console.error("getAdminAuth:", error.message);
    return null;
  }
}

async function getAdminStorage() {
  try {
    await ensureAdminApp();
    const { getStorage } = await import("firebase-admin/storage");
    return getStorage();
  } catch (error) {
    console.error("getAdminStorage:", error.message);
    return null;
  }
}

export { getAdminDb, getAdminAuth, getAdminStorage, ensureAdminApp, resolveAdminCredentials };
