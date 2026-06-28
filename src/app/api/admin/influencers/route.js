import { verifyAdminRequest } from "@/lib/server/auth";
import { jsonError, jsonOk } from "@/lib/server/api-response";
import {
  validateImageFile,
  validateInfluencerFields,
  sanitizeInfluencerInput,
} from "@/lib/server/validation";
import {
  listAllInfluencersServer,
  listInfluencersByStatusServer,
  createInfluencerServer,
  uploadProfileImageServer,
} from "@/lib/server/influencers-service";

/** GET /api/admin/influencers?status=pending|approved */
export async function GET(request) {
  const auth = await verifyAdminRequest(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (status === "pending" || status === "approved") {
      return jsonOk(await listInfluencersByStatusServer(status));
    }

    return jsonOk(await listAllInfluencersServer());
  } catch (error) {
    console.error("GET /api/admin/influencers:", error);
    return jsonError("Failed to load influencers", 500);
  }
}

/** POST /api/admin/influencers — manual add (approved) */
export async function POST(request) {
  const auth = await verifyAdminRequest(request);
  if (auth.error) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("profilePic");

    const payload = {
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
      status: "approved",
    };

    const imageError = validateImageFile(file);
    if (imageError) return jsonError(imageError, 400);

    payload.profilePicUrl = await uploadProfileImageServer(file);

    const fieldErrors = validateInfluencerFields(payload, { requireImage: true });
    if (fieldErrors.length) return jsonError(fieldErrors.join(", "), 400);

    const id = await createInfluencerServer(sanitizeInfluencerInput(payload));
    return jsonOk({ id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/influencers:", error);
    return jsonError("Failed to create influencer", 500);
  }
}
