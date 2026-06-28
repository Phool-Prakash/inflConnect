import { verifyAdminRequest } from "@/lib/server/auth";
import { jsonError, jsonOk } from "@/lib/server/api-response";
import { bulkApproveServer, bulkDeleteServer } from "@/lib/server/influencers-service";

/** POST /api/admin/influencers/bulk — { action: "approve"|"delete", ids: string[] } */
export async function POST(request) {
  const auth = await verifyAdminRequest(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return jsonError("ids array is required", 400);
    }
    if (ids.length > 50) {
      return jsonError("Maximum 50 items per bulk action", 400);
    }

    if (action === "approve") {
      await bulkApproveServer(ids);
      return jsonOk({ approved: ids.length });
    }

    if (action === "delete") {
      await bulkDeleteServer(ids);
      return jsonOk({ deleted: ids.length });
    }

    return jsonError("Invalid action", 400);
  } catch (error) {
    console.error("POST /api/admin/influencers/bulk:", error);
    return jsonError("Bulk action failed", 500);
  }
}
