import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { formatFollowers, getNicheStyle } from "@/lib/constants";
import ProfileAvatar from "@/components/ProfileAvatar";

export default function InfluencerCard({ influencer }) {
  const { id, fullName, city, niche, followerCount, profilePicUrl, bio } =
    influencer;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-slate-100">
        <ProfileAvatar
          src={profilePicUrl}
          alt={`${fullName} profile picture`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          iconSize="card"
        />
        {followerCount != null && followerCount !== "" && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 text-sm font-semibold text-slate-700 shadow-sm">
            <Users className="w-3.5 h-3.5" />
            {formatFollowers(followerCount)}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="text-lg font-bold text-slate-900 truncate">{fullName}</h3>

        {bio && (
          <p className="text-sm text-slate-500 line-clamp-2 flex-1">{bio}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
            <MapPin className="w-3 h-3" />
            {city}
          </span>
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${getNicheStyle(niche)}`}
          >
            {niche}
          </span>
        </div>

        <Link
          href={`/influencer/${id}`}
          className="mt-auto w-full text-center px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
