import { useRef, type CSSProperties } from 'react';
import { categories, clinics, money, treatmentById, treatments } from '../lib/data';
import { useStore } from '../lib/store';
import { go, Link } from '../lib/router';
import { useInView } from '../lib/hooks';
import { Icon } from '../components/Icon';
import { treatmentPhoto } from '../lib/photos';
import { t as tt } from '../lib/i18n';

export default function Treatment({ id }: { id: string }) {
  const { city, setDraft } = useStore();
  const t = treatmentById(id);
  const ref = useRef<HTMLDivElement>(null); const seen = useInView(ref, 0.3);
  if (!t) return <div className="wrap page empty"><h1 className="h2">{tt('Treatment not found')}</h1><Link to="/treatments" className="link-arrow">{tt('See all treatments →')}</Link></div>;
  const related = treatments.filter((x) => x.id !== t.id && (x.category === t.category || x.concerns.some((c) => t.concerns.includes(c)))).slice(0, 3);
  const book = () => { setDraft({ treatmentId: t.id }); go('/book'); };
  return (
    <div className="page">
      <section className="phead phead--t">
        <div className="wrap tdetail__head">
          <div>
            <Link to="/treatments" className="back">{tt('← All treatments')}</Link>
            <p className="eyebrow">{categories.find((c) => c.id === t.category)!.label}</p>
            <h1 className="h1">{t.name}</h1>
            <p className="lede">{t.short}</p>
            <div className="hero__ctas"><button type="button" className="btn btn--plum btn--lg" onClick={book}>{tt('Book a consultation')}</button></div>
          </div>
          <div className="tdetail__icon arch"><img src={treatmentPhoto[t.id]} alt={t.name} width={800} height={1000} /></div>
        </div>
      </section>
      <div className="wrap">
        <dl className="facts">
          <div><dt>{tt('From')}</dt><dd>{money(t.price[city], city)}{t.per ? <small> {t.per}</small> : null}</dd></div>
          <div><dt>{tt('Treatment time')}</dt><dd>{t.duration}</dd></div>
          <div><dt>{tt('Downtime')}</dt><dd>{t.downtime}</dd></div>
          <div><dt>{tt('Sessions')}</dt><dd>{t.sessions}</dd></div>
          <div><dt>{tt('Results last')}</dt><dd>{t.lasts}</dd></div>
        </dl>
        <div className="tdetail__body">
          <div>
            <h2 className="h3">{tt('How it works')}</h2>
            <p className="lede">{t.about}</p>
            <h2 className="h3">{tt('What to expect')}</h2>
            <div ref={ref} className={`journey journey--v ${seen ? 'is-in' : ''}`}>
              <div className="journey__line" aria-hidden="true" />
              {t.journey.map((s, i) => <div key={s.when} className="jstep" style={{ '--i': i } as CSSProperties}><span className="jstep__dot" aria-hidden="true" /><b>{s.when}</b><p>{s.what}</p></div>)}
            </div>
            <h2 className="h3">{tt('Questions')}</h2>
            <div className="faqs">{t.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
          </div>
          <aside className="bookbox">
            <p className="eyebrow">{clinics[city].area}{tt(', ')}{clinics[city].city}</p>
            <p className="bookbox__price">{tt('From')} <b>{money(t.price[city], city)}</b>{t.per ? ` ${t.per}` : ''}</p>
            <p className="muted">{tt('Your first visit is a consultation ({fee}, credited to your treatment). Your doctor confirms the plan and final price.', { fee: money(clinics[city].consultFee, city) })}</p>
            <button type="button" className="btn btn--plum btn--block" onClick={book}>{tt('Book a consultation')}</button>
            <p className="fine">{tt('Prices are samples for this concept. Results vary from person to person.')}</p>
          </aside>
        </div>
        {related.length > 0 && (
          <section className="related">
            <h2 className="h3">{tt('Often paired with')}</h2>
            <div className="tgrid">
              {related.map((r, i) => (
                <Link key={r.id} to={`/treatment/${r.id}`} className="tcard" style={{ '--i': i } as CSSProperties}>
                  <span className="tcard__img"><img src={treatmentPhoto[r.id]} alt="" loading="lazy" width={800} height={1000} /></span>
                  <span className="tcard__top"><Icon k={r.icon} size={30} /></span>
                  <h2>{r.name}</h2><p>{r.short}</p>
                  <dl><div><dt>{tt('From')}</dt><dd>{money(r.price[city], city)}</dd></div></dl>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
