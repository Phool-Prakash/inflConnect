import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-indigo-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Profile Not Found</h1>
        <p className="text-slate-500 mb-6">
          This influencer profile doesn&apos;t exist or hasn&apos;t been approved yet.
        </p>
        <Link
          href="/"
          className="inline-flex px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Browse Influencers
        </Link>
      </div>
    </div>
  );
}
