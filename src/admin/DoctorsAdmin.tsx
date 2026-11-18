import { useState } from 'react';
import type { CityId, Doctor } from '../lib/data';
import { useContent } from '../lib/content';
import { useStore } from '../lib/store';
import { Area, Drawer, Field, Head, ImageInput, Select, StringList, slug, useToast } from './ui';
import { t as tt, tr } from '../lib/i18n';

const blank = (): Doctor => ({ id: '', name: 'Dr. ', role: '', city: 'dxb', bio: '', focus: [], languages: 'English', years: 5, quote: '' });

function Editor({ initial, isNew, onClose }: { initial: Doctor; isNew: boolean; onClose: () => void }) {
  const { content, save } = useContent();
  const { bookings } = useStore();
  const toast = useToast();
  const [d, setD] = useState<Doctor>(initial);
  const [err, setErr] = useState<Record<string, string>>({});
  const set = <K extends keyof Doctor>(k: K, v: Doctor[K]) => setD((x) => ({ ...x, [k]: v }));
  const upcoming = bookings.filter((b) => b.doctorId === d.id && b.status !== 'cancelled' && b.status !== 'completed').length;
  const commit = () => {
    const e: Record<string, string> = {};
    if (d.name.replace('Dr.', '').trim().length < 2) e.name = 'Add the doctor’s full name.';
    if (!d.role.trim()) e.role = 'Add a role, for example Aesthetic physician.';
    setErr(e); if (Object.keys(e).length) return;
    save((c) => {
      const item = { ...d, name: d.name.trim(), id: d.id || slug(d.name.replace('Dr.', '')) };
      if (isNew) { while (c.doctors.some((x) => x.id === item.id)) item.id += '-2'; c.doctors.push(item); } else c.doctors = c.doctors.map((x) => (x.id === d.id ? item : x));
      return c;
    });
    toast(tt('{name} saved', { name: tr(d.name.trim()) })); onClose();
  };
  const lastInCity = content.doctors.filter((x) => x.city === d.city).length <= 1;
  return (
    <Drawer title={isNew ? 'Add a doctor' : tt('Edit {name}', { name: tr(initial.name) })} onClose={onClose} onSave={commit} saveLabel={isNew ? 'Add doctor' : 'Save changes'}
      onDelete={isNew || lastInCity ? undefined : () => { save((c) => ({ ...c, doctors: c.doctors.filter((x) => x.id !== d.id) })); toast(tt('{name} removed', { name: tr(d.name) })); onClose(); }}
      deleteLabel={upcoming ? tt('Remove {name}? {n} upcoming appointments will need a new doctor.', { name: tr(initial.name), n: upcoming }) : tt('Remove {name}?', { name: tr(initial.name) })}>
      <div className="ad-form">
        <div className="ad-field--wide"><ImageInput id="dr-photo" label="Profile photo" value={d.photo} onChange={(v) => set('photo', v)} ratio={4 / 5} hint="Portrait or a detail shot (hands, white coat). Cropped to 4:5." /></div>
        <Field label="Full name" id="dr-name" value={d.name} onChange={(v) => set('name', v)} error={err.name} />
        <Field label="Role" id="dr-role" value={d.role} onChange={(v) => set('role', v)} error={err.role} placeholder="Consultant dermatologist" />
        <Select label="Clinic" id="dr-city" value={d.city} onChange={(v) => set('city', v as CityId)} options={[{ v: 'dxb', label: 'Dubai, Jumeirah' }, { v: 'nyc', label: 'New York, Upper East Side' }]} />
        <Field label="Years of experience" id="dr-years" type="number" value={d.years} onChange={(v) => set('years', Number(v) || 0)} />
        <Field label="Languages" id="dr-lang" value={d.languages} onChange={(v) => set('languages', v)} wide />
        <Area label="Short quote" id="dr-quote" value={d.quote} onChange={(v) => set('quote', v)} rows={2} />
        <Area label="Bio" id="dr-bio" value={d.bio} onChange={(v) => set('bio', v)} />
        <StringList label="Specialties" id="dr-focus" items={d.focus} onChange={(v) => set('focus', v)} placeholder="e.g. Fillers" />
        {!isNew && lastInCity && <p className="ad-note ad-field--wide">{tt('This is the only doctor at this clinic, so it can’t be removed. Add another doctor first.')}</p>}
      </div>
    </Drawer>
  );
}

export default function DoctorsAdmin() {
  const { content } = useContent();
  const { bookings } = useStore();
  const [editing, setEditing] = useState<{ d: Doctor; isNew: boolean } | null>(null);
  return (
    <>
      <Head title="Doctors" sub="Profiles shown on the website and in the booking form, per clinic.">
        <button type="button" className="ad-btn ad-btn--primary" onClick={() => setEditing({ d: blank(), isNew: true })}>{tt('+ Add doctor')}</button>
      </Head>
      {(['dxb', 'nyc'] as CityId[]).map((city) => (
        <section key={city} className="ad-section">
          <h2 className="ad-h2">{tr(content.clinics[city].area)}{tt(', ')}{tr(content.clinics[city].city)}</h2>
          <div className="ad-cards">
            {content.doctors.filter((d) => d.city === city).map((d) => {
              const next = bookings.filter((b) => b.doctorId === d.id && (b.status === 'confirmed' || b.status === 'requested')).length;
              return (
                <article key={d.id} className="ad-doc">
                  <div className="ad-doc__img">{d.photo ? <img src={d.photo} alt="" /> : <span>{d.name.replace('Dr. ', '').split(' ').map((p) => p[0]).join('')}</span>}</div>
                  <div className="ad-doc__body">
                    <b>{tr(d.name)}</b><small>{tr(d.role)} · {tt('{n} years', { n: d.years })}</small>
                    <p>{tr(d.bio)}</p>
                    <div className="ad-chips">{d.focus.map((f) => <span key={f} className="ad-chip ad-chip--static">{tr(f)}</span>)}</div>
                    <div className="ad-doc__foot"><span>{tt(next === 1 ? '{n} upcoming appointment' : '{n} upcoming appointments', { n: next })}</span><button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => setEditing({ d: JSON.parse(JSON.stringify(d)), isNew: false })}>{tt('Edit')}</button></div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
      {editing && <Editor initial={editing.d} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </>
  );
}
