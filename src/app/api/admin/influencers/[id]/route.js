import { STATUSES } from "@/lib/constants";
import { verifyAdminRequest } from "@/lib/server/auth";
import { jsonError, jsonOk } from "@/lib/server/api-response";
import {
  validateImageFile,
  validateInfluencerFields,
  sanitizeInfluencerInput,
} from "@/lib/server/validation";
import {
  getInfluencerServer,
  updateInfluencerServer,
  deleteInfluencerServer,
  uploadProfileImageServer,
} from "@/lib/server/influencers-service";

/** GET /api/admin/influencers/[id] */
export async function GET(request, { params }) {
  const auth = await verifyAdminRequest(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const influencer = await getInfluencerServer(id, { admin: true });
    if (!influencer) return jsonError("Not found", 404);
    return jsonOk(influencer);
  } catch (error) {
    console.error("GET /api/admin/influencers/[id]:", error);
    return jsonError("Failed to fetch influencer", 500);
  }
}

/** PATCH /api/admin/influencers/[id] */
export async function PATCH(request, { params }) {
  const auth = await verifyAdminRequest(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    let updates = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("profilePic");

      updates = {
        fullName: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        instagram: String(formData.get("instagram") || ""),
        youtube: String(formData.get("youtube") || ""),
        niche: String(formData.get("niche") || ""),
        state: String(formData.get("state") || ""),
        city: String(formData.get("city") || ""),
        followerCount: String(formData.get("followerCount") || ""),
        bio: String(formData.get("bio") || ""),
        status: String(formData.get("status") || ""),
        profilePicUrl: String(formData.get("existingProfilePicUrl") || ""),
      };

      if (file && typeof file !== "string") {
        const imageError = validateImageFile(file);
        if (imageError) return jsonError(imageError, 400);
        updates.profilePicUrl = await uploadProfileImageServer(file);
      }
    } else {
      const body = await request.json();

      if (body.status && Object.keys(body).length === 1) {
        if (!STATUSES.includes(body.status)) {
          return jsonError("invalid status", 400);
        }
        await updateInfluencerServer(id, { status: body.status });
        return jsonOk({ id });
      }

      updates = { ...body };
    }

    const fieldErrors = validateInfluencerFields(updates, {
      requireImage: Boolean(updates.profilePicUrl),
    });
    if (fieldErrors.length) return jsonError(fieldErrors.join(", "), 400);

    await updateInfluencerServer(id, sanitizeInfluencerInput(updates));
    return jsonOk({ id });
  } catch (error) {
    console.error("PATCH /api/admin/influencers/[id]:", error);
    return jsonError("Failed to update influencer", 500);
  }
}

/** DELETE /api/admin/influencers/[id] */
export async function DELETE(request, { params }) {
  const auth = await verifyAdminRequest(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await deleteInfluencerServer(id);
    return jsonOk({ id });
  } catch (error) {
    console.error("DELETE /api/admin/influencers/[id]:", error);
    return jsonError("Failed to delete influencer", 500);
  }
}
