"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Loader2, ChevronDown, ExternalLink } from "lucide-react";
import StateCityPicker from "@/components/StateCityPicker";
import { findStateForCity } from "@/lib/data/india-locations";
import {
  NICHES,
  STATUSES,
  EMAIL_REGEX,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/constants";
import { isValidInstagramInput, buildInstagramUrl } from "@/lib/instagram";
import { isValidYouTubeInput, buildYouTubeUrl } from "@/lib/youtube";
import { isValidPhone } from "@/lib/phone";
import SubmitReviewModal from "@/components/SubmitReviewModal";

function parseFollowerCount(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  instagram: "",
  youtube: "",
  niche: "",
  state: "",
  city: "",
  followerCount: "",
  bio: "",
  status: "pending",
};

export default function InfluencerForm({
  onSubmit,
  submitLabel = "Submit",
  loading = false,
  initialData = null,
  existingProfilePicUrl = null,
  showStatus = false,
  confirmBeforeSubmit = false,
  showSocialVisitButtons = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existingProfilePicUrl);
  const [errors, setErrors] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);

  useEffect(() => {
    if (initialData) {
      const city = initialData.city || "";
      setForm({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        instagram: initialData.instagram || "",
        youtube: initialData.youtube || initialData.tiktokYoutube || "",
        niche: initialData.niche || "",
        state: initialData.state || findStateForCity(city),
        city,
        followerCount: String(initialData.followerCount ?? ""),
        bio: initialData.bio || "",
        status: initialData.status || "pending",
      });
      setPreviewUrl(existingProfilePicUrl || initialData.profilePicUrl || null);
    }
  }, [initialData, existingProfilePicUrl]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profilePic: "Please upload a JPG, PNG, or WebP image.",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        profilePic: "Image must be smaller than 10MB.",
      }));
      return;
    }

    setProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, profilePic: null }));
  }

  function validate() {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!isValidPhone(form.phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (!form.instagram.trim()) {
      newErrors.instagram = "Instagram profile link or username is required.";
    } else if (!isValidInstagramInput(form.instagram)) {
      newErrors.instagram = "Enter a valid Instagram profile link, @handle, or username.";
    }
    if (form.youtube.trim() && !isValidYouTubeInput(form.youtube)) {
      newErrors.youtube = "Enter a valid YouTube channel link, ID, or @handle.";
    }
    if (!form.niche) newErrors.niche = "Please select a content category.";
    if (!form.state) newErrors.state = "Please select your state.";
    if (!form.city) newErrors.city = "Please select your city.";
    if (
      form.followerCount !== "" &&
      (isNaN(form.followerCount) || Number(form.followerCount) < 0)
    ) {
      newErrors.followerCount = "Please enter a valid follower count.";
    }
    if (!form.bio.trim()) {
      newErrors.bio = "Bio is required.";
    } else if (form.bio.length > 200) {
      newErrors.bio = "Bio must be 200 characters or less.";
    }
    if (!profilePic && !previewUrl) {
      newErrors.profilePic = "Profile picture is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function buildSubmitPayload() {
    return {
      ...form,
      followerCount: parseFollowerCount(form.followerCount),
      profilePic,
      existingProfilePicUrl: previewUrl && !profilePic ? previewUrl : null,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = buildSubmitPayload();

    if (confirmBeforeSubmit) {
      setPendingSubmit(payload);
      setShowReviewModal(true);
      return;
    }

    await onSubmit(payload);
  }

  async function handleConfirmSubmit() {
    if (!pendingSubmit) return;
    await onSubmit(pendingSubmit);
    setShowReviewModal(false);
    setPendingSubmit(null);
  }

  function handleCloseReviewModal() {
    if (loading) return;
    setShowReviewModal(false);
    setPendingSubmit(null);
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white";
  const selectClass =
    "w-full appearance-none pl-4 pr-11 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white cursor-pointer";
  const visitBtnClass =
    "mt-[1.625rem] inline-flex items-center justify-center w-11 h-[42px] flex-shrink-0 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200";

  const instagramVisitUrl = buildInstagramUrl(form.instagram);
  const youtubeVisitUrl = buildYouTubeUrl(form.youtube);
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Profile Picture *</label>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0">
            {previewUrl ? (
              <Image src={previewUrl} alt="Profile preview" fill className="object-cover" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <label className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
              Choose Image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP. Max 10MB.</p>
          </div>
        </div>
        {errors.profilePic && <p className={errorClass}>{errors.profilePic}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fullName" className={labelClass}>Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            className={inputClass}
            placeholder="Your full name"
          />
          {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="you@example.com"
          />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="10-digit mobile number"
          />
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="instagram" className={labelClass}>Instagram *</label>
          <div className={`flex gap-2 ${showSocialVisitButtons ? "items-start" : ""}`}>
            <div className="flex-1 min-w-0">
              <input
                id="instagram"
                name="instagram"
                type="text"
                value={form.instagram}
                onChange={handleChange}
                className={inputClass}
                placeholder="Profile link, @handle, or username"
              />
              {errors.instagram && <p className={errorClass}>{errors.instagram}</p>}
            </div>
            {showSocialVisitButtons && (
              instagramVisitUrl ? (
                <a
                  href={instagramVisitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Instagram profile"
                  className={visitBtnClass}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Enter a valid Instagram link first"
                  className={visitBtnClass}
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label htmlFor="youtube" className={labelClass}>
            YouTube <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className={`flex gap-2 ${showSocialVisitButtons ? "items-start" : ""}`}>
            <div className="flex-1 min-w-0">
              <input
                id="youtube"
                name="youtube"
                type="text"
                value={form.youtube}
                onChange={handleChange}
                className={inputClass}
                placeholder="Channel link, @handle, or channel ID"
              />
              {errors.youtube && <p className={errorClass}>{errors.youtube}</p>}
            </div>
            {showSocialVisitButtons && (
              youtubeVisitUrl ? (
                <a
                  href={youtubeVisitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open YouTube channel"
                  className={visitBtnClass}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Enter a valid YouTube link first"
                  className={visitBtnClass}
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label htmlFor="niche" className={labelClass}>Content Category *</label>
          <div className="relative">
            <select
              id="niche"
              name="niche"
              value={form.niche}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select what you create</option>
              {NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {errors.niche && <p className={errorClass}>{errors.niche}</p>}
        </div>

        <div>
          <label htmlFor="followerCount" className={labelClass}>
            Follower Count <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="followerCount"
            name="followerCount"
            type="number"
            min="0"
            value={form.followerCount}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. 50000"
          />
          {errors.followerCount && <p className={errorClass}>{errors.followerCount}</p>}
        </div>

        {showStatus && (
          <div>
            <label htmlFor="status" className={labelClass}>Status *</label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={selectClass}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
        <StateCityPicker
          state={form.state}
          city={form.city}
          onStateChange={(state) => {
            setForm((prev) => ({ ...prev, state, city: "" }));
            if (errors.state) setErrors((prev) => ({ ...prev, state: null }));
          }}
          onCityChange={(city) => {
            setForm((prev) => ({ ...prev, city }));
            if (errors.city) setErrors((prev) => ({ ...prev, city: null }));
          }}
          errors={errors}
        />
      </div>

      <div>
        <label htmlFor="bio" className={labelClass}>Bio *</label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={form.bio}
          onChange={handleChange}
          className={inputClass}
          placeholder="Tell brands about yourself (max 200 characters)"
          maxLength={200}
        />
        <div className="flex justify-between mt-1">
          {errors.bio ? <p className={errorClass}>{errors.bio}</p> : <span />}
          <span className="text-xs text-slate-400">{form.bio.length}/200</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? "Saving..." : submitLabel}
      </button>

      {confirmBeforeSubmit && (
        <SubmitReviewModal
          open={showReviewModal}
          onClose={handleCloseReviewModal}
          onConfirm={handleConfirmSubmit}
          loading={loading}
          previewUrl={previewUrl}
          form={form}
        />
      )}
    </form>
  );
}
