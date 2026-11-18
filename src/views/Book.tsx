import { useEffect, useMemo, useState } from 'react';
import { clinics, doctors, money, treatmentById, treatments } from '../lib/data';
import { useStore, type Booking } from '../lib/store';
import { Link } from '../lib/router';
import { addDays, closedDay, dayLabel, localNow, slotsFor } from '../lib/slots';
import { CitySwitch } from '../components/CitySwitch';
import { logoSrc } from '../components/Logo';
import { t as tt, timeLabel } from '../lib/i18n';

const stepNames = ['Clinic', 'Doctor', 'Date & time', 'Your details'];

export default function Book() {
  const { city, draft, setDraft, addBooking, bookings } = useStore();
  const c = clinics[city];
  const [step, setStep] = useState(0);
  const [treatmentId, setTreatmentId] = useState<string>(draft.treatmentId ?? '');
  const [doctorId, setDoctorId] = useState('any');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: draft.plan?.length ? `${tt('Skin quiz plan:')} ${draft.plan.map((id) => treatmentById(id)?.name).join(tt(', '))}` : '', consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Booking | null>(null);

  const cityDocs = doctors.filter((d) => d.city === city);
  const days = useMemo(() => { const today = localNow(city).date; return Array.from({ length: 10 }, (_, i) => addDays(today, i)).filter((d) => !closedDay(city, d)).slice(0, 7); }, [city]);
  useEffect(() => { setDoctorId('any'); setDate(''); setTime(''); }, [city]);
  useEffect(() => { if (!date && days.length) setDate(days[0]); }, [days, date]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step, done]);

  const docIds = doctorId === 'any' ? cityDocs.map((d) => d.id) : [doctorId];
  const slots = useMemo(() => {
    if (!date) return [];
    const map = new Map<number, { min: number; label: string; doc: string }>();
    docIds.forEach((id) => slotsFor(city, id, date).forEach((s) => { const taken = bookings.some((b) => b.doctorId === id && b.date === date && b.time === s.label && b.status !== 'cancelled'); if (s.open && !taken && !map.has(s.min)) map.set(s.min, { min: s.min, label: s.label, doc: id }); }));
    return [...map.values()].sort((a, b) => a.min - b.min);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, date, doctorId, bookings]);
  const chosenSlot = slots.find((s) => s.label === time);
  const chosenDoc = doctors.find((d) => d.id === (doctorId === 'any' ? chosenSlot?.doc : doctorId));
  const t = treatmentId ? treatmentById(treatmentId) : null;

  const next = () => {
    if (step === 2 && !time) { setErrors({ time: tt('Choose a time to continue.') }); return; }
    setErrors({}); setStep((s) => s + 1);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = tt('Please enter your full name.');
    if (form.phone.replace(/\D/g, '').length < 7) er.phone = tt('Please enter a phone number we can reach you on.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = tt('Please enter an email like name@example.com.');
    if (!form.consent) er.consent = tt('Please agree so we can contact you about this appointment.');
    setErrors(er);
    if (Object.keys(er).length) return;
    const b = addBooking({ city, treatmentId: treatmentId || null, doctorId: chosenDoc?.id ?? cityDocs[0].id, date, time, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), notes: form.notes.trim() });
    setDraft({}); setDone(b);
  };

  if (done) {
    const d = doctors.find((x) => x.id === done.doctorId)!;
    return (
      <div className="page wrap booked">
        <img src={logoSrc.icon} alt="" width={90} height={161} className="booked__icon" />
        <p className="eyebrow">{tt('Request received')} · <bdi>{done.ref}</bdi></p>
        <h1 className="h1">{tt('See you soon,')} <em>{done.name.split(' ')[0]}</em></h1>
        <p className="lede">{tt('{day} at {time}, with {doctor}, at {area}, {city}.', { day: dayLabel(done.date, { weekday: 'long', day: 'numeric', month: 'long' }), time: timeLabel(done.time), doctor: d.name, area: c.area, city: c.city })}</p>
        <ol className="nextsteps">
          <li><b>{tt('Confirmation')}</b><span>{tt('Our team confirms by phone or WhatsApp within two working hours.')}</span></li>
          <li><b>{tt('Before you come')}</b><span>{tt('Arrive 10 minutes early, without makeup if possible. Bring a list of any medicines you take.')}</span></li>
          <li><b>{tt('Your consultation')}</b><span>{tt('30 minutes with your doctor. {fee}, credited to any treatment you book.', { fee: money(c.consultFee, city) })}</span></li>
        </ol>
        <p className="fine">{tt('This is a concept website. No appointment has been made.')}</p>
        <Link to="/" className="btn btn--line">{tt('Back to home')}</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="phead phead--sm">
        <div className="wrap">
          <p className="eyebrow">{tt('Book a consultation')}</p>
          <h1 className="h1">{tt('Your visit,')} <em>{tt('in four steps')}</em></h1>
        </div>
      </section>
      <div className="wrap bookgrid">
        <div>
          <ol className="stepper" aria-label={tt('Booking steps')}>
            {stepNames.map((s, i) => (
              <li key={s} className={i === step ? 'is-on' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
                <button type="button" disabled={i > step} onClick={() => setStep(i)}><span>{i < step ? '✓' : i + 1}</span>{tt(s)}</button>
              </li>
            ))}
          </ol>

          <div className="stepbody" key={step}>
            {step === 0 && (
              <div className="stack">
                <h2 className="h3">{tt('Which clinic?')}</h2>
                <CitySwitch />
                <p className="muted">{c.address} · {c.hoursLabel}</p>
                <label className="field"><span>{tt('What would you like to discuss?')}</span>
                  <select id="bk-t" value={treatmentId} onChange={(e) => setTreatmentId(e.target.value)}>
                    <option value="">{tt('General consultation, I’m not sure yet')}</option>
                    {treatments.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </label>
                {draft.plan?.length ? <p className="note">{tt('From your skin quiz: {plan}. Your doctor will go through it with you.', { plan: draft.plan.map((id) => treatmentById(id)?.name).join(tt(', ')) })}</p> : null}
              </div>
            )}
            {step === 1 && (
              <div className="stack">
                <h2 className="h3">{tt('Choose your doctor')}</h2>
                <div className="docpick" role="radiogroup" aria-label={tt('Doctor')}>
                  <label className={`dpick ${doctorId === 'any' ? 'is-on' : ''}`}><input type="radio" name="doc" checked={doctorId === 'any'} onChange={() => setDoctorId('any')} /><b>{tt('First available')}</b><span>{tt('The earliest slot with any of our doctors')}</span></label>
                  {cityDocs.map((d) => (
                    <label key={d.id} className={`dpick ${doctorId === d.id ? 'is-on' : ''}`}><input type="radio" name="doc" checked={doctorId === d.id} onChange={() => { setDoctorId(d.id); setTime(''); }} /><b>{d.name}</b><span>{d.role} · {d.focus.join(tt(', '))}</span></label>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="stack">
                <h2 className="h3">{tt('Pick a date and time')}</h2>
                <p className="muted">{tt('Times are in {city} local time.', { city: c.city })}</p>
                <div className="days" role="radiogroup" aria-label={tt('Date')}>
                  {days.map((d, i) => (
                    <button key={d} type="button" role="radio" aria-checked={date === d} className={`day ${date === d ? 'is-on' : ''}`} onClick={() => { setDate(d); setTime(''); }}>
                      <small>{i === 0 ? tt('Today') : dayLabel(d, { weekday: 'short' })}</small><b>{dayLabel(d, { day: 'numeric' })}</b><small>{dayLabel(d, { month: 'short' })}</small>
                    </button>
                  ))}
                </div>
                {slots.length === 0 ? <p className="note">{tt('No free times on this day. Please try the next day.')}</p> : (
                  <div className="slots" role="radiogroup" aria-label={tt('Time')}>
                    {slots.map((s) => <button key={s.min} type="button" role="radio" aria-checked={time === s.label} className={`slot ${time === s.label ? 'is-on' : ''}`} onClick={() => { setTime(s.label); setErrors({}); }}>{timeLabel(s.label)}</button>)}
                  </div>
                )}
                {errors.time && <p className="err" role="alert">{errors.time}</p>}
              </div>
            )}
            {step === 3 && (
              <form className="stack" onSubmit={submit} noValidate id="bk-form">
                <h2 className="h3">{tt('Your details')}</h2>
                <div className="fields">
                  <label className="field"><span>{tt('Full name')}</span><input id="bk-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" aria-invalid={!!errors.name} />{errors.name && <em className="err">{errors.name}</em>}</label>
                  <label className="field"><span>{tt('Mobile')}</span><input id="bk-phone" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder={city === 'dxb' ? '+971 50 000 0000' : '+1 212 000 0000'} aria-invalid={!!errors.phone} />{errors.phone && <em className="err">{errors.phone}</em>}</label>
                  <label className="field field--wide"><span>{tt('Email')}</span><input id="bk-email" dir="ltr" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" aria-invalid={!!errors.email} />{errors.email && <em className="err">{errors.email}</em>}</label>
                  <label className="field field--wide"><span>{tt('Anything we should know? (optional)')}</span><textarea id="bk-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={tt('Previous treatments, allergies, an event date…')} /></label>
                </div>
                <label className="check"><input id="bk-consent" type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} /> {tt('I agree to be contacted about this appointment. My details are kept private and never shared.')}</label>
                {errors.consent && <em className="err">{errors.consent}</em>}
              </form>
            )}
          </div>

          <div className="stepnav">
            {step > 0 && <button type="button" className="btn btn--line" onClick={() => setStep((s) => s - 1)}>{tt('Back')}</button>}
            {step < 3 ? <button type="button" className="btn btn--plum" onClick={next}>{tt('Continue')}</button> : <button type="submit" form="bk-form" className="btn btn--plum">{tt('Request appointment')}</button>}
          </div>
        </div>

        <aside className="summary">
          <p className="eyebrow">{tt('Your appointment')}</p>
          <dl>
            <div><dt>{tt('Clinic')}</dt><dd>{c.area}{tt(', ')}{c.city}</dd></div>
            <div><dt>{tt('For')}</dt><dd>{t ? t.name : tt('General consultation')}</dd></div>
            <div><dt>{tt('Doctor')}</dt><dd>{chosenDoc ? chosenDoc.name : doctorId === 'any' ? tt('First available') : '—'}</dd></div>
            <div><dt>{tt('When')}</dt><dd>{date && time ? `${dayLabel(date)} · ${timeLabel(time)}` : tt('Not chosen yet')}</dd></div>
            <div><dt>{tt('Consultation')}</dt><dd>{money(c.consultFee, city)} <small>{tt('credited to treatment')}</small></dd></div>
            {t && <div><dt>{tt('Treatment from')}</dt><dd>{money(t.price[city], city)}{t.per ? <small> {t.per}</small> : null}</dd></div>}
          </dl>
          <p className="fine">{tt('Nothing is paid online. Free cancellation up to 24 hours before.')}</p>
        </aside>
      </div>
    </div>
  );
}
