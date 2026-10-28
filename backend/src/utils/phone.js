/**
 * Normalizes phone numbers into a stable canonical form so the same
 * person calling/texting through different channels always resolves to
 * the same Contact (organizationId + phone is unique).
 *
 * Rules:
 *  - Strips spaces, dashes, dots, parentheses.
 *  - Israeli local numbers (0XXXXXXXXX) are converted to E.164 (+972XXXXXXXXX).
 *  - Numbers already in E.164 form are kept, just cleaned up.
 *  - Anything else falls back to digits-only (keeping a leading "+" if present).
 */
function normalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== "string") return null;

  const cleaned = rawPhone.trim().replace(/[\s\-.()]/g, "");
  if (!cleaned) return null;

  const hasPlus = cleaned.startsWith("+");
  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return null;

  // Israeli local format: 0XXXXXXXXX (10 digits, starts with 0)
  if (!hasPlus && digits.length === 10 && digits.startsWith("0")) {
    return `+972${digits.slice(1)}`;
  }

  // Already Israeli international without plus: 972XXXXXXXXX
  if (!hasPlus && digits.startsWith("972") && digits.length === 12) {
    return `+${digits}`;
  }

  if (hasPlus) {
    return `+${digits}`;
  }

  // Unknown format - keep normalized digits so at least whitespace/formatting
  // differences don't create duplicate contacts.
  return digits;
}

module.exports = { normalizePhone };
