import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

/** Infer extension from filename (mobile browsers may omit MIME type). */
export function getImageExtension(filename) {
  const ext = (filename || "").split(".").pop()?.toLowerCase() || "";
  return ext === "jpeg" ? "jpg" : ext;
}

/** MIME from extension when the browser sends an empty file.type. */
export function mimeFromExtension(filename) {
  const ext = getImageExtension(filename);
  if (ext === "jpg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "";
}

/** True if file looks like an allowed image (type or extension). */
export function isAllowedImageFile(file) {
  if (!file || typeof file === "string") return false;
  if (file.type && ALLOWED_IMAGE_TYPES.includes(file.type)) return true;
  return ALLOWED_EXTENSIONS.has(getImageExtension(file.name));
}

export function resolveImageContentType(file) {
  if (file?.type && ALLOWED_IMAGE_TYPES.includes(file.type)) return file.type;
  return mimeFromExtension(file?.name) || "image/jpeg";
}

/** Shared client/server image validation. Returns error string or null. */
export function validateImageFileInput(file) {
  if (!file || typeof file === "string") return "profile picture is required";
  if (!isAllowedImageFile(file)) return "image must be JPG, PNG, or WebP";
  if (file.size > MAX_IMAGE_SIZE) return "image must be under 10MB";
  return null;
}
