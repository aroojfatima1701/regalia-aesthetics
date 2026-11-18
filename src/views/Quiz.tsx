import { useState } from 'react';
import { money, treatmentById, type CityId } from '../lib/data';
import { useStore } from '../lib/store';
import { go, Link } from '../lib/router';
import { treatmentPhoto } from '../lib/photos';
import { t as tt } from '../lib/i18n';

type Answers = { goal?: string; age?: string; downtime?: string; when?: string; city?: CityId };

const questions: { key: keyof Answers; q: string; options: { v: string; label: string; hint?: string }[] }[] = [
  { key: 'goal', q: 'What would you most like to change?', options: [
    { v: 'lines', label: 'Smooth lines and wrinkles' }, { v: 'glow', label: 'Glow and texture', hint: 'Dull skin, large pores' }, { v: 'volume', label: 'Volume and contour', hint: 'Cheeks, lips, jaw' },
    { v: 'tone', label: 'Even skin tone', hint: 'Spots, melasma' }, { v: 'clear', label: 'Clear skin and scars', hint: 'Acne, marks' }, { v: 'lift', label: 'Lift and firm', hint: 'Jawline, neck, brows' }] },
  { key: 'age', q: 'Which age range are you in?', options: [{ v: 'u30', label: 'Under 30' }, { v: '30', label: '30 to 45' }, { v: '45', label: 'Over 45' }] },
  { key: 'downtime', q: 'How much downtime is okay?', options: [{ v: 'none', label: 'None at all', hint: 'Back to work the same day' }, { v: 'few', label: 'A few days', hint: 'Some redness or swelling' }, { v: 'week', label: 'A week is fine', hint: 'For the biggest results' }] },
  { key: 'when', q: 'Is there a date you are preparing for?', options: [{ v: 'soon', label: 'Yes, within 2 weeks' }, { v: 'months', label: 'Yes, in 1 to 3 months' }, { v: 'none', label: 'No, no rush' }] },
  { key: 'city', q: 'Which clinic is closer to you?', options: [{ v: 'dxb', label: 'Dubai, Jumeirah' }, { v: 'nyc', label: 'New York, Upper East Side' }] },
];

const byGoal: Record<string, string[]> = {
  lines: ['anti-wrinkle', 'skin-boosters', 'co2'], glow: ['hydrafacial', 'skin-boosters', 'signature-facial'], volume: ['fillers', 'skin-boosters', 'threads'],
  tone: ['pico-laser', 'peel', 'signature-facial'], clear: ['microneedling', 'peel', 'hydrafacial', 'co2'], lift: ['hifu', 'threads', 'fillers'],
};
const sessions: Record<string, number> = { 'anti-wrinkle': 1, fillers: 1, 'skin-boosters': 2, microneedling: 3, peel: 3, hydrafacial: 3, 'signature-facial': 3, 'pico-laser': 4, co2: 1, hifu: 1, threads: 1 };
const weeks: Record<string, number> = { 'anti-wrinkle': 2, fillers: 2, 'skin-boosters': 8, microneedling: 12, peel: 6, hydrafacial: 12, 'signature-facial': 12, 'pico-laser': 16, co2: 12, hifu: 12, threads: 8 };

function buildPlan(a: Answers) {
  const maxDown = a.downtime === 'none' ? 1 : a.downtime === 'few' ? 4 : 99;
  let ids = byGoal[a.goal ?? 'glow'].filter((id) => treatmentById(id)!.downtimeDays <= maxDown && !(a.when === 'soon' && treatmentById(id)!.downtimeDays > 2));
  if (a.age === '45' && (a.goal === 'lines' || a.goal === 'volume') && !ids.includes('hifu')) ids.push('hifu');
  if (a.age === 'u30' && a.goal === 'lines') ids = ids.filter((id) => id !== 'co2');
  if (!ids.length) ids = ['hydrafacial'];
  return ids.slice(0, 3);
}

export default function Quiz() {
  const { setCity, setDraft } = useStore();
  const [i, setI] = useState(0);
  const [a, setA] = useState<Answers>({});
  const done = i >= questions.length;
  const city = a.city ?? 'dxb';

  const choose = (key: keyof Answers, v: string) => {
    const nextA = { ...a, [key]: v } as Answers; setA(nextA);
    if (key === 'city') setCity(v as CityId);
    setTimeout(() => setI((n) => n + 1), 220);
  };

  if (done) {
    const plan = buildPlan(a);
    const total = plan.reduce((s, id) => s + treatmentById(id)!.price[city] * sessions[id], 0);
    const span = Math.max(...plan.map((id) => weeks[id]));
    return (
      <div className="page wrap quiz">
        <p className="eyebrow">{tt('Your suggested plan')}</p>
        <h1 className="h1">{tt('A plan made')} <em>{tt('for you')}</em></h1>
        <p className="lede">{tt('Based on your answers. Your doctor will check your skin and adjust it at your consultation.')}</p>
        <div className="plan">
          {plan.map((id, k) => {
            const t = treatmentById(id)!;
            return (
              <article key={id} className="plan__item" style={{ animationDelay: `${k * 120}ms` }}>
                <img className="plan__img" src={treatmentPhoto[id]} alt="" width={96} height={120} />
                <div>
                  <Link to={`/treatment/${id}`} className="plan__name">{t.name}</Link>
                  <p>{t.short}</p>
                  <span className="plan__meta">{tt(sessions[id] > 1 ? '{n} sessions' : '{n} session', { n: sessions[id] })} · {tt('from')} {money(t.price[city] * sessions[id], city)} · {tt('downtime:')} {t.downtime.toLowerCase()}</span>
                </div>
              </article>
            );
          })}
        </div>
        <div className="plan__sum">
          <div><span>{tt('Estimated total')}</span><b>{tt('from')} {money(total, city)}</b></div>
          <div><span>{tt('Time to full results')}</span><b>{tt('about {n} weeks', { n: span })}</b></div>
          {a.when === 'soon' && <div><span>{tt('For your date')}</span><b>{tt('No-downtime options first')}</b></div>}
        </div>
        <div className="hero__ctas">
          <button type="button" className="btn btn--plum btn--lg" onClick={() => { setDraft({ treatmentId: plan[0], plan }); go('/book'); }}>{tt('Book a consultation with this plan')}</button>
          <button type="button" className="btn btn--line btn--lg" onClick={() => { setA({}); setI(0); }}>{tt('Start again')}</button>
        </div>
        <p className="fine">{tt('An estimate, not medical advice. Prices are samples for this concept.')}</p>
      </div>
    );
  }

  const q = questions[i];
  return (
    <div className="page wrap quiz">
      <div className="quiz__bar" aria-hidden="true"><span style={{ width: `${(i / questions.length) * 100}%` }} /></div>
      <p className="eyebrow">{tt('Question {i} of {n}', { i: i + 1, n: questions.length })}</p>
      <fieldset className="quiz__q" key={q.key}>
        <legend className="h1">{tt(q.q)}</legend>
        <div className="quiz__opts">
          {q.options.map((o) => (
            <button key={o.v} type="button" className={`qopt ${a[q.key] === o.v ? 'is-on' : ''}`} aria-pressed={a[q.key] === o.v} onClick={() => choose(q.key, o.v)}>
              <b>{tt(o.label)}</b>{o.hint && <span>{tt(o.hint)}</span>}
            </button>
          ))}
        </div>
      </fieldset>
      {i > 0 && <button type="button" className="back" onClick={() => setI((n) => n - 1)}>{tt('← Previous question')}</button>}
    </div>
  );
}
