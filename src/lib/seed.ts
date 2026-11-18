import { doctors, treatments, type CityId } from './data';
import { addDays, localNow, fmtTime } from './slots';
import type { Booking, BookingStatus } from './store';

// Sample appointments around today so the admin calendar is never empty.
const names = ['Sara Khan', 'Mariam Al Hashimi', 'Aisha Rahman', 'Noor Haddad', 'Lina Farouk', 'Hessa Al Mansoori', 'Priya Nair', 'Fatima Zahra', 'Emma Collins', 'Olivia Brooks', 'Sofia Martinez', 'Grace Lee', 'Hannah Kim', 'Chloe Bennett', 'Ava Thompson', 'Isabella Reyes'];
function rng(seed: number) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

export function seedBookings(): Booking[] {
  const out: Booking[] = []; const r = rng(91);
  (['dxb', 'nyc'] as CityId[]).forEach((city) => {
    const today = localNow(city).date;
    const docs = doctors.filter((d) => d.city === city);
    for (let d = -3; d <= 6; d++) {
      const date = addDays(today, d);
      const n = 3 + Math.floor(r() * 4);
      const used = new Set<number>();
      for (let k = 0; k < n; k++) {
        let m = (city === 'dxb' ? 10 : 9) * 60 + Math.floor(r() * 16) * 30; while (used.has(m)) m += 30; used.add(m);
        const t = treatments[Math.floor(r() * treatments.length)];
        const status: BookingStatus = d < 0 ? (r() < 0.85 ? 'completed' : r() < 0.5 ? 'no-show' : 'cancelled') : d === 0 ? (r() < 0.6 ? 'confirmed' : 'completed') : r() < 0.85 ? 'confirmed' : 'requested';
        const name = names[Math.floor(r() * names.length)];
        out.push({ id: `seed-${city}-${d}-${k}`, ref: `RA-${1000 + out.length * 37 % 9000}`, city, treatmentId: r() < 0.8 ? t.id : null, doctorId: docs[Math.floor(r() * docs.length)].id, date, time: fmtTime(m), name, phone: city === 'dxb' ? '+971 50 000 0000' : '+1 212 000 0000', email: `${name.split(' ')[0].toLowerCase()}@example.com`, notes: '', createdAt: Date.now() - (5 - d) * 86400000, status, source: r() < 0.6 ? 'web' : r() < 0.7 ? 'phone' : 'walk-in' });
      }
    }
  });
  return out;
}
