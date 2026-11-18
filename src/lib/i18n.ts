import { useSyncExternalStore } from 'react';
import { AR } from './ar';

// English and Arabic. The website and the admin panel each remember their own language.
// In the Next.js build this maps to /en and /ar routes with next-intl; here it is one switch.
export type Lang = 'en' | 'ar';
const KEY = 'ra-lang';
const AKEY = 'ra-admin-lang';

let chosen: Lang = (() => { try { return localStorage.getItem(KEY) === 'ar' ? 'ar' : 'en'; } catch { return 'en'; } })();
let adminChosen: Lang = (() => { try { return localStorage.getItem(AKEY) === 'ar' ? 'ar' : 'en'; } catch { return 'en'; } })();
let admin = false;
const subs = new Set<() => void>();
const hooks = new Set<(l: Lang) => void>();

/** The language the page is rendering in right now. */
export const lang = (): Lang => (admin ? adminChosen : chosen);
export const adminLang = () => adminChosen;
export const isAr = () => lang() === 'ar';
export const chosenLang = () => chosen;

function changed(before: Lang) { const now = lang(); if (now !== before) hooks.forEach((f) => f(now)); }
export function setLang(l: Lang) {
  const before = lang(); chosen = l;
  try { localStorage.setItem(KEY, l); } catch { /* keep in memory */ }
  changed(before); subs.forEach((f) => f());
}
export function setAdminLang(l: Lang) {
  const before = lang(); adminChosen = l;
  try { localStorage.setItem(AKEY, l); } catch { /* keep in memory */ }
  changed(before); subs.forEach((f) => f());
}
/** Called by the app shell while rendering, before any child reads content. */
export function setAdminMode(on: boolean) { if (on === admin) return; const before = lang(); admin = on; changed(before); }
/** Content modules re-localise their live data when the language changes. */
export function onLangChange(f: (l: Lang) => void) { hooks.add(f); }

const snap = () => `${chosen}|${adminChosen}`;
export function useLang(): string {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, snap, snap);
}

/** Translate an English UI string. {name} placeholders are filled from vars. */
const missing = new Set<string>();
if (typeof window !== 'undefined') (window as unknown as { __raMissing: Set<string> }).__raMissing = missing;
const look = (en: string) => { const v = AR[en]; if (v === undefined && /[A-Za-z]/.test(en) && !/[\u0600-\u06FF]/.test(en)) missing.add(en); return v ?? en; };
export function t(en: string, vars?: Record<string, string | number>): string {
  let s = isAr() ? look(en) : en;
  if (vars) for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}
/** Translate a content value (treatment text, doctor bio…) if a translation exists. */
export const tr = (en: string): string => (isAr() ? look(en) : en);

/** "10:30 am" → "10:30 ص" in Arabic. Booking keys stay in English. */
export const timeLabel = (s: string) => (isAr() ? s.replace(' am', ' ص').replace(' pm', ' م') : s);
export const locale = () => (isAr() ? 'ar-AE-u-nu-latn' : 'en-GB');
