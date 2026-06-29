import { jsonOk, jsonError } from "@/lib/server/api-response";
import { getAdminDb, resolveAdminCredentials } from "@/lib/server/firebase-admin";

/** GET /api/health — check Firebase Admin connectivity (for deploy debugging) */
export async function GET() {
  const credentials = resolveAdminCredentials();

  const envStatus = {
    FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: Boolean(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ),
    FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    FIREBASE_SERVICE_ACCOUNT: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
  };

  const hasEnv = Boolean(
    credentials.projectId && credentials.clientEmail && credentials.privateKey
  );

  if (!hasEnv) {
    return jsonError("Firebase Admin env vars missing", 503, {
      firebase: "missing_env",
      env: envStatus,
      hint: "Add FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY on Vercel (Production enabled), OR paste full service-account JSON as FIREBASE_SERVICE_ACCOUNT. Then Redeploy.",
    });
  }

  try {
    const db = await getAdminDb();
    if (!db) {
      return jsonError("Firebase Admin failed to initialize", 503, {
        firebase: "init_failed",
        hint: "Check FIREBASE_PRIVATE_KEY format (no extra quotes; use \\n for newlines). Redeploy after fixing.",
      });
    }

    await db.collection("influencers").limit(1).get();
    return jsonOk({ firebase: "ok" });
  } catch (error) {
    console.error("GET /api/health:", error);
    return jsonError(error.message || "Firebase query failed", 500, {
      firebase: "query_failed",
      hint: error.message?.includes("UNAUTHENTICATED")
        ? "FIREBASE_PRIVATE_KEY is invalid or truncated on Vercel. Re-paste as multiline PEM, or use FIREBASE_SERVICE_ACCOUNT (full JSON file)."
        : undefined,
    });
  }
}
