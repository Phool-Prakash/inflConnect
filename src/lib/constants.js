import { getAllCities } from "@/lib/data/india-locations";

/** All cities from India locations data (for filters) */
export const CITIES = getAllCities();

export const NICHES = [
  "Lifestyle",
  "Fashion",
  "Beauty",
  "Fitness",
  "Food & Cooking",
  "Travel",
  "Tech",
  "Gaming",
  "Education",
  "Finance",
  "Comedy",
  "Music",
  "Photography",
  "Parenting & Family",
  "Health & Wellness",
  "Sports",
  "Art & Design",
  "Business",
  "Automotive",
  "Pets & Animals",
  "Entertainment",
  "News & Commentary",
];

export const STATUSES = ["pending", "approved"];

export const NICHE_STYLES = {
  Lifestyle: "bg-purple-100 text-purple-700",
  Fashion: "bg-pink-100 text-pink-700",
  Beauty: "bg-rose-100 text-rose-700",
  Fitness: "bg-green-100 text-green-700",
  "Food & Cooking": "bg-amber-100 text-amber-700",
  Travel: "bg-sky-100 text-sky-700",
  Tech: "bg-blue-100 text-blue-700",
  Gaming: "bg-orange-100 text-orange-700",
  Education: "bg-indigo-100 text-indigo-700",
  Finance: "bg-emerald-100 text-emerald-700",
  Comedy: "bg-yellow-100 text-yellow-800",
  Music: "bg-violet-100 text-violet-700",
  Photography: "bg-cyan-100 text-cyan-700",
  "Parenting & Family": "bg-fuchsia-100 text-fuchsia-700",
  "Health & Wellness": "bg-teal-100 text-teal-700",
  Sports: "bg-lime-100 text-lime-800",
  "Art & Design": "bg-red-100 text-red-700",
  Business: "bg-slate-200 text-slate-800",
  Automotive: "bg-stone-200 text-stone-800",
  "Pets & Animals": "bg-orange-100 text-orange-800",
  Entertainment: "bg-pink-100 text-pink-800",
  "News & Commentary": "bg-gray-200 text-gray-800",
};

/**
 * Format follower count for display (e.g. 125400 → "125.4K")
 */
export function formatFollowers(count) {
  if (count == null || isNaN(count)) return "0";
  const num = Number(count);
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return val % 1 === 0 ? `${val}M` : `${val.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return val % 1 === 0 ? `${val}K` : `${val.toFixed(1)}K`;
  }
  return String(num);
}

/**
 * Return Tailwind classes for a niche tag badge
 */
export function getNicheStyle(niche) {
  return NICHE_STYLES[niche] ?? "bg-slate-100 text-slate-700";
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isAdminEmail(email) {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email?.toLowerCase());
}
