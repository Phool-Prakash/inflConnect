"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { initFirebase, getFirebaseAuth } from "@/firebase/config";
import { isAdminEmail } from "@/lib/constants";
import {
  adminFetchInfluencer,
  adminUpdateInfluencer,
  adminDeleteInfluencer,
} from "@/lib/api-client";
import InfluencerForm from "@/components/InfluencerForm";
import { formatPhoneDisplay } from "@/lib/phone";
import { buildInstagramUrl } from "@/lib/instagram";
import { buildYouTubeUrl } from "@/lib/youtube";
import { buildFacebookUrl } from "@/lib/facebook";

export default function AdminInfluencerEdit({ id }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isAdmin = user && isAdminEmail(user.email);

  useEffect(() => {
    initFirebase();
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await adminFetchInfluencer(id);
        setInfluencer(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load influencer details.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, isAdmin]);

  async function handleSave(formData) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await adminUpdateInfluencer(id, formData);
      setInfluencer((prev) => ({
        ...prev,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || "",
        instagram: formData.instagram.trim(),
        youtube: formData.youtube?.trim() || "",
        facebook: formData.facebook?.trim() || "",
        niche: formData.niche,
        state: formData.state,
        city: formData.city,
        followerCount: formData.followerCount,
        bio: formData.bio.trim(),
        status: formData.status,
      }));
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this influencer?")) return;
    try {
      await adminDeleteInfluencer(id);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      setError("Failed to delete influencer.");
    }
  }

  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Please sign in as admin to edit influencers.</p>
        <Link href="/admin" className="text-indigo-600 font-medium hover:underline">
          Go to Admin Login
        </Link>
      </div>
    );
  }

  if (error && !influencer) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/admin" className="text-indigo-600 font-medium hover:underline">
          Back to Admin Panel
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Panel
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href={`/influencer/${id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4" />
            Public Profile
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Edit Influencer</h1>
        <p className="text-slate-500 mt-1 font-mono text-sm">ID: {id}</p>
        {influencer && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs mb-0.5">Email</span>
              <span className="text-slate-800">{influencer.email || "—"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs mb-0.5">Phone</span>
              <span className="text-slate-800">{formatPhoneDisplay(influencer.phone)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs mb-0.5">Instagram</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-800 truncate flex-1">{influencer.instagram || "—"}</span>
                {buildInstagramUrl(influencer.instagram) && (
                  <a
                    href={buildInstagramUrl(influencer.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </a>
                )}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs mb-0.5">YouTube</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-800 truncate flex-1">{influencer.youtube || "—"}</span>
                {buildYouTubeUrl(influencer.youtube) && (
                  <a
                    href={buildYouTubeUrl(influencer.youtube)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </a>
                )}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs mb-0.5">Facebook</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-800 truncate flex-1">{influencer.facebook || "—"}</span>
                {buildFacebookUrl(influencer.facebook) && (
                  <a
                    href={buildFacebookUrl(influencer.facebook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
          Changes saved successfully.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
        <InfluencerForm
          key={influencer?.profilePicUrl}
          initialData={influencer}
          existingProfilePicUrl={influencer?.profilePicUrl}
          showStatus
          showSocialVisitButtons
          onSubmit={handleSave}
          submitLabel="Save Changes"
          loading={saving}
        />
      </div>
    </div>
  );
}
