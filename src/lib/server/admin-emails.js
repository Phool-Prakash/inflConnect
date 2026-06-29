import "server-only";

export function getAdminEmails() {
  const raw =
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmailServer(email) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
