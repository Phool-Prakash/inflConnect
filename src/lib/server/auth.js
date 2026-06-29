import "server-only";
import { getAdminAuth } from "@/lib/server/firebase-admin";
import { getAdminEmails, isAdminEmailServer } from "@/lib/server/admin-emails";
import { jsonError } from "@/lib/server/api-response";

export async function verifyAdminRequest(request) {
  if (getAdminEmails().length === 0) {
    return {
      error: jsonError(
        "Admin emails not configured on server. Set ADMIN_EMAILS=phoolprakash62@gmail.com on Vercel and redeploy.",
        503
      ),
    };
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return { error: jsonError("Unauthorized", 401) };
  }

  let auth;
  try {
    auth = await getAdminAuth();
  } catch (err) {
    console.error("getAdminAuth:", err?.message);
    return {
      error: jsonError(
        err?.message?.includes("not configured")
          ? "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64 on Vercel and redeploy."
          : `Firebase Admin Auth error: ${err?.message || "unknown"}. Check FIREBASE_SERVICE_ACCOUNT_BASE64 on Vercel.`,
        503
      ),
    };
  }

  const token = header.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    if (!isAdminEmailServer(decoded.email)) {
      return {
        error: jsonError(
          `Forbidden: ${decoded.email} is not in the admin list. Set ADMIN_EMAILS or NEXT_PUBLIC_ADMIN_EMAILS on Vercel (e.g. phoolprakash62@gmail.com) and redeploy.`,
          403
        ),
      };
    }
    return { user: decoded };
  } catch (err) {
    console.error("verifyIdToken:", err?.message);
    return {
      error: jsonError(
        "Invalid or expired login token. Sign out, sign in again, and ensure infl-connect.vercel.app is in Firebase Auth authorized domains.",
        401
      ),
    };
  }
}
