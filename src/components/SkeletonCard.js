export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="aspect-square shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-5 shimmer rounded-lg w-3/4" />
        <div className="h-4 shimmer rounded-lg w-full" />
        <div className="h-4 shimmer rounded-lg w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 shimmer rounded-full w-20" />
          <div className="h-6 shimmer rounded-full w-16" />
        </div>
        <div className="h-10 shimmer rounded-xl w-full mt-2" />
      </div>
    </div>
  );
}
