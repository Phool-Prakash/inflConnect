/**
 * Build a YouTube channel URL from a link, channel ID, or @handle.
 * Returns null if input is empty or cannot be parsed.
 */
export function buildYouTubeUrl(input) {
  if (!input?.trim()) return null;

  let raw = input.trim();

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, "");
      if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
        return url.toString().replace(/\/$/, "");
      }
    } catch {
      return null;
    }
    return null;
  }

  if (raw.includes("youtube.com") || raw.includes("youtu.be")) {
    return buildYouTubeUrl(`https://${raw.replace(/^\/\//, "")}`);
  }

  // Channel ID e.g. UCxxxxxxxxxxxxxxxxxxxxxx
  if (/^UC[\w-]{10,}$/i.test(raw)) {
    return `https://www.youtube.com/channel/${raw}`;
  }

  const handle = raw.startsWith("@") ? raw : `@${raw}`;
  if (/^@[\w.-]{3,}$/.test(handle)) {
    return `https://www.youtube.com/${handle}`;
  }

  return null;
}

export function isValidYouTubeInput(input) {
  if (!input?.trim()) return true;
  return buildYouTubeUrl(input) !== null;
}
