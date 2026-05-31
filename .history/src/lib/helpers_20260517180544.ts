// ── PRICE HELPERS ──
export const rupeesToPaise = (rupees: number): number =>
  Math.round(rupees * 100);

export const paiseToRupees = (paise: number): number =>
  Math.round(paise) / 100;

export const formatPrice = (paise: number): string =>
  `Rs. ${(paise / 100).toLocaleString("en-IN")}`;

// ── VALIDATION HELPERS ──
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone: string): boolean =>
  /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));

export const isValidPincode = (pincode: string): boolean =>
  /^\d{6}$/.test(pincode);

// ── SLUG HELPER ──
export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

// ── PAGINATION HELPER ──
export const getPagination = (page: string | null, limit: string | null) => {
  const p = Math.max(1, parseInt(page || "1"));
  const l = Math.min(50, Math.max(1, parseInt(limit || "20")));
  return { page: p, limit: l, skip: (p - 1) * l };
};