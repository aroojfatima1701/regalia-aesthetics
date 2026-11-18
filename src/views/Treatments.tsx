import { useState, type CSSProperties } from 'react';
import { categories, concerns, money, treatments, type CategoryId } from '../lib/data';
import { useStore } from '../lib/store';
import { Link } from '../lib/router';
import { Icon } from '../components/Icon';
import { treatmentPhoto } from '../lib/photos';
import { t as tt } from '../lib/i18n';

export default function Treatments() {
  const { city } = useStore();
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [concern, setConcern] = useState('');
  const [noDowntime, setNoDowntime] = useState(false);
  const list = treatments.filter((t) => (cat === 'all' || t.category === cat) && (!concern || t.concerns.includes(concern)) && (!noDowntime || t.downtimeDays === 0));
  return (
    <div className="page">
      <section className="phead">
        <div className="wrap">
          <p className="eyebrow">{tt('Treatments')}</p>
          <h1 className="h1">{tt('Every treatment,')} <em>{tt('clearly explained')}</em></h1>
          <p className="lede">{tt('Prices from, how long it takes, downtime and how long results last.')} {tt(city === 'dxb' ? 'Shown in AED for our Dubai clinic.' : 'Shown in USD for our New York clinic.')}</p>
        </div>
      </section>
      <div className="wrap">
        <div className="filters">
          <div className="seg seg--wrap" role="radiogroup" aria-label={tt('Category')}>
            <button type="button" role="radio" aria-checked={cat === 'all'} onClick={() => setCat('all')}>{tt('All')}</button>
            {categories.map((c) => <button key={c.id} type="button" role="radio" aria-checked={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</button>)}
          </div>
          <label className="select"><span className="sr-only">{tt('Concern')}</span>
            <select id="f-concern" value={concern} onChange={(e) => setConcern(e.target.value)}>
              <option value="">{tt('Any concern')}</option>
              {concerns.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="check"><input id="f-dt" type="checkbox" checked={noDowntime} onChange={(e) => setNoDowntime(e.target.checked)} /> {tt('No downtime only')}</label>
        </div>
        <p className="count" aria-live="polite">{tt(list.length === 1 ? '{n} treatment' : '{n} treatments', { n: list.length })}</p>
        <div className="tgrid" key={`${cat}${concern}${noDowntime}`}>
          {list.map((t, i) => (
            <Link key={t.id} to={`/treatment/${t.id}`} className="tcard" style={{ '--i': i } as CSSProperties}>
              <span className="tcard__img"><img src={treatmentPhoto[t.id]} alt="" loading="lazy" width={800} height={1000} /></span>
              <span className="tcard__top"><Icon k={t.icon} size={30} /><span className="tcard__cat">{categories.find((c) => c.id === t.category)!.label}</span></span>
              <h2>{t.name}</h2>
              <p>{t.short}</p>
              <dl>
                <div><dt>{tt('From')}</dt><dd>{money(t.price[city], city)}{t.per ? <small> {t.per}</small> : null}</dd></div>
                <div><dt>{tt('Downtime')}</dt><dd>{t.downtime}</dd></div>
                <div><dt>{tt('Lasts')}</dt><dd>{t.lasts}</dd></div>
              </dl>
            </Link>
          ))}
          {list.length === 0 && <p className="empty">{tt('No treatments match these filters. Try another concern, or book a consultation and let your doctor advise.')}</p>}
        </div>
      </div>
    </div>
  );
}
