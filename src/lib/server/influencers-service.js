import "server-only";
import { getAdminDb, getAdminStorage } from "@/lib/server/firebase-admin";
import { getImageExtension, resolveImageContentType } from "@/lib/image-file";

const COLLECTION = "influencers";

function followerCountValue(inf) {
  const n = Number(inf.followerCount);
  if (inf.followerCount == null || inf.followerCount === "" || isNaN(n)) return -1;
  return n;
}

/** Highest followers first; missing counts last; tie-break by newest. */
function sortByFollowersDesc(a, b) {
  const byFollowers = followerCountValue(b) - followerCountValue(a);
  if (byFollowers !== 0) return byFollowers;
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return bTime - aTime;
}

function docToObject(snapshot) {
  if (!snapshot.exists) return null;
  const data = snapshot.data();
  const youtube = data.youtube || data.tiktokYoutube || "";
  return {
    id: snapshot.id,
    ...data,
    youtube,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
  };
}

/** Remove contact fields from public API responses */
export function toPublicInfluencer(data) {
  if (!data) return null;
  const { email, phone, ...publicData } = data;
  return publicData;
}

export async function uploadProfileImageServer(file) {
  const storage = await getAdminStorage();
  const bucket = storage.bucket();
  const ext = getImageExtension(file.name) || "jpg";
  const path = `influencers/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = resolveImageContentType(file);

  const fileRef = bucket.file(path);
  await fileRef.save(buffer, {
    metadata: { contentType },
  });
  await fileRef.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}

export async function listApprovedInfluencersServer({ city } = {}) {
  const db = await getAdminDb();
  const snapshot = await db
    .collection(COLLECTION)
    .where("status", "==", "approved")
    .get();

  let results = snapshot.docs.map(docToObject);

  if (city && city !== "All Cities") {
    results = results.filter((inf) => inf.city === city);
  }

  return results.sort(sortByFollowersDesc);
}

export async function getInfluencerServer(id, { admin = false } = {}) {
  const db = await getAdminDb();
  const snapshot = await db.collection(COLLECTION).doc(id).get();
  const data = docToObject(snapshot);
  if (!data) return null;
  if (!admin && data.status !== "approved") return null;
  return data;
}

export async function listInfluencersByStatusServer(status) {
  const db = await getAdminDb();
  const snapshot = await db
    .collection(COLLECTION)
    .where("status", "==", status)
    .get();
  return snapshot.docs
    .map(docToObject)
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
}

export async function listAllInfluencersServer() {
  const [approved, pending] = await Promise.all([
    listInfluencersByStatusServer("approved"),
    listInfluencersByStatusServer("pending"),
  ]);
  return [...approved, ...pending].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

export async function createInfluencerServer(data) {
  const db = await getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  const { FieldValue } = await import("firebase-admin/firestore");
  const ref = await db.collection(COLLECTION).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

/** Persist failed onboarding attempts for admin review. */
export async function logOnboardingFailure(data, errors, meta = {}) {
  try {
    const db = await getAdminDb();
    if (!db) return;
    const { FieldValue } = await import("firebase-admin/firestore");
    await db.collection("onboarding_failures").add({
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      instagram: data.instagram || "",
      youtube: data.youtube || "",
      facebook: data.facebook || "",
      niche: data.niche || "",
      state: data.state || "",
      city: data.city || "",
      followerCount: data.followerCount || "",
      bio: data.bio || "",
      errors: Array.isArray(errors) ? errors : [String(errors)],
      ...meta,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("logOnboardingFailure:", err);
  }
}

export async function updateInfluencerServer(id, data) {
  const db = await getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  await db.collection(COLLECTION).doc(id).update(data);
}

export async function deleteInfluencerServer(id) {
  const db = await getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  await db.collection(COLLECTION).doc(id).delete();
}

export async function bulkApproveServer(ids) {
  const db = await getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  const batch = db.batch();
  ids.forEach((id) => {
    batch.update(db.collection(COLLECTION).doc(id), { status: "approved" });
  });
  await batch.commit();
}

export async function bulkDeleteServer(ids) {
  const db = await getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  const batch = db.batch();
  ids.forEach((id) => {
    batch.delete(db.collection(COLLECTION).doc(id));
  });
  await batch.commit();
}
