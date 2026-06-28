const RESERVED_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "tv",
  "explore",
  "accounts",
  "direct",
  "stories",
  "about",
  "legal",
  "developer",
  "privacy",
  "terms",
]);

const USERNAME_RE = /^[a-zA-Z0-9._]{1,30}$/;

function usernameToUrl(username) {
  if (!USERNAME_RE.test(username)) return null;
  return `https://www.instagram.com/${username}/`;
}

/**
 * Build an Instagram profile URL from a link, @handle, or username.
 * Returns null if input is empty or cannot be parsed as a profile.
 */
export function buildInstagramUrl(input) {
  if (!input?.trim()) return null;

  const raw = input.trim();

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, "");
      if (host !== "instagram.com") return null;

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length === 0) return null;

      const first = parts[0];
      if (RESERVED_PATHS.has(first.toLowerCase())) return null;

      return usernameToUrl(first);
    } catch {
      return null;
    }
  }

  if (raw.includes("instagram.com")) {
    return buildInstagramUrl(`https://${raw.replace(/^\/\//, "")}`);
  }

  const username = raw.startsWith("@") ? raw.slice(1) : raw;
  return usernameToUrl(username);
}

export function isValidInstagramInput(input) {
  if (!input?.trim()) return false;
  return buildInstagramUrl(input) !== null;
}
