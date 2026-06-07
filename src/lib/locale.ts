// Single source of truth for direction/locale. Only Arabic ships today; flip
// LOCALE here (the master switch) once an English build is ready — every
// dir/lang in the app is threaded through these constants.
export type Locale = "ar" | "en";

export const LOCALE: Locale = "ar";

export const DIR: "rtl" | "ltr" = LOCALE === "ar" ? "rtl" : "ltr";

// BCP-47 tag used for Intl formatting. Intl.NumberFormat("ar") would render
// Arabic-Indic digits; the UI currently uses Latin digits everywhere, so we
// pin to "en-US" for now and revisit when real digit localization lands.
const NUMBER_LOCALE = "en-US";

/** Group-separated integer/decimal, e.g. 1234567 -> "1,234,567". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(NUMBER_LOCALE).format(value);
}

/** Percent from a 0–100 value, e.g. 25 -> "25%". */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat(NUMBER_LOCALE, { style: "percent" }).format(value / 100);
}
