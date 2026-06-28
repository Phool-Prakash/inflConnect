import "server-only";
import { NICHES, STATUSES, EMAIL_REGEX } from "@/lib/constants";
import { isValidState, isValidCity } from "@/lib/data/india-locations";
import { buildYouTubeUrl, isValidYouTubeInput } from "@/lib/youtube";
import { buildInstagramUrl, isValidInstagramInput } from "@/lib/instagram";
import { normalizePhone, isValidPhone } from "@/lib/phone";

function normalizeYouTubeField(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";
  return buildYouTubeUrl(trimmed) || "";
}

function normalizeInstagramField(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";
  return buildInstagramUrl(trimmed) || "";
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateInfluencerFields(data, { requireImage = false } = {}) {
  const errors = [];

  if (!data.fullName?.trim()) errors.push("fullName is required");
  if (!data.email?.trim()) errors.push("email is required");
  else if (!EMAIL_REGEX.test(data.email.trim())) errors.push("invalid email");
  if (!data.phone?.trim()) errors.push("phone is required");
  else if (!isValidPhone(data.phone)) errors.push("invalid phone");
  if (!data.instagram?.trim()) errors.push("instagram is required");
  else if (!isValidInstagramInput(data.instagram)) errors.push("invalid instagram");
  if (!data.niche || !NICHES.includes(data.niche)) errors.push("invalid niche");
  if (!data.state || !isValidState(data.state)) errors.push("invalid state");
  if (!data.city || !isValidCity(data.state, data.city)) errors.push("invalid city");
  const fc = data.followerCount;
  if (
    fc != null &&
    fc !== "" &&
    (isNaN(Number(fc)) || Number(fc) < 0)
  ) {
    errors.push("invalid followerCount");
  }
  if (!data.bio?.trim()) errors.push("bio is required");
  else if (data.bio.trim().length > 200) errors.push("bio too long");
  if (data.status && !STATUSES.includes(data.status)) errors.push("invalid status");
  if (requireImage && !data.profilePicUrl) errors.push("profile picture is required");
  const youtubeRaw = (data.youtube ?? data.tiktokYoutube ?? "").trim();
  if (youtubeRaw && !isValidYouTubeInput(youtubeRaw)) errors.push("invalid youtube");

  return errors;
}

export function validateImageFile(file) {
  if (!file || typeof file === "string") return "profile picture is required";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "image must be JPG, PNG, or WebP";
  }
  if (file.size > MAX_IMAGE_SIZE) return "image must be under 10MB";
  return null;
}

export function sanitizeInfluencerInput(data) {
  return {
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: normalizePhone(data.phone),
    instagram: normalizeInstagramField(data.instagram),
    youtube: normalizeYouTubeField(data.youtube ?? data.tiktokYoutube),
    niche: data.niche,
    state: data.state,
    city: data.city,
    followerCount:
      data.followerCount != null && data.followerCount !== "" && !isNaN(Number(data.followerCount))
        ? Number(data.followerCount)
        : null,
    bio: data.bio.trim(),
    profilePicUrl: data.profilePicUrl,
    status: data.status,
  };
}
