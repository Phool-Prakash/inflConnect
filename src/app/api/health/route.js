import { jsonOk, jsonError } from "@/lib/server/api-response";
import {
  getAdminDb,
  getAdminAuth,
  resolveAdminCredentials,
} from "@/lib/server/firebase-admin";
import { getAdminEmails } from "@/lib/server/admin-emails";

/** GET /api/health — check Firebase Admin connectivity (for deploy debugging) */
export async function GET() {
  const credentials = resolveAdminCredentials();

  const envStatus = {
    FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
    FIREBASE_SERVICE_ACCOUNT_BASE64: Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    ),
    FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    ADMIN_EMAILS: Boolean(process.env.ADMIN_EMAILS),
    NEXT_PUBLIC_ADMIN_EMAILS: Boolean(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
    adminEmailsConfigured: getAdminEmails().length > 0,
  };

  const hasEnv = Boolean(
    credentials.projectId && credentials.clientEmail && credentials.privateKey
  );

  if (!hasEnv) {
    return jsonError("Firebase Admin env vars missing", 503, {
      firebase: "missing_env",
      env: envStatus,
      hint: "Set FIREBASE_SERVICE_ACCOUNT_BASE64 on Vercel (recommended), then Redeploy.",
    });
  }

  try {
    const db = await getAdminDb();
    await db.collection("influencers").limit(1).get();

    const auth = await getAdminAuth();
    if (!auth) {
      return jsonError("Firebase Admin Auth module failed to load", 503, {
        firebase: "auth_failed",
        env: envStatus,
      });
    }

    return jsonOk({
      firebase: "ok",
      auth: "ok",
      adminEmails: getAdminEmails(),
      env: envStatus,
    });
  } catch (error) {
    console.error("GET /api/health:", error);
    return jsonError(error.message || "Firebase query failed", 500, {
      firebase: "query_failed",
      env: envStatus,
      hint: error.message?.includes("UNAUTHENTICATED")
        ? "Invalid Firebase credentials on Vercel. Use FIREBASE_SERVICE_ACCOUNT_BASE64."
        : undefined,
    });
  }
}
