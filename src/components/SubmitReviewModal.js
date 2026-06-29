"use client";

import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { formatFollowers } from "@/lib/constants";
import { formatPhoneDisplay } from "@/lib/phone";
import ProfileAvatar from "@/components/ProfileAvatar";

function ReviewRow({ label, value }) {
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900 break-words">{value || "—"}</dd>
    </div>
  );
}

export default function SubmitReviewModal({
  open,
  onClose,
  onConfirm,
  loading,
  previewUrl,
  form,
}) {
  if (!open) return null;

  const followers =
    form.followerCount !== "" && form.followerCount != null
      ? formatFollowers(Number(form.followerCount))
      : "Not provided";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        disabled={loading}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Review your profile</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Please confirm everything looks correct before submitting.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              {previewUrl ? (
                <Image src={previewUrl} alt="Profile" fill className="object-cover" />
              ) : (
                <ProfileAvatar src={null} alt="Profile" iconSize="sm" />
              )}
            </div>
          </div>

          <dl>
            <ReviewRow label="Full Name" value={form.fullName} />
            <ReviewRow label="Email" value={form.email} />
            <ReviewRow label="Phone" value={formatPhoneDisplay(form.phone)} />
            <ReviewRow label="Instagram" value={form.instagram} />
            <ReviewRow label="YouTube" value={form.youtube || "Not provided"} />
            <ReviewRow label="Facebook" value={form.facebook || "Not provided"} />
            <ReviewRow label="Content Category" value={form.niche} />
            <ReviewRow label="State" value={form.state} />
            <ReviewRow label="City" value={form.city} />
            <ReviewRow label="Follower Count" value={followers} />
            <ReviewRow label="Bio" value={form.bio} />
          </dl>
        </div>

        <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            Go Back & Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting..." : "Confirm & Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
