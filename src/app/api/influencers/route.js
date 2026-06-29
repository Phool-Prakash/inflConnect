import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/server/rate-limit";
import { jsonError, jsonOk, withCache } from "@/lib/server/api-response";
import {
  validateImageFile,
  validateInfluencerFields,
  sanitizeInfluencerInput,
} from "@/lib/server/validation";
import {
  listApprovedInfluencersServer,
  createInfluencerServer,
  uploadProfileImageServer,
  toPublicInfluencer,
} from "@/lib/server/influencers-service";

/** GET /api/influencers?city=Mumbai — public approved list */
export async function GET(request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`public-list:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!rl.allowed) {
    return jsonError("Too many requests", 429, { retryAfterMs: rl.retryAfterMs });
  }

  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const data = await listApprovedInfluencersServer({ city });
    const res = jsonOk(data.map(toPublicInfluencer));
    return withCache(res, 60);
  } catch (error) {
    console.error("GET /api/influencers:", error);
    return jsonError("Failed to fetch influencers", 500);
  }
}

/** POST /api/influencers — public onboarding (pending) */
export async function POST(request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`onboard:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return jsonError("Too many submissions. Please try again later.", 429);
  }

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
      status: "pending",
    };

    const imageError = validateImageFile(file);
    if (imageError) return jsonError(imageError, 400);

    const profilePicUrl = await uploadProfileImageServer(file);
    payload.profilePicUrl = profilePicUrl;

    const fieldErrors = validateInfluencerFields(payload, { requireImage: true });
    if (fieldErrors.length) return jsonError(fieldErrors.join(", "), 400);

    const id = await createInfluencerServer(sanitizeInfluencerInput(payload));
    return jsonOk({ id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/influencers:", error);
    return jsonError("Failed to submit profile", 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
