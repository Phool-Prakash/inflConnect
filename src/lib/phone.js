/** Normalize Indian mobile number to 10 digits */
export function normalizePhone(input) {
  if (!input?.trim()) return "";
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function isValidPhone(input) {
  const normalized = normalizePhone(input);
  return /^[6-9]\d{9}$/.test(normalized);
}

export function formatPhoneDisplay(phone) {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits}`;
  return phone;
}
