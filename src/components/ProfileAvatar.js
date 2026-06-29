import Image from "next/image";
import { User } from "lucide-react";

const ICON_SIZES = {
  sm: "w-8 h-8",
  card: "w-14 h-14",
  profile: "w-20 h-20",
  lg: "w-24 h-24",
};

/**
 * Profile image with a default user icon when no photo is uploaded.
 */
export default function ProfileAvatar({
  src,
  alt = "Profile picture",
  sizes,
  priority = false,
  iconSize = "card",
  className = "",
  imageClassName = "object-cover",
}) {
  const iconClass = ICON_SIZES[iconSize] || ICON_SIZES.card;

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`${imageClassName} ${className}`.trim()}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100 ${className}`.trim()}
      aria-hidden
    >
      <div className="flex items-center justify-center rounded-full bg-white/80 shadow-sm ring-1 ring-indigo-100 p-4">
        <User className={`${iconClass} text-indigo-400`} strokeWidth={1.5} />
      </div>
    </div>
  );
}
