import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { categories, clinics, concerns, doctors, memberships, treatments, type CityId, type Clinic, type Doctor, type Membership, type Treatment } from './data';
import { lang, onLangChange, tr } from './i18n';
import { doctorPhoto, heroSlides, treatmentPhoto } from './photos';
import placeholder from '../assets/photos/velvet.jpg';
import * as arDict from './ar';

// Everything the admin panel can edit. The website reads the same live objects, so a change
// in the admin shows on the site straight away. Saved in this browser (the full build saves to Laravel).
export interface Slide { id: string; src: string; label: string; to: string; alt: string }
export interface SiteText { eyebrow: string; title1: string; title2: string; sub: string; closing: string }
export interface Content {
  treatments: Treatment[]; doctors: Doctor[]; memberships: Membership[]; clinics: Record<CityId, Clinic>; slides: Slide[]; text: SiteText;
  /** Arabic version of the hero and closing text. */
  textAr: SiteText;
}

export const siteText: SiteText = {
  eyebrow: 'Doctor-led aesthetics · Dubai & New York', title1: 'Beauty,', title2: 'tailored to you',
  sub: 'Natural results from doctors who plan every treatment around your face, your skin and your life. Always starting with a consultation.',
  closing: 'Your skin, crowned.',
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const trText = (x: SiteText): SiteText => ({ eyebrow: tr(x.eyebrow), title1: tr(x.title1), title2: tr(x.title2), sub: tr(x.sub), closing: tr(x.closing) });
const enConcerns = clone(concerns);
const enCategories = clone(categories);
const defaults: Content = clone({
  treatments: treatments.map((t) => ({ ...t, photo: treatmentPhoto[t.id], published: true })),
  doctors: doctors.map((d) => ({ ...d, photo: doctorPhoto[d.id] })),
  memberships, clinics, slides: heroSlides.map((s, i) => ({ ...s, id: `s${i}` })), text: siteText, textAr: siteText,
});
// Filled in once the Arabic dictionary can be read (tr() depends on the current language).
let defaultsReady = false;
function ensureDefaults() {
  if (defaultsReady) return; defaultsReady = true;
  const { AR } = arDict;
  const x = defaults.text; defaults.textAr = { eyebrow: AR[x.eyebrow] ?? x.eyebrow, title1: AR[x.title1] ?? x.title1, title2: AR[x.title2] ?? x.title2, sub: AR[x.sub] ?? x.sub, closing: AR[x.closing] ?? x.closing };
}

const locT = (t: Treatment): Treatment => ({ ...t, name: t.nameAr || tr(t.name), short: t.shortAr || tr(t.short), about: tr(t.about), per: t.per && tr(t.per), duration: tr(t.duration), downtime: tr(t.downtime), sessions: tr(t.sessions), lasts: tr(t.lasts), journey: t.journey.map((s) => ({ when: tr(s.when), what: tr(s.what) })), faqs: t.faqs.map((f) => ({ q: tr(f.q), a: tr(f.a) })) });
const locD = (d: Doctor): Doctor => ({ ...d, name: tr(d.name), role: tr(d.role), bio: tr(d.bio), focus: d.focus.map(tr), languages: tr(d.languages), quote: tr(d.quote) });
const locM = (m: Membership): Membership => ({ ...m, name: tr(m.name), perks: m.perks.map(tr) });
const locC = (c: Clinic): Clinic => ({ ...c, city: tr(c.city), area: tr(c.area), address: tr(c.address), hoursLabel: tr(c.hoursLabel), license: tr(c.license) });
let current: Content = defaults;

/** Copy saved content into the shared objects the website renders from. */
function apply(c: Content) {
  current = c;
  const ar = lang() === 'ar';
  const id = <T,>(v: T) => v;
  const lt = ar ? locT : id<Treatment>, ld = ar ? locD : id<Doctor>, lm = ar ? locM : id<Membership>, lc = ar ? locC : id<Clinic>;
  treatments.splice(0, treatments.length, ...c.treatments.filter((t) => t.published !== false).map(lt));
  doctors.splice(0, doctors.length, ...c.doctors.map(ld));
  memberships.splice(0, memberships.length, ...c.memberships.map(lm));
  clinics.dxb = lc(c.clinics.dxb); clinics.nyc = lc(c.clinics.nyc);
  heroSlides.splice(0, heroSlides.length, ...c.slides.map((s) => (ar ? { ...s, label: tr(s.label), alt: tr(s.alt) } : s)));
  concerns.forEach((x, i) => { x.label = tr(enConcerns[i].label); x.note = tr(enConcerns[i].note); });
  categories.forEach((x, i) => { x.label = tr(enCategories[i].label); x.blurb = tr(enCategories[i].blurb); });
  for (const k of Object.keys(treatmentPhoto)) delete treatmentPhoto[k];
  c.treatments.forEach((t) => { treatmentPhoto[t.id] = t.photo || placeholder; });
  for (const k of Object.keys(doctorPhoto)) delete doctorPhoto[k];
  c.doctors.forEach((d) => { doctorPhoto[d.id] = d.photo || placeholder; });
  Object.assign(siteText, ar ? { ...trText(c.text), ...pick(c.textAr) } : c.text);
}
const pick = (x?: SiteText) => Object.fromEntries(Object.entries(x ?? {}).filter(([, v]) => v && String(v).trim()));
onLangChange(() => apply(current));

interface Ctx { content: Content; version: number; save: (fn: (c: Content) => Content) => boolean; reset: () => void }
const C = createContext<Ctx | null>(null);
const KEY = 'ra-content-v1';

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(() => { ensureDefaults(); const d = clone(defaults); apply(d); return d; });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    try { const v = localStorage.getItem(KEY); if (v) { const c = { ...clone(defaults), ...JSON.parse(v) } as Content; apply(c); setContent(c); setVersion((n) => n + 1); } } catch { /* use defaults */ }
  }, []);
  const save = useCallback((fn: (c: Content) => Content) => {
    const next = fn(clone(content));
    let ok = true;
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { ok = false; }
    apply(next); setContent(next); setVersion((n) => n + 1);
    return ok;
  }, [content]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } const d = clone(defaults); apply(d); setContent(d); setVersion((n) => n + 1); }, []);
  return <C.Provider value={{ content, version, save, reset }}>{children}</C.Provider>;
}
export function useContent() { const v = useContext(C); if (!v) throw new Error('useContent outside provider'); return v; }

/** Resize an uploaded image to a JPEG data URL so it fits in browser storage. */
export function fileToJpeg(file: File, maxW = 900, ratio?: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (ratio) { if (sw / sh > ratio) { sw = sh * ratio; sx = (img.width - sw) / 2; } else { sh = sw / ratio; sy = (img.height - sh) / 2; } }
      const w = Math.min(maxW, sw); const h = Math.round(w * sh / sw);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file isn’t an image we can read. Try a JPG or PNG.')); };
    img.src = url;
  });
}
