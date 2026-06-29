"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { MapPin, Users, ExternalLink, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { initFirebase, getFirebaseAuth } from "@/firebase/config";
import { isAdminEmail } from "@/lib/constants";
import { fetchInfluencerById } from "@/lib/public-api";
import { adminFetchInfluencer } from "@/lib/api-client";
import { formatFollowers, getNicheStyle } from "@/lib/constants";
import { buildYouTubeUrl } from "@/lib/youtube";
import { buildInstagramUrl } from "@/lib/instagram";

export default function InfluencerProfileClient({ id }) {
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdminViewer, setIsAdminViewer] = useState(false);

  useEffect(() => {
    initFirebase();
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthChecked(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminViewer(Boolean(user && isAdminEmail(user.email)));
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    async function load() {
      setLoading(true);
      setNotFoundState(false);
      try {
        const data = isAdminViewer
          ? await adminFetchInfluencer(id)
          : await fetchInfluencerById(id);
        if (!data) {
          setNotFoundState(true);
          return;
        }
        setInfluencer(data);
      } catch (err) {
        console.error(err);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, authChecked, isAdminViewer]);

  if (notFoundState) {
    notFound();
  }

  if (!authChecked || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const {
    fullName,
    bio,
    city,
    niche,
    followerCount,
    profilePicUrl,
    instagram,
    youtube,
    tiktokYoutube,
    status,
  } = influencer;

  const instagramUrl = buildInstagramUrl(instagram);
  const youtubeUrl = buildYouTubeUrl(youtube || tiktokYoutube);
  const isPendingPreview = isAdminViewer && status === "pending";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    description: bio,
    image: profilePicUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: "IN",
    },
    jobTitle: `${niche} Influencer`,
    sameAs: [instagramUrl, youtubeUrl].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href={isAdminViewer ? "/admin" : "/"}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAdminViewer ? "Back to Admin Panel" : "Back to all influencers"}
        </Link>

        {isPendingPreview && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold text-sm">Admin preview — Pending approval</p>
              <p className="text-sm text-amber-800/90 mt-1">
                This is how the public profile will look. It is not visible on the homepage until approved.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="relative aspect-[3/2] sm:aspect-[2/1] bg-slate-100">
            {profilePicUrl ? (
              <Image
                src={profilePicUrl}
                alt={`${fullName} profile picture`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                <span className="text-6xl font-bold text-indigo-200">
                  {fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                {fullName}
              </h1>
              {isPendingPreview && (
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                <MapPin className="w-4 h-4" />
                {city}
              </span>
              <span
                className={`px-3 py-1.5 text-sm font-medium rounded-full ${getNicheStyle(niche)}`}
              >
                {niche}
              </span>
              {followerCount != null && followerCount !== "" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full">
                  <Users className="w-4 h-4" />
                  {formatFollowers(followerCount)} followers
                </span>
              )}
            </div>

            {bio && (
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">{bio}</p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
