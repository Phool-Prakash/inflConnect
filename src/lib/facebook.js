const RESERVED_PATHS = new Set([
  "pages",
  "groups",
  "events",
  "watch",
  "gaming",
  "marketplace",
  "help",
  "policies",
  "share",
  "sharer",
  "login",
  "recover",
  "photo.php",
  "story.php",
  "people",
  "hashtag",
  "reel",
  "reels",
]);

const USERNAME_RE = /^[a-zA-Z0-9.]{5,50}$/;

function isFacebookHost(host) {
  const h = host.replace(/^www\.|^m\./, "");
  return h === "facebook.com" || h === "fb.com";
}

/**
 * Build a Facebook profile URL from a link, profile ID, or username.
 * Returns null if input is empty or cannot be parsed.
 */
export function buildFacebookUrl(input) {
  if (!input?.trim()) return null;

  let raw = input.trim();

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      if (!isFacebookHost(url.hostname)) return null;

      if (url.pathname.includes("profile.php")) {
        const id = url.searchParams.get("id");
        if (id && /^\d+$/.test(id)) {
          return `https://www.facebook.com/profile.php?id=${id}`;
        }
        return null;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length === 0) return null;

      const first = parts[0].toLowerCase();
      if (RESERVED_PATHS.has(first)) return null;

      if (USERNAME_RE.test(parts[0])) {
        return `https://www.facebook.com/${parts[0]}`;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (raw.includes("facebook.com") || raw.includes("fb.com")) {
    return buildFacebookUrl(`https://${raw.replace(/^\/\//, "")}`);
  }

  const username = raw.startsWith("@") ? raw.slice(1) : raw;
  if (USERNAME_RE.test(username)) {
    return `https://www.facebook.com/${username}`;
  }

  return null;
}

export function isValidFacebookInput(input) {
  if (!input?.trim()) return true;
  return buildFacebookUrl(input) !== null;
}
