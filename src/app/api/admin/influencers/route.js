import { verifyAdminRequest } from "@/lib/server/auth";
import { getAdminEmails } from "@/lib/server/admin-emails";
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
  updateInfluencerServer,
  uploadProfileImageServer,
  logOnboardingFailure,
} from "@/lib/server/influencers-service";

/** GET /api/admin/influencers?status=pending|approved */
export async function GET(request) {
  if (getAdminEmails().length === 0) {
    return jsonError(
      "Admin emails not configured. Set ADMIN_EMAILS or NEXT_PUBLIC_ADMIN_EMAILS on Vercel and redeploy.",
      503
    );
  }

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
      facebook: String(formData.get("facebook") || ""),
      niche: String(formData.get("niche") || ""),
      state: String(formData.get("state") || ""),
      city: String(formData.get("city") || ""),
      followerCount: String(formData.get("followerCount") || ""),
      bio: String(formData.get("bio") || ""),
      status: "approved",
      profilePicUrl: "",
    };

    const fieldErrors = validateInfluencerFields(payload, { requireImage: false });
    if (fieldErrors.length) {
      console.warn("POST /api/admin/influencers validation:", fieldErrors.join(", "));
      await logOnboardingFailure(payload, fieldErrors, {
        stage: "admin_field_validation",
      });
      return jsonError(fieldErrors.join(", "), 400);
    }

    const sanitized = sanitizeInfluencerInput(payload);
    sanitized.profilePicUrl = "";
    const id = await createInfluencerServer(sanitized);

    const imageError = validateImageFile(file);
    if (imageError) {
      console.warn("POST /api/admin/influencers image:", imageError, { id });
      return jsonOk(
        { id, imageSaved: false, warning: imageError },
        { status: 201 }
      );
    }

    try {
      const profilePicUrl = await uploadProfileImageServer(file);
      await updateInfluencerServer(id, { profilePicUrl });
      return jsonOk({ id, imageSaved: true }, { status: 201 });
    } catch (uploadError) {
      console.error("POST /api/admin/influencers image upload:", uploadError, { id });
      return jsonOk(
        { id, imageSaved: false, warning: "Influencer saved but image upload failed." },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST /api/admin/influencers:", error);
    return jsonError("Failed to create influencer", 500);
  }
}
