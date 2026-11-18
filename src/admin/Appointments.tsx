import { useState } from 'react';
import { clinics, money, type CityId } from '../lib/data';
import { useContent } from '../lib/content';
import { useStore, type Booking, type BookingStatus } from '../lib/store';
import { addDays, dayLabel, fmtTime, localNow } from '../lib/slots';
import { Area, Drawer, Field, Head, Select, useToast } from './ui';
import { t as tt, timeLabel, tr } from '../lib/i18n';

const statuses: { v: BookingStatus; label: string }[] = [
  { v: 'requested', label: 'Requested' }, { v: 'confirmed', label: 'Confirmed' }, { v: 'completed', label: 'Completed' }, { v: 'cancelled', label: 'Cancelled' }, { v: 'no-show', label: 'No-show' },
];
export function StatusPill({ s }: { s: BookingStatus }) { return <span className={`ad-pill ad-pill--${s}`}>{tt(statuses.find((x) => x.v === s)?.label ?? '')}</span>; }
function toMin(t: string) { const m = t.match(/(\d+):(\d+)\s*(am|pm)/); if (!m) return 0; let h = Number(m[1]) % 12; if (m[3] === 'pm') h += 12; return h * 60 + Number(m[2]); }

type Draft = Omit<Booking, 'id' | 'ref' | 'createdAt'> & { id?: string };

function Editor({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const { content } = useContent();
  const { addBooking, updateBooking, removeBooking } = useStore();
  const toast = useToast();
  const [b, setB] = useState<Draft>(initial);
  const [err, setErr] = useState<Record<string, string>>({});
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setB((x) => ({ ...x, [k]: v }));
  const c = content.clinics[b.city];
  const times = Array.from({ length: (c.closes - c.opens) * 2 }, (_, i) => fmtTime(c.opens * 60 + i * 30));
  const docs = content.doctors.filter((d) => d.city === b.city);
  const save = () => {
    const e: Record<string, string> = {};
    if (!b.name.trim()) e.name = 'Add the patient’s name.';
    if (!b.date) e.date = 'Choose a date.';
    setErr(e); if (Object.keys(e).length) return;
    if (b.id) { updateBooking(b.id, b); toast('Appointment updated'); }
    else { addBooking({ ...b, name: b.name.trim() }); toast(tt('Appointment added for {name}', { name: b.name.trim() })); }
    onClose();
  };
  return (
    <Drawer title={b.id ? 'Edit appointment' : 'New appointment'} onClose={onClose} onSave={save} saveLabel={b.id ? 'Save changes' : 'Add appointment'}
      onDelete={b.id ? () => { removeBooking(b.id!); toast('Appointment deleted'); onClose(); } : undefined} deleteLabel="Delete this appointment?">
      <div className="ad-form">
        <Field label="Patient name" id="ap-name" value={b.name} onChange={(v) => set('name', v)} error={err.name} wide />
        <Field label="Mobile" id="ap-phone" value={b.phone} onChange={(v) => set('phone', v)} />
        <Field label="Email" id="ap-email" type="email" value={b.email} onChange={(v) => set('email', v)} />
        <Select label="Clinic" id="ap-city" value={b.city} onChange={(v) => setB((x) => ({ ...x, city: v as CityId, doctorId: content.doctors.find((d) => d.city === v)?.id ?? '', time: fmtTime(content.clinics[v as CityId].opens * 60) }))} options={(['dxb', 'nyc'] as CityId[]).map((k) => ({ v: k, label: `${tr(content.clinics[k].area)}${tt(', ')}${tr(content.clinics[k].city)}` }))} />
        <Select label="Doctor" id="ap-doc" value={b.doctorId} onChange={(v) => set('doctorId', v)} options={docs.map((d) => ({ v: d.id, label: d.name }))} />
        <Select label="Treatment" id="ap-t" value={b.treatmentId ?? ''} onChange={(v) => set('treatmentId', v || null)} options={[{ v: '', label: 'General consultation' }, ...content.treatments.map((t) => ({ v: t.id, label: t.name }))]} wide />
        <Field label="Date" id="ap-date" type="date" value={b.date} onChange={(v) => set('date', v)} error={err.date} />
        <Select label="Time" id="ap-time" value={b.time} onChange={(v) => set('time', v)} options={times.map((t) => ({ v: t, label: timeLabel(t) }))} />
        <Select label="Status" id="ap-status" value={b.status ?? 'requested'} onChange={(v) => set('status', v)} options={statuses} />
        <Select label="Booked via" id="ap-src" value={b.source ?? 'phone'} onChange={(v) => set('source', v)} options={[{ v: 'web', label: 'Website' }, { v: 'phone', label: 'Phone / WhatsApp' }, { v: 'walk-in', label: 'Walk-in' }]} />
        <Area label="Notes" id="ap-notes" value={b.notes} onChange={(v) => set('notes', v)} />
      </div>
    </Drawer>
  );
}

export default function Appointments() {
  const { bookings, updateBooking } = useStore();
  const { content } = useContent();
  const toast = useToast();
  const [city, setCity] = useState<'all' | CityId>('all');
  const base = localNow('dxb').date;
  const [date, setDate] = useState(base);
  const [onlyReq, setOnlyReq] = useState(false);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Draft | null>(null);
  const days = Array.from({ length: 14 }, (_, i) => addDays(base, i - 3));
  const match = (b: Booking) => (city === 'all' || b.city === city) && (!q || `${b.name} ${b.email} ${b.ref}`.toLowerCase().includes(q.toLowerCase()));
  const list = (onlyReq ? bookings.filter((b) => b.status === 'requested') : bookings.filter((b) => b.date === date)).filter(match).sort((a, b) => a.date.localeCompare(b.date) || toMin(a.time) - toMin(b.time));
  const newOne = (): Draft => { const c: CityId = city === 'nyc' ? 'nyc' : 'dxb'; return { city: c, treatmentId: null, doctorId: content.doctors.find((d) => d.city === c)?.id ?? '', date, time: fmtTime(content.clinics[c].opens * 60), name: '', phone: '', email: '', notes: '', status: 'confirmed', source: 'phone' }; };

  return (
    <>
      <Head title="Appointments" sub="Confirm website requests, add phone bookings and keep the day running on time.">
        <button type="button" className="ad-btn ad-btn--primary" onClick={() => setEditing(newOne())}>{tt('+ New appointment')}</button>
      </Head>
      <div className="ad-tools">
        <div className="ad-seg" role="radiogroup" aria-label={tt('Clinic')}>
          {(['all', 'dxb', 'nyc'] as const).map((c) => <button key={c} type="button" role="radio" aria-checked={city === c} onClick={() => setCity(c)}>{c === 'all' ? tt('Both clinics') : clinics[c].city}</button>)}
        </div>
        <button type="button" className={`ad-chip ${onlyReq ? 'is-on' : ''}`} aria-pressed={onlyReq} onClick={() => setOnlyReq((v) => !v)}>{tt('Requests to confirm ({n})', { n: bookings.filter((b) => b.status === 'requested').length })}</button>
        <label className="ad-search"><span className="sr-only">{tt('Search patients')}</span><input id="ap-q" type="search" placeholder={tt('Search name, email or reference')} value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      {!onlyReq && (
        <div className="ad-days" role="radiogroup" aria-label={tt('Day')}>
          {days.map((d) => { const n = bookings.filter((b) => b.date === d && b.status !== 'cancelled' && (city === 'all' || b.city === city)).length; return (
            <button key={d} type="button" role="radio" aria-checked={date === d} className={`ad-day ${date === d ? 'is-on' : ''} ${d === base ? 'is-today' : ''}`} onClick={() => setDate(d)}>
              <small>{d === base ? tt('Today') : dayLabel(d, { weekday: 'short' })}</small><b>{dayLabel(d, { day: 'numeric' })}</b><span>{n ? tt(n > 1 ? '{n} appts' : '{n} appt', { n }) : '—'}</span>
            </button>
          ); })}
        </div>
      )}
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr><th>{tt(onlyReq ? 'When' : 'Time')}</th><th>{tt('Patient')}</th><th>{tt('Treatment')}</th><th>{tt('Doctor')}</th><th>{tt('Clinic')}</th><th>{tt('Status')}</th><th><span className="sr-only">{tt('Edit')}</span></th></tr></thead>
          <tbody>
            {list.map((b) => {
              const t = content.treatments.find((x) => x.id === b.treatmentId); const d = content.doctors.find((x) => x.id === b.doctorId);
              return (
                <tr key={b.id}>
                  <td className="ad-nowrap"><b>{timeLabel(b.time)}</b>{onlyReq && <small>{dayLabel(b.date)}</small>}</td>
                  <td><span className="ad-who"><b>{b.name}</b><small><bdi>{b.ref}</bdi> · {tt(b.source === 'web' ? 'Website' : b.source === 'walk-in' ? 'Walk-in' : 'Phone')}</small></span></td>
                  <td>{t ? <span className="ad-who"><span>{tr(t.name)}</span><small>{tt('from')} {money(t.price[b.city], b.city)}</small></span> : tt('General consultation')}</td>
                  <td>{d ? tr(d.name) : '—'}</td>
                  <td><span className={`ad-city ad-city--${b.city}`}>{clinics[b.city].city}</span></td>
                  <td>
                    <label className="sr-only" htmlFor={`st-${b.id}`}>{tt('Status for {name}', { name: b.name })}</label>
                    <select id={`st-${b.id}`} className={`ad-status ad-status--${b.status ?? 'requested'}`} value={b.status ?? 'requested'} onChange={(e) => { updateBooking(b.id, { status: e.target.value as BookingStatus }); toast(`${b.name}: ${tt(statuses.find((s) => s.v === e.target.value)?.label ?? '')}`); }}>
                      {statuses.map((s) => <option key={s.v} value={s.v}>{tt(s.label)}</option>)}
                    </select>
                  </td>
                  <td className="ad-right">{b.status === 'requested' && <button type="button" className="ad-btn ad-btn--primary ad-btn--sm" onClick={() => { updateBooking(b.id, { status: 'confirmed' }); toast(tt('{name} confirmed', { name: b.name })); }}>{tt('Confirm')}</button>} <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => setEditing({ ...b })}>{tt('Edit')}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="ad-empty ad-empty--pad">{tt(onlyReq ? 'No requests waiting. New website bookings appear here.' : 'No appointments on this day.')} <button type="button" className="ad-link" onClick={() => setEditing(newOne())}>{tt('Add one')}</button></p>}
      </div>
      {editing && <Editor initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
