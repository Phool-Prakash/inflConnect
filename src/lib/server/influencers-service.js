import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminStorage } from "@/lib/server/firebase-admin";

const COLLECTION = "influencers";

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
  const storage = getAdminStorage();
  if (!storage) throw new Error("Firebase Admin SDK is not configured.");
  const bucket = storage.bucket();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `influencers/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const fileRef = bucket.file(path);
  await fileRef.save(buffer, {
    metadata: { contentType: file.type },
  });
  await fileRef.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}

export async function listApprovedInfluencersServer({ city } = {}) {
  const db = getAdminDb();
  if (!db) return [];
  let query = db
    .collection(COLLECTION)
    .where("status", "==", "approved")
    .orderBy("createdAt", "desc");

  if (city && city !== "All Cities") {
    query = query.where("city", "==", city);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(docToObject);
}

export async function getInfluencerServer(id, { admin = false } = {}) {
  const db = getAdminDb();
  if (!db) return null;
  const snapshot = await db.collection(COLLECTION).doc(id).get();
  const data = docToObject(snapshot);
  if (!data) return null;
  if (!admin && data.status !== "approved") return null;
  return data;
}

export async function listInfluencersByStatusServer(status) {
  const db = getAdminDb();
  if (!db) return [];
  const snapshot = await db
    .collection(COLLECTION)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map(docToObject);
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
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  const ref = await db.collection(COLLECTION).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateInfluencerServer(id, data) {
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  await db.collection(COLLECTION).doc(id).update(data);
}

export async function deleteInfluencerServer(id) {
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  await db.collection(COLLECTION).doc(id).delete();
}

export async function bulkApproveServer(ids) {
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  const batch = db.batch();
  ids.forEach((id) => {
    batch.update(db.collection(COLLECTION).doc(id), { status: "approved" });
  });
  await batch.commit();
}

export async function bulkDeleteServer(ids) {
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin SDK is not configured.");
  const batch = db.batch();
  ids.forEach((id) => {
    batch.delete(db.collection(COLLECTION).doc(id));
  });
  await batch.commit();
}
