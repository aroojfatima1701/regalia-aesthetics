import { useMemo, useState } from 'react';
import { clinics, money, type CityId } from '../lib/data';
import { useContent } from '../lib/content';
import { useStore, type Booking } from '../lib/store';
import { Link } from '../lib/router';
import { addDays, dayLabel, localNow } from '../lib/slots';
import { Head, Kpi } from './ui';
import { StatusPill } from './Appointments';
import { lang, t as tt, timeLabel, tr } from '../lib/i18n';

const AED = 3.6725;
const SERIES: Record<CityId, string> = { dxb: '#4B1E3F', nyc: '#B07A93' };

function toMin(t: string) { const m = t.match(/(\d+):(\d+)\s*(am|pm)/); if (!m) return 0; let h = Number(m[1]) % 12; if (m[3] === 'pm') h += 12; return h * 60 + Number(m[2]); }

export default function Dashboard() {
  const { bookings } = useStore();
  const { content } = useContent();
  const [hover, setHover] = useState<number | null>(null);
  const priceOf = (b: Booking) => { const t = content.treatments.find((x) => x.id === b.treatmentId); const p = t ? t.price[b.city] : content.clinics[b.city].consultFee; return b.city === 'dxb' ? p / AED : p; };
  const today = { dxb: localNow('dxb').date, nyc: localNow('nyc').date };
  const live = bookings.filter((b) => b.status !== 'cancelled');
  const todays = live.filter((b) => b.date === today[b.city]).sort((a, b) => a.city.localeCompare(b.city) || toMin(a.time) - toMin(b.time));
  const requests = bookings.filter((b) => b.status === 'requested');
  const week = live.filter((b) => b.date >= today[b.city] && b.date <= addDays(today[b.city], 6));
  const weekValue = week.reduce((s, b) => s + priceOf(b), 0);
  const done = bookings.filter((b) => b.date < today[b.city] && b.date >= addDays(today[b.city], -7));
  const noShow = done.filter((b) => b.status === 'no-show').length;

  const days = Array.from({ length: 7 }, (_, i) => addDays(today.dxb, i));
  const perDay = days.map((d) => ({ d, dxb: live.filter((b) => b.city === 'dxb' && b.date === d).length, nyc: live.filter((b) => b.city === 'nyc' && b.date === d).length }));
  const max = Math.max(4, ...perDay.flatMap((p) => [p.dxb, p.nyc])); const step = Math.ceil(max / 4); const top = step * 4;
  const top5 = useMemo(() => {
    const m = new Map<string, number>(); live.forEach((b) => { const k = b.treatmentId ?? 'consult'; m.set(k, (m.get(k) ?? 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => { const t = content.treatments.find((x) => x.id === id); return { id, n, name: t ? tr(t.name) : tt('General consultation'), photo: t?.photo }; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, content, lang()]);
  const W = 640, H = 210, pl = 30, pb = 28, pt = 10; const bw = (W - pl) / 7; const y = (v: number) => pt + (H - pt - pb) * (1 - v / top);

  return (
    <>
      <Head title="Good day" sub="Both clinics at a glance. Every number below updates as you edit appointments.">
        <Link to="/admin-appointments" className="ad-btn ad-btn--primary">{tt('Open appointments')}</Link>
      </Head>
      <div className="ad-kpis">
        <Kpi label="Appointments today" value={String(todays.length)} sub={tt('{a} Dubai · {b} New York', { a: todays.filter((b) => b.city === 'dxb').length, b: todays.filter((b) => b.city === 'nyc').length })} />
        <Kpi label="New requests to confirm" value={String(requests.length)} sub={requests.length ? 'From the website booking form' : 'All caught up'} tone={requests.length ? 'warn' : 'good'} />
        <Kpi label="Booked value, next 7 days (USD)" value={`$${Math.round(weekValue).toLocaleString('en-US')}`} sub="Treatment prices from, AED converted at 3.6725" />
        <Kpi label="No-shows, last 7 days" value={String(noShow)} sub={tt('of {n} appointments', { n: done.length })} tone={noShow > 2 ? 'warn' : undefined} />
      </div>
      <div className="ad-grid">
        <section className="ad-panel ad-grid__wide">
          <header><h2>{tt('Appointments, next 7 days')}</h2><div className="ad-legend">{(['dxb', 'nyc'] as CityId[]).map((c) => <span key={c}><i style={{ background: SERIES[c] }} />{clinics[c].area}</span>)}</div></header>
          <div className="ad-chart" onMouseLeave={() => setHover(null)}>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tt('Appointments per day for the next seven days, by clinic')}>
              {[0, 1, 2, 3, 4].map((i) => <g key={i}><line x1={pl} x2={W} y1={y(step * i)} y2={y(step * i)} className="ad-chart__grid" /><text x={pl - 8} y={y(step * i) + 4} textAnchor="end" className="ad-chart__tick">{step * i}</text></g>)}
              {perDay.map((p, i) => {
                const x0 = pl + i * bw + bw / 2 - 15;
                return (
                  <g key={p.d} onMouseEnter={() => setHover(i)}>
                    <rect x={pl + i * bw} y={pt} width={bw} height={H - pt - pb} fill={hover === i ? '#F3EDF0' : 'transparent'} />
                    {(['dxb', 'nyc'] as CityId[]).map((c, j) => { const v = p[c]; const yy = y(v); return v ? <path key={c} d={`M${x0 + j * 16} ${H - pb} V${yy + 4} q0 -4 4 -4 h6 q4 0 4 4 V${H - pb} Z`} fill={SERIES[c]} /> : null; })}
                    <text x={pl + i * bw + bw / 2} y={H - 9} textAnchor="middle" className="ad-chart__tick">{i === 0 ? tt('Today') : dayLabel(p.d, { weekday: 'short' })}</text>
                  </g>
                );
              })}
            </svg>
            {hover !== null && <div className="ad-tip" style={{ left: `${((pl + hover * bw + bw / 2) / W) * 100}%` }}><b>{dayLabel(perDay[hover].d, { weekday: 'long', day: 'numeric', month: 'short' })}</b><span><i style={{ background: SERIES.dxb }} />{tt('Dubai')}: {perDay[hover].dxb}</span><span><i style={{ background: SERIES.nyc }} />{tt('New York')}: {perDay[hover].nyc}</span></div>}
          </div>
        </section>
        <section className="ad-panel">
          <header><h2>{tt('Most booked')}</h2></header>
          <ol className="ad-bars">
            {top5.map((t) => <li key={t.id}>{t.photo ? <img src={t.photo} alt="" /> : <span className="ad-bars__ph" />}<span className="ad-bars__name">{t.name}</span><span className="ad-bars__track"><span style={{ width: `${(t.n / top5[0].n) * 100}%` }} /></span><b>{t.n}</b></li>)}
          </ol>
        </section>
        <section className="ad-panel ad-grid__wide">
          <header><h2>{tt('Today’s schedule')}</h2><Link to="/admin-appointments" className="ad-link">{tt('Manage →')}</Link></header>
          {todays.length === 0 ? <p className="ad-empty">{tt('No appointments today.')}</p> : (
            <ul className="ad-sched">
              {todays.map((b) => { const t = content.treatments.find((x) => x.id === b.treatmentId); const d = content.doctors.find((x) => x.id === b.doctorId); return (
                <li key={b.id}><b className="ad-sched__time">{timeLabel(b.time)}</b><span className={`ad-city ad-city--${b.city}`}>{b.city === 'dxb' ? tt('Dubai') : tt('NY')}</span><span className="ad-sched__who"><b>{b.name}</b><small>{t ? tr(t.name) : tt('Consultation')} · {d ? tr(d.name) : ''}</small></span><StatusPill s={b.status ?? 'requested'} /></li>
              ); })}
            </ul>
          )}
        </section>
        <section className="ad-panel">
          <header><h2>{tt('Waiting for confirmation')}</h2></header>
          {requests.length === 0 ? <p className="ad-empty">{tt('No new requests.')}</p> : (
            <ul className="ad-sched ad-sched--compact">
              {requests.slice(0, 6).map((b) => <li key={b.id}><span className="ad-sched__who"><b>{b.name}</b><small>{dayLabel(b.date)} · {timeLabel(b.time)} · {clinics[b.city].city}</small></span><span className="ad-money">{(() => { const t = content.treatments.find((x) => x.id === b.treatmentId); return t ? money(t.price[b.city], b.city) : tt('Consult'); })()}</span></li>)}
            </ul>
          )}
          <Link to="/admin-appointments" className="ad-btn ad-btn--ghost ad-btn--sm">{tt('Review requests')}</Link>
        </section>
      </div>
    </>
  );
}
