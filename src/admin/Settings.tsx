import { useState } from 'react';
import type { CityId, Clinic, Membership } from '../lib/data';
import { useContent, type Slide, type SiteText } from '../lib/content';
import { Link } from '../lib/router';
import { Area, Field, Head, ImageInput, Select, StringList, useToast } from './ui';
import { t as tt, timeLabel, tr } from '../lib/i18n';

function SaveBar({ dirty, onSave, onUndo }: { dirty: boolean; onSave: () => void; onUndo: () => void }) {
  return (
    <div className={`ad-savebar ${dirty ? 'is-on' : ''}`} aria-hidden={!dirty}>
      <span>{tt('You have unsaved changes')}</span>
      <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={onUndo} tabIndex={dirty ? 0 : -1}>{tt('Discard')}</button>
      <button type="button" className="ad-btn ad-btn--primary ad-btn--sm" onClick={onSave} tabIndex={dirty ? 0 : -1}>{tt('Save and publish')}</button>
    </div>
  );
}

/* ---------- Memberships ---------- */
export function MembershipsAdmin() {
  const { content, save } = useContent();
  const toast = useToast();
  const [list, setList] = useState<Membership[]>(() => JSON.parse(JSON.stringify(content.memberships)));
  const dirty = JSON.stringify(list) !== JSON.stringify(content.memberships);
  const upd = (i: number, p: Partial<Membership>) => setList((l) => l.map((m, k) => (k === i ? { ...m, ...p } : m)));
  const commit = () => {
    if (list.some((m) => !m.name.trim() || !(m.price.dxb > 0) || !(m.price.nyc > 0))) { toast('Every plan needs a name and prices above zero.'); return; }
    save((c) => ({ ...c, memberships: list })); toast('Membership plans published');
  };
  return (
    <>
      <Head title="Memberships" sub="Monthly plans shown on the home page. The savings calculator uses the plan marked as featured.">
        <button type="button" className="ad-btn ad-btn--ghost" disabled={list.length >= 4} onClick={() => setList((l) => [...l, { id: `plan-${Date.now()}`, name: 'New plan', price: { dxb: 500, nyc: 150 }, perks: ['One facial every month'] }])}>{tt('+ Add plan')}</button>
      </Head>
      <div className="ad-plans">
        {list.map((m, i) => (
          <section key={m.id} className={`ad-panel ad-plan ${m.featured ? 'is-featured' : ''}`}>
            <header><h2>{m.name ? tr(m.name) : tt('Untitled plan')}</h2>{list.length > 1 && <button type="button" className="ad-link ad-link--danger" onClick={() => setList((l) => l.filter((_, k) => k !== i))}>{tt('Remove')}</button>}</header>
            <div className="ad-form">
              <Field label="Plan name" id={`m-name-${i}`} value={m.name} onChange={(v) => upd(i, { name: v })} wide />
              <Field label="Dubai, AED / month" id={`m-dxb-${i}`} type="number" value={m.price.dxb || ''} onChange={(v) => upd(i, { price: { ...m.price, dxb: Number(v) } })} />
              <Field label="New York, USD / month" id={`m-nyc-${i}`} type="number" value={m.price.nyc || ''} onChange={(v) => upd(i, { price: { ...m.price, nyc: Number(v) } })} />
              <StringList label="What’s included" id={`m-perk-${i}`} items={m.perks} onChange={(v) => upd(i, { perks: v })} />
              <label className="ad-radio ad-field--wide"><input type="radio" name="featured" checked={!!m.featured} onChange={() => setList((l) => l.map((x, k) => ({ ...x, featured: k === i })))} /> {tt('Featured plan (“Most chosen”)')}</label>
            </div>
          </section>
        ))}
      </div>
      <SaveBar dirty={dirty} onSave={commit} onUndo={() => setList(JSON.parse(JSON.stringify(content.memberships)))} />
    </>
  );
}

/* ---------- Clinics ---------- */
export function ClinicsAdmin() {
  const { content, save } = useContent();
  const toast = useToast();
  const [cl, setCl] = useState<Record<CityId, Clinic>>(() => JSON.parse(JSON.stringify(content.clinics)));
  const dirty = JSON.stringify(cl) !== JSON.stringify(content.clinics);
  const upd = (id: CityId, p: Partial<Clinic>) => setCl((c) => ({ ...c, [id]: { ...c[id], ...p } }));
  const hours = Array.from({ length: 24 }, (_, h) => ({ v: String(h), label: timeLabel(`${((h + 11) % 12) + 1}:00 ${h < 12 ? 'am' : 'pm'}`) }));
  const commit = () => {
    for (const id of ['dxb', 'nyc'] as CityId[]) if (cl[id].closes <= cl[id].opens) { toast(tt('{city}: closing time must be after opening time.', { city: tr(cl[id].city) })); return; }
    save((c) => ({ ...c, clinics: cl })); toast('Clinic details published');
  };
  return (
    <>
      <Head title="Clinics" sub="Addresses, hours and consultation fees. Opening hours also set the times patients can book." />
      <div className="ad-plans ad-plans--2">
        {(['dxb', 'nyc'] as CityId[]).map((id) => (
          <section key={id} className="ad-panel">
            <header><h2>{tr(cl[id].city)}</h2><span className="ad-muted" dir="ltr">{cl[id].timeZone.replace('_', ' ')} · {cl[id].currency}</span></header>
            <div className="ad-form">
              <Field label="Area" id={`c-area-${id}`} value={cl[id].area} onChange={(v) => upd(id, { area: v })} />
              <Field label="Phone" id={`c-phone-${id}`} value={cl[id].phone} onChange={(v) => upd(id, { phone: v })} />
              <Field label="Address" id={`c-addr-${id}`} value={cl[id].address} onChange={(v) => upd(id, { address: v })} wide />
              <Select label="Opens" id={`c-open-${id}`} value={String(cl[id].opens)} onChange={(v) => upd(id, { opens: Number(v) })} options={hours} />
              <Select label="Closes" id={`c-close-${id}`} value={String(cl[id].closes)} onChange={(v) => upd(id, { closes: Number(v) })} options={hours} />
              <Field label="Hours shown on the website" id={`c-hl-${id}`} value={cl[id].hoursLabel} onChange={(v) => upd(id, { hoursLabel: v })} wide />
              <Field label={tt('Consultation fee ({c})', { c: tt(cl[id].currency) })} id={`c-fee-${id}`} type="number" value={cl[id].consultFee} onChange={(v) => upd(id, { consultFee: Number(v) || 0 })} />
              <Area label="Licensing line" id={`c-lic-${id}`} value={cl[id].license} onChange={(v) => upd(id, { license: v })} rows={2} />
            </div>
          </section>
        ))}
      </div>
      <SaveBar dirty={dirty} onSave={commit} onUndo={() => setCl(JSON.parse(JSON.stringify(content.clinics)))} />
    </>
  );
}

/* ---------- Website content ---------- */
export function WebsiteAdmin() {
  const { content, save } = useContent();
  const toast = useToast();
  const [text, setText] = useState<SiteText>(() => ({ ...content.text }));
  const [textAr, setTextAr] = useState<SiteText>(() => ({ ...content.textAr }));
  const [slides, setSlides] = useState<Slide[]>(() => JSON.parse(JSON.stringify(content.slides)));
  const dirty = JSON.stringify(text) !== JSON.stringify(content.text) || JSON.stringify(textAr) !== JSON.stringify(content.textAr) || JSON.stringify(slides) !== JSON.stringify(content.slides);
  const links = [{ v: '/book', label: 'Booking page' }, { v: '/treatments', label: 'All treatments' }, ...content.treatments.map((t) => ({ v: `/treatment/${t.id}`, label: t.name }))];
  const upd = (i: number, p: Partial<Slide>) => setSlides((s) => s.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const move = (i: number, d: number) => setSlides((s) => { const n = [...s]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); return n; });
  const commit = () => {
    if (!slides.length) { toast('Keep at least one hero photo.'); return; }
    if (slides.some((s) => !s.src)) { toast('Every slide needs a photo.'); return; }
    const ok = save((c) => ({ ...c, text, textAr, slides: slides.map((s) => ({ ...s, alt: s.alt || s.label })) }));
    toast(ok ? 'Home page published' : 'Saved for now, but browser storage is full. Use fewer or smaller photos.');
  };
  return (
    <>
      <Head title="Website content" sub="The home page hero and its photo slideshow.">
        <Link to="/" className="ad-btn ad-btn--ghost">{tt('View home page')}</Link>
      </Head>
      <section className="ad-panel">
        <header><h2>{tt('Hero text')}</h2></header>
        <div className="ad-form">
          <Field label="Small line above the headline" id="w-eyebrow" value={text.eyebrow} onChange={(v) => setText({ ...text, eyebrow: v })} wide />
          <Field label="Headline, first line" id="w-t1" value={text.title1} onChange={(v) => setText({ ...text, title1: v })} />
          <Field label="Headline, second line (italic)" id="w-t2" value={text.title2} onChange={(v) => setText({ ...text, title2: v })} />
          <Area label="Introduction" id="w-sub" value={text.sub} onChange={(v) => setText({ ...text, sub: v })} />
          <Field label="Closing line at the bottom of the page" id="w-close" value={text.closing} onChange={(v) => setText({ ...text, closing: v })} hint="The last word is shown in italic." wide />
        </div>
        <div className="ad-preview" aria-label={tt('Preview')}>
          <small>{text.eyebrow}</small>
          <b>{text.title1}<br /><em>{text.title2}</em></b>
        </div>
      </section>
      <section className="ad-panel">
        <header><h2>{tt('Hero text in Arabic')}</h2><span className="ad-muted">{tt('Shown when visitors switch the website to عربي')}</span></header>
        <div className="ad-form">
          <Field label="Small line above the headline" id="wa-eyebrow" value={textAr.eyebrow} onChange={(v) => setTextAr({ ...textAr, eyebrow: v })} dir="rtl" wide />
          <Field label="Headline, first line" id="wa-t1" value={textAr.title1} onChange={(v) => setTextAr({ ...textAr, title1: v })} dir="rtl" />
          <Field label="Headline, second line (accent colour)" id="wa-t2" value={textAr.title2} onChange={(v) => setTextAr({ ...textAr, title2: v })} dir="rtl" />
          <Area label="Introduction" id="wa-sub" value={textAr.sub} onChange={(v) => setTextAr({ ...textAr, sub: v })} dir="rtl" />
          <Field label="Closing line" id="wa-close" value={textAr.closing} onChange={(v) => setTextAr({ ...textAr, closing: v })} dir="rtl" wide />
        </div>
      </section>
      <section className="ad-panel">
        <header><h2>{tt('Hero slideshow')}</h2><span className="ad-muted">{tt('{n} photos · changes every 4 seconds', { n: slides.length })}</span></header>
        <ol className="ad-slides">
          {slides.map((s, i) => (
            <li key={s.id} className="ad-slide">
              <ImageInput id={`sl-img-${s.id}`} label={tt('Photo {n}', { n: i + 1 })} value={s.src} onChange={(v) => upd(i, { src: v ?? '' })} ratio={4 / 5} hint="Portrait photos work best." />
              <div className="ad-form">
                <Field label="Caption" id={`sl-l-${s.id}`} value={s.label} onChange={(v) => upd(i, { label: v })} />
                <Select label="Caption links to" id={`sl-to-${s.id}`} value={s.to} onChange={(v) => upd(i, { to: v })} options={links} />
                <Field label="Image description (for screen readers)" id={`sl-alt-${s.id}`} value={s.alt} onChange={(v) => upd(i, { alt: v })} wide />
                <div className="ad-slide__actions ad-field--wide">
                  <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" disabled={i === 0} onClick={() => move(i, -1)}>{tt('Move up')}</button>
                  <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" disabled={i === slides.length - 1} onClick={() => move(i, 1)}>{tt('Move down')}</button>
                  <button type="button" className="ad-link ad-link--danger" disabled={slides.length === 1} onClick={() => setSlides((x) => x.filter((_, k) => k !== i))}>{tt('Remove')}</button>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="ad-btn ad-btn--ghost" disabled={slides.length >= 8} onClick={() => setSlides((x) => [...x, { id: `s${Date.now()}`, src: '', label: 'New treatment', to: '/treatments', alt: '' }])}>{tt('+ Add photo')}</button>
      </section>
      <SaveBar dirty={dirty} onSave={commit} onUndo={() => { setText({ ...content.text }); setTextAr({ ...content.textAr }); setSlides(JSON.parse(JSON.stringify(content.slides))); }} />
    </>
  );
}
