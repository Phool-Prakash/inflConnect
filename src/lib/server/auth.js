import "server-only";
import { getAdminAuth } from "@/lib/server/firebase-admin";
import { isAdminEmailServer } from "@/lib/server/admin-emails";
import { jsonError } from "@/lib/server/api-response";

export async function verifyAdminRequest(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return { error: jsonError("Unauthorized", 401) };
  }

  let auth;
  try {
    auth = await getAdminAuth();
  } catch {
    return { error: jsonError("Server configuration error", 503) };
  }

  const token = header.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    if (!isAdminEmailServer(decoded.email)) {
      return { error: jsonError("Forbidden", 403) };
    }
    return { user: decoded };
  } catch {
    return { error: jsonError("Invalid or expired token", 401) };
  }
}
