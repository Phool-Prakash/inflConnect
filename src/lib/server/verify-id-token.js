import "server-only";

/** Verify Firebase ID token via REST API (avoids firebase-admin/auth ESM issues on Vercel). */
export async function verifyFirebaseIdToken(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured.");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Invalid or expired token");
  }

  const user = data.users?.[0];
  if (!user) {
    throw new Error("Invalid or expired token");
  }

  return {
    uid: user.localId,
    email: user.email,
  };
}
