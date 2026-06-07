<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:rtl-i18n-rules -->
# RTL + i18n readiness (Arabic-first, English-ready)

The app ships **Arabic / RTL only** for now. An English / LTR version is **deferred, not abandoned** — so write every component to be direction-agnostic and translation-ready. The cost of these rules now is near zero; retrofitting them later is a rewrite.

**Direction — never hardcode physical sides.** Use CSS *logical* properties so the layout mirrors automatically when `dir` flips:
- ✅ `start` / `end`, `ms-*` / `me-*`, `ps-*` / `pe-*`, `text-start` / `text-end`, `border-s` / `border-e`, `rounded-s-*` / `rounded-e-*`
- ❌ `left` / `right`, `ml-*` / `mr-*`, `pl-*` / `pr-*`, `text-left` / `text-right`, `border-l` / `border-r`
- Centering pairs like `left-1/2 -translate-x-1/2` are direction-neutral and fine.
- Mirror directional icons (arrows, chevrons, back buttons) with the direction, not a fixed side.

**Direction must be a variable, not a constant.** Drive `dir`/`lang` from a single locale value (`dir={locale === "ar" ? "rtl" : "ltr"}`), never a literal `dir="rtl"` scattered across the tree. One place to flip later.

**Strings stay translatable.** Don't bury Arabic UI text deep inside nested JSX. Keep each screen's user-facing strings collected (top of the component or a small per-area strings module) so adding English is "add a dictionary," not "re-touch every component." No `next-intl` / locale routing yet — just keep strings extractable.

**Formatting via `Intl`.** Use `Intl.NumberFormat` / `Intl.DateTimeFormat` for numbers, currency, and dates rather than hand-formatting — correct in both locales for free.

**Out of scope for now (do NOT add unprompted):** `next-intl`, locale routing (`/ar`, `/en`), a language switcher, or any translations. Just keep the code ready for them.
<!-- END:rtl-i18n-rules -->
