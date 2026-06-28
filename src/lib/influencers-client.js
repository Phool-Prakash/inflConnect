import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, initFirebase, getFirebaseAuth } from "@/firebase/config";

const COLLECTION = "influencers";

function ensureFirebase() {
  initFirebase();
  if (!db || !storage) {
    throw new Error("Firebase is not initialized. Check your environment variables.");
  }
}

/** Ensure admin Firestore requests include a fresh auth token. */
async function ensureAdminAuth() {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) {
    throw new Error("Admin sign-in required.");
  }
  await auth.currentUser.getIdToken(true);
}

/**
 * Fetch approved influencers from Firestore (client SDK).
 * Requires composite indexes: (status, createdAt) and (status, city, createdAt).
 */
export async function getApprovedInfluencers({ city } = {}) {
  try {
    ensureFirebase();
    const constraints = [
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
    ];

    if (city && city !== "All Cities") {
      constraints.splice(1, 0, where("city", "==", city));
    }

    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error("Error fetching approved influencers:", error);
    throw error;
  }
}

/**
 * Fetch a single influencer by ID (client SDK).
 */
export async function getInfluencerById(id, { admin = false } = {}) {
  try {
    ensureFirebase();
    if (admin) await ensureAdminAuth();
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error("Error fetching influencer:", error);
    throw error;
  }
}

/**
 * Fetch influencers by status (admin panel).
 */
export async function getInfluencersByStatus(status) {
  try {
    ensureFirebase();
    await ensureAdminAuth();
    const q = query(
      collection(db, COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching influencers by status:", error);
    throw error;
  }
}

/**
 * Fetch all influencers (admin panel) — queries each status separately
 * so Firestore security rules work reliably for admin users.
 */
export async function getAllInfluencers() {
  try {
    ensureFirebase();
    await ensureAdminAuth();
    const [approved, pending] = await Promise.all([
      getDocs(
        query(
          collection(db, COLLECTION),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        )
      ),
      getDocs(
        query(
          collection(db, COLLECTION),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        )
      ),
    ]);

    const all = [...approved.docs, ...pending.docs].map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return all.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("Error fetching all influencers:", error);
    throw error;
  }
}

/**
 * Upload profile picture to Firebase Storage and return download URL.
 */
export async function uploadProfilePicture(file) {
  try {
    ensureFirebase();
    const ext = file.name.split(".").pop();
    const path = `influencers/${crypto.randomUUID()}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

/**
 * Create a new influencer document in Firestore.
 */
export async function createInfluencer(data) {
  try {
    ensureFirebase();
    if (data.status === "approved") {
      await ensureAdminAuth();
    }
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating influencer:", error);
    throw error;
  }
}

/**
 * Update influencer status (approve).
 */
export async function approveInfluencer(id) {
  return updateInfluencer(id, { status: "approved" });
}

/**
 * Update influencer fields (admin).
 */
export async function updateInfluencer(id, data) {
  try {
    ensureFirebase();
    await ensureAdminAuth();
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating influencer:", error);
    throw error;
  }
}

/**
 * Delete an influencer document.
 */
export async function deleteInfluencer(id) {
  try {
    ensureFirebase();
    await ensureAdminAuth();
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting influencer:", error);
    throw error;
  }
}
