"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { API_BASE, clearAppPassword, getAppPassword, setAppPassword } from "@/lib/api/client";

// User-facing strings, kept together for easy translation later (Arabic-only today).
const STRINGS = {
  heading: "الدخول إلى الاستوديو",
  subtitle: "أدخل كلمة المرور للوصول إلى استوديو التسويق.",
  placeholder: "كلمة المرور",
  submit: "دخول",
  checking: "جارٍ التحقق…",
  wrongPassword: "كلمة المرور غير صحيحة",
} as const;

type GateState = "probing" | "locked" | "authorized";

/**
 * Probe a lightweight GET endpoint with the currently stored password.
 * 200 → access granted (also covers the case where the backend gate is
 * disabled and no password is needed). 401 → password required/wrong.
 */
async function probeAccess(signal?: AbortSignal): Promise<boolean> {
  const headers = new Headers();
  const password = getAppPassword();
  if (password) headers.set("x-app-password", password);
  const res = await fetch(`${API_BASE}/api/generations`, { headers, signal });
  return res.ok;
}

/**
 * Shared-password access gate. Renders `children` only once the backend
 * accepts the request. When the backend gate is disabled the probe returns
 * 200 without a password, so users see no prompt at all.
 */
export function AppGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>("probing");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    probeAccess(controller.signal)
      .then((ok) => setState(ok ? "authorized" : "locked"))
      .catch((err) => {
        if (controller.signal.aborted) return;
        // Network/other failure: treat as locked so the user can retry.
        setState("locked");
        void err;
      });
    return () => controller.abort();
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting || !value.trim()) return;
      setSubmitting(true);
      setError(false);
      setAppPassword(value.trim());
      try {
        const ok = await probeAccess();
        if (ok) {
          setState("authorized");
        } else {
          clearAppPassword();
          setError(true);
        }
      } catch {
        clearAppPassword();
        setError(true);
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, value],
  );

  if (state === "authorized") return <>{children}</>;

  if (state === "probing") {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center bg-page">
        <p className="text-sm text-ink-muted">{STRINGS.checking}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-page p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-line bg-card p-8 shadow-[0px_0px_0px_1px_rgba(101,101,101,0.06),0px_13px_13px_0px_rgba(0,0,0,0.04),0px_3px_7px_0px_rgba(0,0,0,0.05)]"
      >
        <h1 className="text-xl font-semibold text-ink">{STRINGS.heading}</h1>
        <p className="mt-2 text-sm text-ink-muted">{STRINGS.subtitle}</p>

        <input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          placeholder={STRINGS.placeholder}
          autoFocus
          autoComplete="current-password"
          aria-invalid={error}
          className="mt-6 h-11 w-full rounded-xl border border-line bg-transparent px-3 text-sm text-ink outline-none transition-colors focus:border-line-hover"
        />

        {error && (
          <p className="mt-2 text-xs text-danger" role="alert">
            {STRINGS.wrongPassword}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !value.trim()}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-card transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? STRINGS.checking : STRINGS.submit}
        </button>
      </form>
    </div>
  );
}
