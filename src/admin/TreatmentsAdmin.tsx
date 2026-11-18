import { useState } from 'react';
import { categories, concerns, money, type CategoryId, type IconKey, type Treatment } from '../lib/data';
import { useContent } from '../lib/content';
import { Icon } from '../components/Icon';
import { AR } from '../lib/ar';
import { t as tt, tr } from '../lib/i18n';
import { Area, Drawer, Field, Head, ImageInput, Select, Toggle, slug, useToast } from './ui';

const icons: IconKey[] = ['syringe', 'drop', 'lips', 'sparkle', 'needles', 'peel', 'beam', 'leaf', 'lift', 'thread', 'facial', 'wave'];
const blank = (): Treatment => ({ id: '', name: '', category: 'facials', icon: 'sparkle', short: '', about: '', price: { dxb: 0, nyc: 0 }, duration: '', downtime: 'None', downtimeDays: 0, sessions: '1', lasts: '', concerns: [], journey: [{ when: 'Day 0', what: '' }], faqs: [], published: true });

function Editor({ initial, isNew, onClose }: { initial: Treatment; isNew: boolean; onClose: () => void }) {
  const { save } = useContent();
  const toast = useToast();
  const [t, setT] = useState<Treatment>(initial);
  const [err, setErr] = useState<Record<string, string>>({});
  const set = <K extends keyof Treatment>(k: K, v: Treatment[K]) => setT((x) => ({ ...x, [k]: v }));
  const commit = () => {
    const e: Record<string, string> = {};
    if (!t.name.trim()) e.name = 'Add a treatment name.';
    if (!(t.price.dxb > 0)) e.dxb = 'Enter a price above zero.';
    if (!(t.price.nyc > 0)) e.nyc = 'Enter a price above zero.';
    setErr(e); if (Object.keys(e).length) return;
    const ok = save((c) => {
      const item = { ...t, name: t.name.trim(), id: t.id || slug(t.name), journey: t.journey.filter((s) => s.what.trim()), faqs: t.faqs.filter((f) => f.q.trim()) };
      if (isNew) { while (c.treatments.some((x) => x.id === item.id)) item.id += '-2'; c.treatments.push(item); } else c.treatments = c.treatments.map((x) => (x.id === t.id ? item : x));
      return c;
    });
    toast(ok ? tt('{name} saved. The website is updated.', { name: tr(t.name.trim()) }) : 'Saved for now, but this browser is out of storage. Try a smaller photo.');
    onClose();
  };
  const remove = () => { save((c) => ({ ...c, treatments: c.treatments.filter((x) => x.id !== t.id) })); toast(tt('{name} deleted', { name: tr(t.name) })); onClose(); };
  return (
    <Drawer title={isNew ? 'Add a treatment' : tt('Edit {name}', { name: tr(initial.name) })} onClose={onClose} onSave={commit} saveLabel={isNew ? 'Add treatment' : 'Save changes'} onDelete={isNew ? undefined : remove} deleteLabel={tt('Delete {name} from the website?', { name: tr(initial.name) })}>
      <div className="ad-form">
        <div className="ad-field--wide"><ImageInput id="tr-photo" label="Treatment photo" value={t.photo} onChange={(v) => set('photo', v)} ratio={4 / 5} /></div>
        <div className="ad-field--wide ad-toggles">
          <Toggle id="tr-pub" checked={t.published !== false} onChange={(v) => set('published', v)} label="Show on the website" />
          <Toggle id="tr-sig" checked={!!t.signature} onChange={(v) => set('signature', v)} label="Signature treatment (home page)" />
        </div>
        <Field label="Name" id="tr-name" value={t.name} onChange={(v) => set('name', v)} error={err.name} wide />
        <Select label="Category" id="tr-cat" value={t.category} onChange={(v) => set('category', v as CategoryId)} options={categories.map((c) => ({ v: c.id, label: c.label }))} />
        <fieldset className="ad-field">
          <legend>{tt('Icon')}</legend>
          <div className="ad-icons">{icons.map((k) => <button key={k} type="button" className={t.icon === k ? 'is-on' : ''} aria-pressed={t.icon === k} aria-label={k} onClick={() => set('icon', k)}><Icon k={k} size={26} /></button>)}</div>
        </fieldset>
        <Area label="Short description (cards)" id="tr-short" value={t.short} onChange={(v) => set('short', v)} rows={2} />
        <Area label="How it works (treatment page)" id="tr-about" value={t.about} onChange={(v) => set('about', v)} />
        <fieldset className="ad-field ad-field--wide ad-ar">
          <legend>{tt('Arabic version')} <span className="ad-muted">{tt('· leave empty to use the built-in translation')}</span></legend>
          <div className="ad-form">
            <Field label="Name in Arabic" id="tr-name-ar" value={t.nameAr ?? ''} onChange={(v) => set('nameAr', v || undefined)} placeholder={AR[t.name] ?? 'اسم العلاج'} dir="rtl" />
            <Area label="Short description in Arabic" id="tr-short-ar" value={t.shortAr ?? ''} onChange={(v) => set('shortAr', v || undefined)} rows={2} placeholder={AR[t.short] ?? 'وصف قصير'} dir="rtl" />
          </div>
        </fieldset>
        <Field label="Price from, Dubai (AED)" id="tr-dxb" type="number" value={t.price.dxb || ''} onChange={(v) => set('price', { ...t.price, dxb: Number(v) })} error={err.dxb} />
        <Field label="Price from, New York (USD)" id="tr-nyc" type="number" value={t.price.nyc || ''} onChange={(v) => set('price', { ...t.price, nyc: Number(v) })} error={err.nyc} />
        <Field label="Price note" id="tr-per" value={t.per ?? ''} onChange={(v) => set('per', v || undefined)} placeholder="per area, per syringe…" />
        <Field label="Treatment time" id="tr-dur" value={t.duration} onChange={(v) => set('duration', v)} placeholder="30 minutes" />
        <Field label="Downtime" id="tr-dt" value={t.downtime} onChange={(v) => set('downtime', v)} placeholder="None" />
        <Field label="Downtime in days (for filters and quiz)" id="tr-dtd" type="number" value={t.downtimeDays} onChange={(v) => set('downtimeDays', Number(v) || 0)} />
        <Field label="Sessions" id="tr-ses" value={t.sessions} onChange={(v) => set('sessions', v)} />
        <Field label="Results last" id="tr-last" value={t.lasts} onChange={(v) => set('lasts', v)} />
        <fieldset className="ad-field ad-field--wide">
          <legend>{tt('Shows on the face map for')}</legend>
          <div className="ad-chips">{concerns.map((c) => <button key={c.id} type="button" className={`ad-chip ${t.concerns.includes(c.id) ? 'is-on' : ''}`} aria-pressed={t.concerns.includes(c.id)} onClick={() => set('concerns', t.concerns.includes(c.id) ? t.concerns.filter((x) => x !== c.id) : [...t.concerns, c.id])}>{c.label}</button>)}</div>
        </fieldset>
        <fieldset className="ad-field ad-field--wide ad-list">
          <legend>{tt('What to expect, step by step')}</legend>
          {t.journey.map((s, i) => (
            <div key={i} className="ad-list__row ad-list__row--pair">
              <input dir="auto" aria-label={tt('Step {n} when', { n: i + 1 })} value={s.when} placeholder={tt('Day 3')} onChange={(e) => set('journey', t.journey.map((x, k) => (k === i ? { ...x, when: e.target.value } : x)))} />
              <input dir="auto" aria-label={tt('Step {n} what happens', { n: i + 1 })} value={s.what} placeholder={tt('What the patient notices')} onChange={(e) => set('journey', t.journey.map((x, k) => (k === i ? { ...x, what: e.target.value } : x)))} />
              <button type="button" className="ad-icon" aria-label={tt('Remove step {n}', { n: i + 1 })} onClick={() => set('journey', t.journey.filter((_, k) => k !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => set('journey', [...t.journey, { when: '', what: '' }])}>{tt('+ Add step')}</button>
        </fieldset>
        <fieldset className="ad-field ad-field--wide ad-list">
          <legend>{tt('Questions')}</legend>
          {t.faqs.map((f, i) => (
            <div key={i} className="ad-faq">
              <input dir="auto" aria-label={tt('Question {n}', { n: i + 1 })} value={f.q} placeholder={tt('Question')} onChange={(e) => set('faqs', t.faqs.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)))} />
              <textarea dir="auto" aria-label={tt('Answer {n}', { n: i + 1 })} rows={2} value={f.a} placeholder={tt('Answer')} onChange={(e) => set('faqs', t.faqs.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)))} />
              <button type="button" className="ad-link ad-link--danger" onClick={() => set('faqs', t.faqs.filter((_, k) => k !== i))}>{tt('Remove question')}</button>
            </div>
          ))}
          <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => set('faqs', [...t.faqs, { q: '', a: '' }])}>{tt('+ Add question')}</button>
        </fieldset>
      </div>
    </Drawer>
  );
}

export default function TreatmentsAdmin() {
  const { content, save } = useContent();
  const toast = useToast();
  const [editing, setEditing] = useState<{ t: Treatment; isNew: boolean } | null>(null);
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [q, setQ] = useState('');
  const list = content.treatments.filter((t) => (cat === 'all' || t.category === cat) && (t.name + ' ' + tr(t.name)).toLowerCase().includes(q.toLowerCase()));
  const patch = (id: string, p: Partial<Treatment>, msg: string) => { save((c) => ({ ...c, treatments: c.treatments.map((x) => (x.id === id ? { ...x, ...p } : x)) })); toast(msg); };
  return (
    <>
      <Head title="Treatments" sub={tt('{n} treatments · {h} hidden. Prices, photos and every text on the treatment pages are editable.', { n: content.treatments.length, h: content.treatments.filter((t) => t.published === false).length })}>
        <button type="button" className="ad-btn ad-btn--primary" onClick={() => setEditing({ t: blank(), isNew: true })}>{tt('+ Add treatment')}</button>
      </Head>
      <div className="ad-tools">
        <div className="ad-seg ad-seg--wrap" role="radiogroup" aria-label={tt('Category')}>
          <button type="button" role="radio" aria-checked={cat === 'all'} onClick={() => setCat('all')}>{tt('All')}</button>
          {categories.map((c) => <button key={c.id} type="button" role="radio" aria-checked={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</button>)}
        </div>
        <label className="ad-search"><span className="sr-only">{tt('Search treatments')}</span><input id="tr-q" type="search" placeholder={tt('Search treatments')} value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr><th>{tt('Treatment')}</th><th>{tt('Category')}</th><th className="num">{tt('Dubai')}</th><th className="num">{tt('New York')}</th><th>{tt('Downtime')}</th><th>{tt('Signature')}</th><th>{tt('On website')}</th><th><span className="sr-only">{tt('Edit')}</span></th></tr></thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className={t.published === false ? 'is-off' : ''}>
                <td><span className="ad-item">{t.photo ? <img src={t.photo} alt="" /> : <span className="ad-item__ph"><Icon k={t.icon} size={22} /></span>}<span className="ad-who"><b>{tr(t.name)}</b><small>{tr(t.duration)}</small></span></span></td>
                <td>{categories.find((c) => c.id === t.category)?.label}</td>
                <td className="num">{money(t.price.dxb, 'dxb')}{t.per && <small> {tr(t.per)}</small>}</td>
                <td className="num">{money(t.price.nyc, 'nyc')}</td>
                <td>{tr(t.downtime)}</td>
                <td><input type="checkbox" className="ad-check" aria-label={tt('{name} is a signature treatment', { name: tr(t.name) })} checked={!!t.signature} onChange={(e) => patch(t.id, { signature: e.target.checked }, tt(e.target.checked ? '{name} added to signature treatments' : '{name} removed from signature treatments', { name: tr(t.name) }))} /></td>
                <td><input type="checkbox" className="ad-check" aria-label={tt('Show {name} on the website', { name: tr(t.name) })} checked={t.published !== false} onChange={(e) => patch(t.id, { published: e.target.checked }, tt(e.target.checked ? '{name} is live on the website' : '{name} hidden from the website', { name: tr(t.name) }))} /></td>
                <td className="ad-right"><button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => setEditing({ t: JSON.parse(JSON.stringify(t)), isNew: false })}>{tt('Edit')}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="ad-empty ad-empty--pad">{tt('No treatments match.')}</p>}
      </div>
      {editing && <Editor initial={editing.t} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </>
  );
}
