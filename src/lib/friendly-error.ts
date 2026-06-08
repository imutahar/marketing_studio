// Turn raw backend/provider error strings into a short, friendly Arabic message
// for merchants. Provider errors (BytePlus/ModelArk) are technical, English, and
// leak account ids / request ids — never show those to the user.

const GENERIC = "تعذّر إنشاء الإعلان. حاول مرة أخرى بعد قليل.";

export function friendlyError(raw?: string | null): string {
  if (!raw) return GENERIC;
  const s = raw.toLowerCase();

  // Provider capacity / account limit / "safe experience mode" paused.
  if (
    s.includes("inference limit") ||
    s.includes("model service has been paused") ||
    s.includes("safe experience mode") ||
    s.includes("rate limit") ||
    s.includes("too many requests") ||
    s.includes("429")
  ) {
    return "الخدمة مزدحمة حاليًا بسبب كثرة الطلبات. يُرجى المحاولة مرة أخرى بعد قليل.";
  }

  // Our own daily cap.
  if (s.includes("daily generation limit")) {
    return "لقد بلغت الحد اليومي لعدد الإعلانات. يمكنك المتابعة غدًا.";
  }

  // Timeouts.
  if (s.includes("timed out") || s.includes("timeout") || raw.includes("انتهت مهلة")) {
    return "استغرق الإنشاء وقتًا أطول من المتوقع. حاول مرة أخرى.";
  }

  // Credits / balance.
  if (s.includes("insufficient") || s.includes("balance") || s.includes("الرصيد")) {
    return "رصيدك غير كافٍ لإتمام هذا الإنشاء.";
  }

  // Any other technical provider/server noise → hide the details.
  if (
    s.includes("byteplus") ||
    s.includes("request id") ||
    s.includes("modelark") ||
    s.includes("model") ||
    /\bhttp\b|\b5\d\d\b|\b4\d\d\b/.test(s)
  ) {
    return GENERIC;
  }

  // Already a clean, short Arabic message (e.g. our own validation) → keep it.
  if (/[؀-ۿ]/.test(raw) && raw.trim().length <= 120) return raw.trim();

  return GENERIC;
}
