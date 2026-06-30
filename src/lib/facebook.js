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
  "hashtag",
  "reel",
  "reels",
  "l.php",
  "dialog",
  "plugins",
  "business",
  "ads",
  "privacy",
  "terms",
  "legal",
  "settings",
  "notifications",
  "friends",
  "messages",
  "stories",
]);

const USERNAME_RE = /^[a-zA-Z0-9.]{1,50}$/;

function isFacebookHost(host) {
  const h = host.replace(/^(www|m|mobile|touch)\./, "");
  return h === "facebook.com" || h === "fb.com" || h === "fb.me";
}

function profileIdFromNumeric(value) {
  const id = String(value || "").trim();
  return /^\d{5,}$/.test(id) ? id : null;
}

function usernameToUrl(username) {
  const u = String(username || "").trim();
  if (!USERNAME_RE.test(u)) return null;
  return `https://www.facebook.com/${u}`;
}

function parseFacebookUrl(url) {
  if (!isFacebookHost(url.hostname)) return null;

  if (url.pathname.includes("profile.php")) {
    const id = profileIdFromNumeric(url.searchParams.get("id"));
    if (id) return `https://www.facebook.com/profile.php?id=${id}`;
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const first = parts[0].toLowerCase();

  if (first === "people" && parts.length >= 2) {
    const id = profileIdFromNumeric(parts[parts.length - 1]);
    if (id) return `https://www.facebook.com/profile.php?id=${id}`;
    return null;
  }

  if (first === "profile" && parts.length >= 2) {
    const second = parts[1];
    const id = profileIdFromNumeric(second);
    if (id) return `https://www.facebook.com/profile.php?id=${id}`;
    return usernameToUrl(second);
  }

  if (RESERVED_PATHS.has(first)) return null;

  const id = profileIdFromNumeric(parts[0]);
  if (id) return `https://www.facebook.com/profile.php?id=${id}`;

  return usernameToUrl(parts[0]);
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
      return parseFacebookUrl(new URL(raw));
    } catch {
      return null;
    }
  }

  if (/^(www\.|m\.)?(facebook\.com|fb\.com|fb\.me)\//i.test(raw) || raw.includes("facebook.com") || raw.includes("fb.com") || raw.includes("fb.me")) {
    return buildFacebookUrl(`https://${raw.replace(/^\/\//, "")}`);
  }

  const numericId = profileIdFromNumeric(raw);
  if (numericId) return `https://www.facebook.com/profile.php?id=${numericId}`;

  const username = raw.startsWith("@") ? raw.slice(1) : raw;
  return usernameToUrl(username);
}

export function isValidFacebookInput(input) {
  if (!input?.trim()) return true;
  return buildFacebookUrl(input) !== null;
}
