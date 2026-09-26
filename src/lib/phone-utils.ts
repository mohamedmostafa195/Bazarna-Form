/**
 * Utility functions for normalizing and matching phone numbers,
 * specifically handling Egyptian phone numbers and various formats.
 */

export function normalizePhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  // 0020xxxxxxxxxx -> 0xxxxxxxxxx
  if (digits.startsWith("0020")) {
    return "0" + digits.slice(4);
  }
  // 20xxxxxxxxxx (12 digits, Egypt country code) -> 0xxxxxxxxxx
  if (digits.startsWith("20") && digits.length === 12) {
    return "0" + digits.slice(2);
  }
  // 10xxxxxxxx, 11xxxxxxxx, 12xxxxxxxx, 15xxxxxxxx (10 digits without leading 0) -> 0xxxxxxxxxx
  if (
    digits.length === 10 &&
    (digits.startsWith("10") ||
      digits.startsWith("11") ||
      digits.startsWith("12") ||
      digits.startsWith("15"))
  ) {
    return "0" + digits;
  }

  return digits;
}

export function arePhoneNumbersEqual(phone1?: string | null, phone2?: string | null): boolean {
  if (!phone1 || !phone2) return false;

  const p1 = phone1.trim().toLowerCase();
  const p2 = phone2.trim().toLowerCase();
  if (p1 === p2) return true;

  const n1 = normalizePhoneNumber(phone1);
  const n2 = normalizePhoneNumber(phone2);
  if (n1 && n2 && n1 === n2) return true;

  const d1 = phone1.replace(/\D/g, "");
  const d2 = phone2.replace(/\D/g, "");
  if (d1.length >= 9 && d2.length >= 9) {
    return d1.slice(-9) === d2.slice(-9);
  }

  return false;
}
