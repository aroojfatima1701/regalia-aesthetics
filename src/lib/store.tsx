import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CityId } from './data';
import { seedBookings } from './seed';

export interface Booking {
  id: string; ref: string; city: CityId; treatmentId: string | null; doctorId: string; date: string; time: string;
  name: string; phone: string; email: string; notes: string; createdAt: number;
  status?: BookingStatus; source?: 'web' | 'phone' | 'walk-in';
}
export type BookingStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
/** What the booking form starts with, e.g. from a treatment page or the skin quiz. */
export interface Draft { treatmentId?: string | null; plan?: string[] }

interface Store {
  city: CityId; setCity: (c: CityId) => void;
  draft: Draft; setDraft: (d: Draft) => void;
  bookings: Booking[]; addBooking: (b: Omit<Booking, 'id' | 'ref' | 'createdAt'>) => Booking; lastBooking: Booking | null;
  updateBooking: (id: string, patch: Partial<Booking>) => void; removeBooking: (id: string) => void; resetBookings: () => void;
}
const Ctx = createContext<Store | null>(null);
function read<T>(k: string, f: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : f; } catch { return f; } }
function write(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<CityId>('dxb');
  const [draft, setDraft] = useState<Draft>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastBooking, setLast] = useState<Booking | null>(null);
  useEffect(() => { setCityState(read<CityId>('ra-city', 'dxb')); setBookings(read<Booking[] | null>('ra-bookings', null) ?? seedBookings()); }, []);
  const setCity = useCallback((c: CityId) => { setCityState(c); write('ra-city', c); }, []);
  const addBooking = useCallback((b: Omit<Booking, 'id' | 'ref' | 'createdAt'>) => {
    const full: Booking = { status: 'requested', source: 'web', ...b, id: `bk-${Date.now()}`, ref: `RA-${String(Math.floor(1000 + Math.random() * 9000))}`, createdAt: Date.now() };
    setBookings((bs) => { const n = [full, ...bs]; write('ra-bookings', n); return n; });
    setLast(full);
    return full;
  }, []);
  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => setBookings((bs) => { const n = bs.map((b) => (b.id === id ? { ...b, ...patch } : b)); write('ra-bookings', n); return n; }), []);
  const removeBooking = useCallback((id: string) => setBookings((bs) => { const n = bs.filter((b) => b.id !== id); write('ra-bookings', n); return n; }), []);
  const resetBookings = useCallback(() => { const n = seedBookings(); write('ra-bookings', n); setBookings(n); }, []);
  return <Ctx.Provider value={{ city, setCity, draft, setDraft, bookings, addBooking, lastBooking, updateBooking, removeBooking, resetBookings }}>{children}</Ctx.Provider>;
}
export function useStore() { const v = useContext(Ctx); if (!v) throw new Error('useStore outside provider'); return v; }
