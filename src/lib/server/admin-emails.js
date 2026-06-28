import "server-only";

export function getAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmailServer(email) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
