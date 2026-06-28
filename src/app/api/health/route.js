import { jsonOk, jsonError } from "@/lib/server/api-response";
import { getAdminDb } from "@/lib/server/firebase-admin";

/** GET /api/health — check Firebase Admin connectivity (for deploy debugging) */
export async function GET() {
  const hasEnv =
    Boolean(process.env.FIREBASE_PROJECT_ID) &&
    Boolean(process.env.FIREBASE_CLIENT_EMAIL) &&
    Boolean(process.env.FIREBASE_PRIVATE_KEY);

  if (!hasEnv) {
    return jsonError("Firebase Admin env vars missing", 503, {
      firebase: "missing_env",
      hint: "Add FIREBASE_* vars on Vercel, then Redeploy.",
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
    });
  }
}
