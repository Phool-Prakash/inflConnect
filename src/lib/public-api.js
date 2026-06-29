async function parseResponse(res) {
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Request failed");
  }
  return json.data;
}

/** Public: list approved influencers */
export async function fetchApprovedInfluencers({ city } = {}) {
  const params = new URLSearchParams();
  if (city && city !== "All Cities") params.set("city", city);
  const qs = params.toString();
  const res = await fetch(`/api/influencers${qs ? `?${qs}` : ""}`);
  return parseResponse(res);
}

/** Public: get approved profile */
export async function fetchInfluencerById(id) {
  const res = await fetch(`/api/influencers/${id}`);
  return parseResponse(res);
}

/** Public: submit onboarding */
export async function submitOnboarding(formData) {
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
  body.append(
    "followerCount",
    formData.followerCount != null && formData.followerCount !== ""
      ? String(formData.followerCount)
      : ""
  );
  body.append("bio", formData.bio);
  body.append("profilePic", formData.profilePic);

  const res = await fetch("/api/influencers", { method: "POST", body });
  return parseResponse(res);
}
