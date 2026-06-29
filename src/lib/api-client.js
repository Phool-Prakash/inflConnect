import { getFirebaseAuth, initFirebase } from "@/firebase/config";

async function parseResponse(res) {
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Request failed");
  }
  return json.data;
}

async function getAdminToken() {
  if (!initFirebase()) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars and redeploy."
    );
  }
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) {
    throw new Error("Admin sign-in required");
  }
  return auth.currentUser.getIdToken();
}

export {
  fetchApprovedInfluencers,
  fetchInfluencerById,
  submitOnboarding,
} from "@/lib/public-api";

/** Admin: list all or by status */
export async function adminFetchInfluencers({ status } = {}) {
  const token = await getAdminToken();
  const params = status ? `?status=${status}` : "";
  const res = await fetch(`/api/admin/influencers${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(res);
}

/** Admin: get one */
export async function adminFetchInfluencer(id) {
  const token = await getAdminToken();
  const res = await fetch(`/api/admin/influencers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(res);
}

/** Admin: create */
export async function adminCreateInfluencer(formData) {
  const token = await getAdminToken();
  const body = new FormData();
  body.append("fullName", formData.fullName);
  body.append("email", formData.email);
  body.append("phone", formData.phone);
  body.append("instagram", formData.instagram);
  body.append("youtube", formData.youtube || "");
  body.append("facebook", formData.facebook || "");
  body.append("niche", formData.niche);
  body.append("state", formData.state);
  body.append("city", formData.city);
  body.append("followerCount", formData.followerCount != null && formData.followerCount !== "" ? String(formData.followerCount) : "");
  body.append("bio", formData.bio);
  body.append("profilePic", formData.profilePic);

  const res = await fetch("/api/admin/influencers", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  return parseResponse(res);
}

/** Admin: update */
export async function adminUpdateInfluencer(id, formData) {
  const token = await getAdminToken();
  const body = new FormData();
  body.append("fullName", formData.fullName);
  body.append("email", formData.email);
  body.append("phone", formData.phone);
  body.append("instagram", formData.instagram);
  body.append("youtube", formData.youtube || "");
  body.append("facebook", formData.facebook || "");
  body.append("niche", formData.niche);
  body.append("state", formData.state);
  body.append("city", formData.city);
  body.append("followerCount", formData.followerCount != null && formData.followerCount !== "" ? String(formData.followerCount) : "");
  body.append("bio", formData.bio);
  body.append("status", formData.status);
  if (formData.existingProfilePicUrl) {
    body.append("existingProfilePicUrl", formData.existingProfilePicUrl);
  }
  if (formData.profilePic) {
    body.append("profilePic", formData.profilePic);
  }

  const res = await fetch(`/api/admin/influencers/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  return parseResponse(res);
}

/** Admin: update status only */
export async function adminUpdateStatus(id, status) {
  const token = await getAdminToken();
  const res = await fetch(`/api/admin/influencers/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return parseResponse(res);
}

/** Admin: delete */
export async function adminDeleteInfluencer(id) {
  const token = await getAdminToken();
  const res = await fetch(`/api/admin/influencers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(res);
}

/** Admin: bulk approve or delete */
export async function adminBulkAction(action, ids) {
  const token = await getAdminToken();
  const res = await fetch("/api/admin/influencers/bulk", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, ids }),
  });
  return parseResponse(res);
}
