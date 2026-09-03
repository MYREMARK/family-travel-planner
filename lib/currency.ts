// ─── Shared currency model for the whole app ───────────────────────────────────
// ONE exchange rate, used everywhere. Do not hardcode a different rate anywhere
// else in the app — always import from here so every €/₪ figure agrees.

// Sourced from Investing.com / XE.com / KeyCurrency, all converging on the
// same ~3.49–3.51 mid-market range at time of research (Sept 2026).
// Rounded to a clean, clearly-labeled figure rather than chasing live ticks
// that will already be stale by the time this is read.
export const EUR_TO_ILS = 3.5;
export const RATE_SOURCE = "Investing.com / XE.com, ספטמבר 2026 (טווח 3.49–3.51, עוגל ל-3.50)";

export type PriceStatus = "confirmed" | "estimated" | "unknown";

export const STATUS_LABEL: Record<PriceStatus, string> = {
  confirmed: "🟢 מאומת",
  estimated: "🟡 משוער",
  unknown:   "🔴 לא ידוע",
};

export const STATUS_COLOR: Record<PriceStatus, { bg: string; color: string }> = {
  confirmed: { bg: "#dcfce7", color: "#15803d" },
  estimated: { bg: "#fef9ec", color: "#b45309" },
  unknown:   { bg: "#fef2f2", color: "#dc2626" },
};

/** ₪ amount for a given € amount, using the app-wide rate. Rounded to whole ₪. */
export function ils(eur: number): number {
  return Math.round(eur * EUR_TO_ILS);
}

/** "€12 · ≈ ₪42" */
export function fmtMoney(eur: number): string {
  const eurStr = Number.isInteger(eur) ? `€${eur}` : `€${eur.toFixed(2)}`;
  return `${eurStr} · ≈ ₪${ils(eur).toLocaleString("he-IL")}`;
}

/** "₪1,234" */
export function fmtIls(amountIls: number): string {
  return `₪${Math.round(amountIls).toLocaleString("he-IL")}`;
}

/** "€1,234" */
export function fmtEur(amountEur: number): string {
  return `€${Math.round(amountEur).toLocaleString("he-IL")}`;
}
