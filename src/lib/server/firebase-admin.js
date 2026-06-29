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

  if (
    key.includes("-----BEGIN PRIVATE KEY-----") &&
    key.includes("-----END PRIVATE KEY-----")
  ) {
    const body = key
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s+/g, "");
    const lines = body.match(/.{1,64}/g) || [];
    if (lines.length > 0) {
      key = `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----\n`;
    }
  }

  return key;
}

function parseServiceAccountJson(jsonRaw) {
  const cred = JSON.parse(jsonRaw);
  if (!cred.project_id || !cred.client_email || !cred.private_key) {
    return null;
  }
  return {
    projectId: cred.project_id,
    clientEmail: cred.client_email,
    privateKey: normalizePrivateKey(cred.private_key),
  };
}

function resolveAdminCredentials() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (b64) {
    try {
      const parsed = parseServiceAccountJson(
        Buffer.from(b64, "base64").toString("utf8")
      );
      if (parsed) return parsed;
    } catch {
      console.warn("FIREBASE_SERVICE_ACCOUNT_BASE64 is invalid.");
    }
  }

  const jsonRaw =
    process.env.FIREBASE_SERVICE_ACCOUNT?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.trim();

  if (jsonRaw && jsonRaw !== "{}") {
    try {
      const parsed = parseServiceAccountJson(jsonRaw);
      if (parsed) return parsed;
    } catch {
      console.warn(
        "FIREBASE_SERVICE_ACCOUNT is invalid JSON; falling back to FIREBASE_* vars."
      );
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
    const { projectId, clientEmail, privateKey } = resolveAdminCredentials();

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
  await ensureAdminApp();
  const { getFirestore } = await import("firebase-admin/firestore");
  return getFirestore();
}

async function getAdminAuth() {
  await ensureAdminApp();
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth();
}

async function getAdminStorage() {
  await ensureAdminApp();
  const { getStorage } = await import("firebase-admin/storage");
  return getStorage();
}

export { getAdminDb, getAdminAuth, getAdminStorage, ensureAdminApp, resolveAdminCredentials };
