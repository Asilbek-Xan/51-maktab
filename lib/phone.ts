/** O'zbekiston raqami: +998 dan keyin 9 ta raqam — operator kodi (XX) va raqam (AAA AA AA). */
export const UZ_PHONE_DIGITS = 9;

/** Kiritilgan matndan faqat +998 dan keyingi 9 ta raqamni ajratadi. */
export function uzPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length > UZ_PHONE_DIGITS && digits.startsWith('998')) digits = digits.slice(3);
  return digits.slice(0, UZ_PHONE_DIGITS);
}

/** "901234567" → "90 123 45 67" (yozish jarayonida qisman ham ishlaydi). */
export function formatUzPhone(digits: string): string {
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ');
}

/** To'liq raqam bo'lsa "+998 90 123 45 67", aks holda null. */
export function normalizeUzPhone(value: string): string | null {
  const raw = value.trim();
  // Ruxsat etilgan belgilar: raqam, bo'sh joy, boshidagi "+". Harf yoki boshqa belgi bo'lsa — rad.
  if (!/^\+?[\d\s]+$/.test(raw)) return null;
  const all = raw.replace(/\D/g, '');
  const digits = all.length === 12 && all.startsWith('998') ? all.slice(3) : all.length === 9 ? all : '';
  return digits.length === UZ_PHONE_DIGITS ? `+998 ${formatUzPhone(digits)}` : null;
}
