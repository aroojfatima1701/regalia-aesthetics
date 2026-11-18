import { clinics, doctors, type CityId } from './data';
import { locale } from './i18n';

// Sample availability: the same day always shows the same open and booked slots.
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

export function localNow(city: CityId) {
  const tz = clinics[city].timeZone; const d = new Date();
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: (Number(p.hour) % 24) * 60 + Number(p.minute) };
}
export function addDays(date: string, n: number) { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export function dayLabel(date: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) { return new Intl.DateTimeFormat(locale(), { ...opts, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)); }
export function closedDay(city: CityId, date: string) { const wd = new Date(`${date}T12:00:00Z`).getUTCDay(); return city === 'dxb' ? wd === 5 : wd === 0; }
export function fmtTime(min: number) { const h = Math.floor(min / 60); const m = min % 60; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; }

/** Open 30-minute slots for a doctor on a date, in the clinic's local time. */
export function slotsFor(city: CityId, doctorId: string, date: string) {
  const c = clinics[city]; const now = localNow(city);
  if (closedDay(city, date)) return [];
  const out: { min: number; label: string; open: boolean }[] = [];
  for (let m = c.opens * 60; m < c.closes * 60; m += 30) {
    const past = date === now.date && m <= now.minutes + 60;
    const booked = hash(`${doctorId}${date}${m}`) < 0.45;
    out.push({ min: m, label: fmtTime(m), open: !past && !booked });
  }
  return out;
}
export function nextFree(city: CityId) {
  const now = localNow(city);
  for (let d = 0; d < 7; d++) {
    const date = addDays(now.date, d);
    for (const doc of doctors.filter((x) => x.city === city)) {
      const s = slotsFor(city, doc.id, date).find((x) => x.open);
      if (s) return { date, label: s.label, doctor: doc, today: d === 0, tomorrow: d === 1 };
    }
  }
  return null;
}
