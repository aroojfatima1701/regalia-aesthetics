import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as RME } from 'react';
import { clinics, doctors, memberships, money, treatmentById, treatments, type CityId } from '../lib/data';
import { useStore } from '../lib/store';
import { go, Link, SECTIONS } from '../lib/router';
import { useClock, useInView } from '../lib/hooks';
import { logoSrc } from '../components/Logo';
import { Icon } from '../components/Icon';
import { FaceMap } from '../components/FaceMap';
import { doctorPhoto, heroSlides, treatmentPhoto } from '../lib/photos';
import room from '../assets/photos/space-room.webp';
import serum from '../assets/photos/space-serum.webp';
import { siteText } from '../lib/content';
import velvet from '../assets/photos/velvet.jpg';
import { dayLabel, nextFree } from '../lib/slots';
import { t as tt, timeLabel, tr } from '../lib/i18n';

function Words({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  return <span className={className} aria-label={text}>{text.split(' ').map((w, i) => <span key={i} className="word" aria-hidden="true" style={{ '--i': start + i } as CSSProperties}>{w}&nbsp;</span>)}</span>;
}

function NextSlot() {
  const { city } = useStore();
  const [n, setN] = useState<ReturnType<typeof nextFree>>(null);
  useEffect(() => { setN(nextFree(city)); const id = setInterval(() => setN(nextFree(city)), 60000); return () => clearInterval(id); }, [city]);
  if (!n) return null;
  const when = n.today ? tt('today') : n.tomorrow ? tt('tomorrow') : dayLabel(n.date, { weekday: 'long' });
  return (
    <button type="button" className="nextslot" onClick={() => go('/book')}>
      <span className="nextslot__dot" />
      {tt('Next free consultation in {city}:', { city: clinics[city].city })} <b>{when}{tt(', ')}{timeLabel(n.label)}</b>
    </button>
  );
}

/** Facts for whatever the current slide links to, shown in the floating card. */
function slideFacts(to: string, city: CityId) {
  const t = to.startsWith('/treatment/') ? treatmentById(to.slice(11)) : null;
  if (t) return { price: money(t.price[city], city), per: t.per ?? '', a: t.duration, b: t.downtime === tr('None') ? tt('No downtime') : t.downtime };
  return { price: money(clinics[city].consultFee, city), per: tt('consultation'), a: tt('30 minutes'), b: tt('Credited to your treatment') };
}

function Hero() {
  const { city } = useStore();
  const ref = useRef<HTMLElement>(null);
  const [cur, setCur] = useState(0);
  const n = heroSlides.length;
  const curSafe = n ? cur % n : 0;
  const nxt = n ? (curSafe + 1) % n : 0;
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused || n < 2) return; const id = setTimeout(() => setCur((c) => (c + 1) % n), 4000); return () => clearTimeout(id); }, [cur, paused, n]);
  const onMove = (e: RME) => {
    const el = ref.current; if (!el) return; const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`); el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    el.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - 0.5) * 14}px`); el.style.setProperty('--ty', `${((e.clientY - r.top) / r.height - 0.5) * 10}px`);
  };
  const sl = heroSlides[curSafe];
  const f = slideFacts(sl.to, city);
  const pad = (v: number) => String(v).padStart(2, '0');
  return (
    <section ref={ref} className="hero" onMouseMove={onMove}>
      <div className="hero__glow" aria-hidden="true" />
      <p className="hero__vert" aria-hidden="true"><span>{tt('Dubai')}</span><i /><span>{tt('New York')}</span></p>
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">{siteText.eyebrow}</p>
          <h1 className="hero__title">
            <Words text={siteText.title1} /><br />
            <em><Words text={siteText.title2} start={siteText.title1.split(' ').length} /></em>
          </h1>
          <p className="hero__sub">{siteText.sub}</p>
          <div className="hero__ctas">
            <Link to="/book" className="btn btn--plum btn--lg">{tt('Book a consultation')}</Link>
            <Link to="/quiz" className="btn btn--line btn--lg">{tt('Take the 60-second skin quiz')}</Link>
          </div>
          <NextSlot />
        </div>
        <div className="hero__art" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="hero__ghost" aria-hidden="true" />
          <p className="hero__count" aria-hidden="true"><b key={curSafe}>{pad(curSafe + 1)}</b><span>/ {pad(n)}</span></p>
          <div className="arch arch--hero">
            {heroSlides.map((s, i) => (
              <img key={`${s.src.slice(-24)}${i}`} className={`slide ${i === curSafe ? 'is-on' : ''}`} src={s.src} alt={i === curSafe ? s.alt : ''} aria-hidden={i !== curSafe} width={1100} height={1375} loading={i < 2 ? 'eager' : 'lazy'} />
            ))}
            <div className="slide__shade" aria-hidden="true" />
            <Link to={sl.to} className="slide__cap" key={curSafe}><span>{tt('Treatment')}</span><b>{sl.label}</b><i aria-hidden="true">→</i></Link>
            <div className="slide__bars" role="group" aria-label={tt('Choose a photo')}>
              {heroSlides.map((s, i) => (
                <button key={i} type="button" className={`bar ${i === curSafe ? 'is-on' : ''} ${i < curSafe ? 'is-done' : ''}`} onClick={() => setCur(i)} aria-label={tt('Show {name}', { name: s.label })} aria-current={i === curSafe}>
                  <span key={`${curSafe}-${i}`} style={{ animationPlayState: paused ? 'paused' : 'running' }} />
                </button>
              ))}
            </div>
          </div>
          <aside className="hero__info" key={`${curSafe}${city}`} aria-live="polite">
            <small>{tt('From')}</small>
            <p className="hero__price"><b>{f.price}</b>{f.per && <span> {f.per}</span>}</p>
            <ul><li>{f.a}</li><li>{f.b}</li></ul>
            {n > 1 && (
              <button type="button" className="hero__next" onClick={() => setCur(nxt)}>
                <img src={heroSlides[nxt].src} alt="" width={44} height={44} />
                <span><small>{tt('Next')}</small>{heroSlides[nxt].label}</span>
              </button>
            )}
          </aside>
          <div className="hero__badge" aria-hidden="true">
            <svg viewBox="0 0 200 200"><defs><path id="hb" d="M100 100 m -78 0 a 78 78 0 1 1 156 0 a 78 78 0 1 1 -156 0" /></defs><text><textPath href="#hb" textLength="486" lengthAdjust="spacing">beauty · care · confidence · beauty · care · confidence ·</textPath></text></svg>
            <img src={logoSrc.iconLight} alt="" width={40} height={72} />
          </div>
        </div>
      </div>
      <div className="hero__strip">
        <div className="wrap hero__facts">
          <span><b>{tt('Consultation first')}</b>{tt('Every plan starts with a doctor')}</span>
          <span><b>{tt('Natural results')}</b>{tt('Refreshed, never overdone')}</span>
          <span><b>{tt('Clear pricing')}</b>{tt('Prices shown before you book')}</span>
          <span><b>{tt('Two cities')}</b>{tt('Jumeirah and the Upper East Side')}</span>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const names = treatments.map((t) => t.name);
  const set = (k: number) => <span className="mq__set" aria-hidden={k === 1}>{names.map((n) => <span key={n}>{n}<i>✦</i></span>)}</span>;
  return <div className="mq" aria-label={tt('Treatments')}><div className="mq__track">{set(0)}{set(1)}</div></div>;
}

function Signature() {
  const { city } = useStore();
  const list = treatments.filter((t) => t.signature);
  const ref = useRef<HTMLDivElement>(null); const seen = useInView(ref, 0.15);
  return (
    <section className="sec" id="signature">
      <div className="wrap">
        <div className="sec__head sec__head--row">
          <div><p className="eyebrow">{tt('Signature treatments')}</p><h2 className="h2">{tt('The treatments our patients')} <em>{tt('love most')}</em></h2></div>
          <Link to="/treatments" className="link-arrow">{tt('All treatments →')}</Link>
        </div>
        <div ref={ref} className={`sgrid ${seen ? 'is-in' : ''}`} style={{ '--n': Math.min(list.length, 6) } as CSSProperties}>
          {list.map((t, i) => (
            <Link key={t.id} to={`/treatment/${t.id}`} className="scard" style={{ '--i': i } as CSSProperties}>
              <span className="scard__img"><img src={treatmentPhoto[t.id]} alt="" loading="lazy" width={800} height={1000} /><span className="scard__icon"><Icon k={t.icon} size={26} /></span></span>
              <h3>{t.name}</h3>
              <p>{t.short}</p>
              <span className="scard__foot"><span>{tt('From')} <b>{money(t.price[city], city)}</b></span><span className="scard__arrow" aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuizBand() {
  return (
    <section className="band-plum">
      <div className="wrap qband">
        <div>
          <p className="eyebrow eyebrow--light">{tt('Not sure where to start?')}</p>
          <h2 className="h2 h2--light">{tt('Five questions.')} <em>{tt('Your personal plan.')}</em></h2>
          <p className="lede lede--light">{tt('Tell us what bothers you, how much downtime you can take and when your big day is. We suggest a plan with sessions, timing and a price estimate.')}</p>
          <Link to="/quiz" className="btn btn--ivory btn--lg">{tt('Start the skin quiz')}</Link>
        </div>
        <div className="qband__demo" aria-hidden="true">
          <div className="qcard qcard--1"><span>{tt('Question {i} of {n}', { i: 2, n: 5 })}</span><b>{tt('How much downtime is okay?')}</b><i>{tt('None')}</i><i className="on">{tt('1 to 3 days')}</i><i>{tt('A week')}</i></div>
          <div className="qcard qcard--2"><span>{tt('Your plan')}</span><b>{tt('Glow & smooth')}</b><em>{tt('Skin boosters')} × 2</em><em>{tt('Hydrating facial')} × 3</em><strong>{tt('8 weeks · from {p}', { p: money(5850, 'dxb') })}</strong></div>
        </div>
      </div>
    </section>
  );
}

function Journey() {
  const ids = ['anti-wrinkle', 'fillers', 'pico-laser', 'hifu'];
  const [sel, setSel] = useState(ids[0]);
  const t = treatmentById(sel)!;
  const ref = useRef<HTMLDivElement>(null); const seen = useInView(ref, 0.3);
  return (
    <section className="sec sec--sand">
      <div className="wrap">
        <div className="sec__head"><p className="eyebrow">{tt('What to expect')}</p><h2 className="h2">{tt('Your treatment,')} <em>{tt('day by day')}</em></h2><p className="lede">{tt('No surprises. See exactly when swelling settles and when results show, before you book.')}</p></div>
        <div className="seg" role="tablist" aria-label={tt('Treatment')}>
          {ids.map((id) => <button key={id} type="button" role="tab" aria-selected={sel === id} onClick={() => setSel(id)}>{treatmentById(id)!.name}</button>)}
        </div>
        <div ref={ref} className={`journey ${seen ? 'is-in' : ''}`} key={sel}>
          <div className="journey__line" aria-hidden="true" />
          {t.journey.map((s, i) => (
            <div key={s.when} className="jstep" style={{ '--i': i } as CSSProperties}>
              <span className="jstep__dot" aria-hidden="true" />
              <b>{s.when}</b>
              <p>{s.what}</p>
            </div>
          ))}
        </div>
        <p className="center"><Link to={`/treatment/${sel}`} className="link-arrow">{tt('More about {name} →', { name: t.name.toLowerCase() })}</Link></p>
      </div>
    </section>
  );
}

function Space() {
  return (
    <section className="sec">
      <div className="wrap space">
        <div className="space__imgs">
          <div className="arch arch--photo"><img src={room} alt={tt('A calm, warmly lit treatment suite with two treatment beds')} loading="lazy" /></div>
          <div className="arch arch--photo arch--small"><img src={serum} alt={tt('Cream-coloured skincare bottles on marble')} loading="lazy" /></div>
        </div>
        <div className="space__copy">
          <p className="eyebrow">{tt('The Regalia way')}</p>
          <h2 className="h2">{tt('Quiet luxury,')} <em>{tt('medical care')}</em></h2>
          <p className="lede">{tt('Private suites, unhurried appointments and doctors who would rather do less, well.')}</p>
          <ul className="promises">
            <li><b>{tt('Doctors only')}</b><span>{tt('Every injection and laser is performed by a licensed doctor.')}</span></li>
            <li><b>{tt('Consultation first')}</b><span>{tt('A 30-minute assessment before any treatment, credited if you go ahead.')}</span></li>
            <li><b>{tt('Natural results')}</b><span>{tt('We start conservatively and review at two weeks, free of charge.')}</span></li>
            <li><b>{tt('Honest pricing')}</b><span>{tt('Prices are on the website, in AED and USD. No hidden extras.')}</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Doctors() {
  const { city, setCity } = useStore();
  return (
    <section className="sec sec--ivory2" id="doctors">
      <div className="wrap">
        <div className="sec__head sec__head--row">
          <div><p className="eyebrow">{tt('Our doctors')}</p><h2 className="h2">{tt('Expert hands,')} <em>{tt('gentle approach')}</em></h2></div>
          <div className="seg seg--sm" role="radiogroup" aria-label={tt('Clinic')}>
            {(['dxb', 'nyc'] as CityId[]).map((c) => <button key={c} type="button" role="radio" aria-checked={city === c} onClick={() => setCity(c)}>{clinics[c].city}</button>)}
          </div>
        </div>
        <div className="docs" key={city}>
          {doctors.filter((d) => d.city === city).map((d, i) => (
            <article key={d.id} className="doc" style={{ '--i': i } as CSSProperties}>
              <div className="doc__photo"><img src={doctorPhoto[d.id]} alt={`${d.name}, ${d.role.toLowerCase()}`} loading="lazy" width={600} height={750} /><img className="doc__crown" src={logoSrc.iconLight} alt="" aria-hidden="true" /><span className="doc__years"><b>{d.years}</b> {tt('years')}</span></div>
              <div className="doc__body">
                <p className="doc__role">{d.role} · {clinics[d.city].city}</p>
                <h3>{d.name}</h3>
                <p className="doc__quote">“{d.quote}”</p>
                <p>{d.bio}</p>
                <ul className="doc__chips">{d.focus.map((f) => <li key={f}>{f}</li>)}<li className="is-soft">{tt(d.city === 'dxb' ? 'DHA licensed' : 'Board certified')}</li></ul>
                <p className="doc__lang">{tt('Speaks {l}', { l: d.languages })}</p>
                <button type="button" className="btn btn--line btn--sm" onClick={() => go('/book')}>{tt('Book with {name}', { name: d.name.split(' ').slice(0, 2).join(' ') })}</button>
              </div>
            </article>
          ))}
        </div>
        <p className="fine center">{clinics[city].license}{tt('. Doctor profiles are samples for this concept.')}</p>
      </div>
    </section>
  );
}

function Membership() {
  const { city } = useStore();
  const [facials, setFacials] = useState(8);
  const [tox, setTox] = useState(3);
  const facialPrice = treatmentById('hydrafacial')!.price[city]; const toxPrice = treatmentById('anti-wrinkle')!.price[city];
  const without = facials * facialPrice + tox * toxPrice;
  const sig = memberships[1]; const withPlan = sig.price[city] * 12 + Math.max(0, facials - 12) * facialPrice + tox * toxPrice * 0.85;
  const save = Math.max(0, Math.round(without - withPlan));
  return (
    <section className="sec" id="membership">
      <div className="wrap">
        <div className="sec__head"><p className="eyebrow">{tt('Membership')}</p><h2 className="h2">{tt('Your skin,')} <em>{tt('every month')}</em></h2><p className="lede">{tt('Results last longer with regular care. Members get monthly treatments, lower prices and first pick of appointments.')}</p></div>
        <div className="tiers">
          {memberships.map((m) => (
            <article key={m.id} className={`tier ${m.featured ? 'tier--featured' : ''}`}>
              {m.featured && <span className="tier__flag">{tt('Most chosen')}</span>}
              <h3>{m.name}</h3>
              <p className="tier__price"><b>{money(m.price[city], city)}</b> {tt('/ month')}</p>
              <ul>{m.perks.map((p) => <li key={p}>{p}</li>)}</ul>
              <Link to="/book" className={`btn ${m.featured ? 'btn--ivory' : 'btn--line'}`}>{tt('Join at your consultation')}</Link>
            </article>
          ))}
        </div>
        <div className="calc">
          <div className="calc__in">
            <h3>{tt('How much could you save with {plan}?', { plan: sig.name })}</h3>
            <label className="range"><span>{tt('Facials a year')} <output>{facials}</output></span><input id="calc-f" type="range" min={0} max={12} value={facials} onChange={(e) => setFacials(Number(e.target.value))} /></label>
            <label className="range"><span>{tt('Anti-wrinkle sessions a year')} <output>{tox}</output></span><input id="calc-t" type="range" min={0} max={4} value={tox} onChange={(e) => setTox(Number(e.target.value))} /></label>
          </div>
          <div className="calc__out" aria-live="polite">
            <span>{tt('Without membership')} <s>{money(Math.round(without), city)}</s></span>
            <span>{tt('With {plan}', { plan: sig.name })} <b>{money(Math.round(withPlan), city)}</b></span>
            <strong className={save > 0 ? '' : 'is-zero'}>{save > 0 ? tt('You save {p} a year', { p: money(save, city) }) : tt('Pay as you go suits you better')}</strong>
          </div>
        </div>
        <p className="fine center">{tt('Estimate based on sample prices. Signature includes two skin booster sessions a year, not counted above.')}</p>
      </div>
    </section>
  );
}

function ClinicCard({ id }: { id: CityId }) {
  const c = clinics[id]; const { city, setCity } = useStore();
  const { label, hour } = useClock(c.timeZone);
  const open = hour >= c.opens && hour < c.closes;
  return (
    <article className={`clinic ${city === id ? 'is-on' : ''}`}>
      <p className="eyebrow">{c.city}</p>
      <h3>{c.area}</h3>
      <p className="clinic__time">{tt('{time} local time', { time: label })} <span className={`openpill ${open ? 'is-open' : ''}`}>{tt(open ? 'Open now' : 'Closed now')}</span></p>
      <p className="muted">{c.address}<br />{c.hoursLabel}<br /><span className="sel">{c.phone}</span></p>
      <p className="muted">{tt('Consultation {fee}, credited to your treatment', { fee: money(c.consultFee, id) })}</p>
      <div className="clinic__ctas">
        <button type="button" className={`btn ${city === id ? 'btn--plum' : 'btn--line'}`} onClick={() => { setCity(id); go('/book'); }}>{tt('Book in {city}', { city: c.city })}</button>
      </div>
    </article>
  );
}

function Clinics() {
  return (
    <section className="sec sec--sand" id="clinics">
      <div className="wrap">
        <div className="sec__head"><p className="eyebrow">{tt('Two clinics')}</p><h2 className="h2">{tt('Jumeirah')} <em>{tt('&')}</em> {tt('the Upper East Side')}</h2><p className="lede">{tt('The same doctors’ standards and the same Regalia care, in two cities.')}</p></div>
        <div className="clinics">
          <ClinicCard id="dxb" />
          <div className="clinics__img arch arch--photo"><img src={velvet} alt={tt('Plum velvet embroidered with the crowned logo')} loading="lazy" /></div>
          <ClinicCard id="nyc" />
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="closing">
      <div className="wrap closing__in">
        <img src={logoSrc.full} alt="Regalia Aesthetics" width={240} height={236} />
        <h2 className="h2">{(() => { const w = siteText.closing.split(' '); const last = w.pop(); return <>{w.join(' ')} <em>{last}</em></>; })()}</h2>
        <Link to="/book" className="btn btn--plum btn--lg">{tt('Book a consultation')}</Link>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    const jump = () => { const s = window.location.hash.slice(1); if (SECTIONS.includes(s)) setTimeout(() => document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' }), 60); };
    jump(); window.addEventListener('hashchange', jump); return () => window.removeEventListener('hashchange', jump);
  }, []);
  return (
    <>
      <Hero />
      <Marquee />
      <section className="sec" id="concerns">
        <div className="wrap">
          <div className="sec__head"><p className="eyebrow">{tt('Start with your concern')}</p><h2 className="h2">{tt('Tap where it')} <em>{tt('bothers you')}</em></h2><p className="lede">{tt('Most people know the problem, not the treatment name. Choose an area to see what can help, with prices and downtime.')}</p></div>
          <FaceMap />
        </div>
      </section>
      <Signature />
      <QuizBand />
      <Journey />
      <Space />
      <Doctors />
      <Membership />
      <Clinics />
      <Closing />
    </>
  );
}
