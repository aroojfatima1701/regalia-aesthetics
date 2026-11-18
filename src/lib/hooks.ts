import { useEffect, useState, type RefObject } from 'react';
import { isAr } from './i18n';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** True once the element has scrolled into view (stays true). */
export function useInView(ref: RefObject<Element | null>, threshold = 0.3): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, seen]);
  return seen;
}

/** 0 when the element's top reaches the bottom of the viewport, 1 when its bottom leaves the top. */
export function useScrollProgress(ref: RefObject<Element | null>): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0; const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(); const vh = window.innerHeight;
      const total = r.height - vh;
      const v = total > 0 ? -r.top / total : (vh - r.top) / (vh + r.height);
      setP(Math.min(1, Math.max(0, v)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
  return p;
}

/** Live local time in a time zone, ticking every second. */
export function useClock(timeZone: string): { label: string; hour: number; minute: number; second: number } {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  if (!now) return { label: '--:--', hour: 9, minute: 0, second: 0 };
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(now);
  const get = (t: string) => Number(parts.find((x) => x.type === t)?.value ?? 0);
  const hour = get('hour') % 24; const minute = get('minute'); const second = get('second');
  const label = new Intl.DateTimeFormat(isAr() ? 'ar-AE-u-nu-latn' : 'en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(now);
  return { label, hour, minute, second };
}
