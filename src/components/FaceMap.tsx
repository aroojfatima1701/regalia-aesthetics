import { useRef, useState } from 'react';
import { concerns, money, treatments } from '../lib/data';
import { useStore } from '../lib/store';
import { go, Link } from '../lib/router';
import { useInView } from '../lib/hooks';
import { facePhoto, treatmentPhoto } from '../lib/photos';
import { t as tt } from '../lib/i18n';

export function FaceMap() {
  const { city, setDraft } = useStore();
  const [sel, setSel] = useState('forehead');
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.3);
  const c = concerns.find((x) => x.id === sel)!;
  const list = treatments.filter((t) => t.concerns.includes(sel));

  return (
    <div className="fmap">
      <div ref={ref} dir="ltr" className={`fmap__face ${seen ? 'is-drawn' : ''}`}>
        <img className="fmap__photo" src={facePhoto} alt={tt('Portrait of a woman with clear skin, used to choose an area of the face')} width={800} height={1040} loading="lazy" />
        <span className="fmap__scan" aria-hidden="true" />
        {concerns.map((x) => (
          <button key={x.id} type="button" className={`spot ${sel === x.id ? 'is-on' : ''}`} style={{ left: `${(x.x / 400) * 100}%`, top: `${(x.y / 520) * 100}%` }}
            onClick={() => setSel(x.id)} aria-pressed={sel === x.id} aria-label={x.label}>
            <span className="spot__ring" /><span className="spot__dot" />
            <span className="spot__tip" aria-hidden="true">{x.label}</span>
          </button>
        ))}
      </div>
      <div className="fmap__panel">
        <div className="fmap__chips" role="group" aria-label={tt('Choose a concern')}>
          {concerns.map((x) => <button key={x.id} type="button" className={`chip ${sel === x.id ? 'is-on' : ''}`} aria-pressed={sel === x.id} onClick={() => setSel(x.id)}>{x.label}</button>)}
        </div>
        <div className="fmap__result" key={sel} aria-live="polite">
          <p className="eyebrow">{tt('Your concern')}</p>
          <h3 className="fmap__title">{c.label}</h3>
          <p className="muted">{c.note}</p>
          <ul className="tlist">
            {list.map((t) => (
              <li key={t.id}>
                <img className="tlist__img" src={treatmentPhoto[t.id]} alt="" width={64} height={80} loading="lazy" />
                <div>
                  <Link to={`/treatment/${t.id}`} className="tlist__name">{t.name}</Link>
                  <span className="tlist__meta">{tt('From')} {money(t.price[city], city)}{t.per ? ` ${t.per}` : ''} · {tt('Downtime')}: {t.downtime.toLowerCase()}</span>
                </div>
                <button type="button" className="btn btn--line btn--sm" onClick={() => { setDraft({ treatmentId: t.id }); go('/book'); }}>{tt('Book')}</button>
              </li>
            ))}
          </ul>
          <p className="fine">{tt('Not sure? A consultation comes first, and your doctor will only suggest what you need.')}</p>
        </div>
      </div>
    </div>
  );
}
