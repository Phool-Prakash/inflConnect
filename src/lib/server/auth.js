import "server-only";
import { verifyFirebaseIdToken } from "@/lib/server/verify-id-token";
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

  const token = header.slice(7);
  try {
    const decoded = await verifyFirebaseIdToken(token);
    if (!isAdminEmailServer(decoded.email)) {
      return {
        error: jsonError(
          `Forbidden: ${decoded.email} is not in the admin list. Set ADMIN_EMAILS or NEXT_PUBLIC_ADMIN_EMAILS on Vercel and redeploy.`,
          403
        ),
      };
    }
    return { user: decoded };
  } catch (err) {
    console.error("verifyFirebaseIdToken:", err?.message);
    return {
      error: jsonError(
        err?.message?.includes("API_KEY")
          ? "NEXT_PUBLIC_FIREBASE_API_KEY missing on Vercel. Redeploy after adding it."
          : "Invalid or expired login token. Sign out, sign in again, and ensure infl-connect.vercel.app is in Firebase Auth authorized domains.",
        401
      ),
    };
  }
}
