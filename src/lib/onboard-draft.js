const DRAFT_KEY = "infl_onboard_draft_v1";
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const FORM_FIELDS = [
  "fullName",
  "email",
  "phone",
  "instagram",
  "youtube",
  "facebook",
  "niche",
  "state",
  "city",
  "followerCount",
  "bio",
];

export function pickDraftFields(form) {
  const draft = {};
  for (const key of FORM_FIELDS) {
    if (form[key] != null) draft[key] = form[key];
  }
  return draft;
}

export function saveOnboardDraft(form) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...pickDraftFields(form), savedAt: Date.now() })
    );
  } catch {
    // Quota exceeded or private browsing — ignore
  }
}

export function loadOnboardDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearOnboardDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
