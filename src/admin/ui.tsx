import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { fileToJpeg } from '../lib/content';
import { t } from '../lib/i18n';

/* ---------- Toasts ---------- */
const ToastCtx = createContext<(t: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  const push = (raw: string) => { const text = t(raw); const id = Date.now() + Math.random(); setItems((t) => [...t.slice(-2), { id, text }]); setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 3600); };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="ad-toasts" role="status" aria-live="polite">{items.map((t) => <div key={t.id} className="ad-toast">{t.text}</div>)}</div>
    </ToastCtx.Provider>
  );
}

/* ---------- Page head ---------- */
export function Head({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="ad-head">
      <div><h1>{t(title)}</h1>{sub && <p>{t(sub)}</p>}</div>
      {children && <div className="ad-head__actions">{children}</div>}
    </div>
  );
}

/* ---------- Form fields ---------- */
export function Field({ label, id, value, onChange, type = 'text', placeholder, hint, error, wide, dir }: { label: string; id: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; hint?: string; error?: string; wide?: boolean; dir?: 'rtl' | 'ltr' }) {
  return (
    <label className={`ad-field ${wide ? 'ad-field--wide' : ''}`} htmlFor={id}>
      <span>{t(label)}</span>
      <input id={id} type={type} dir={dir ?? 'auto'} value={value} placeholder={placeholder && t(placeholder)} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} inputMode={type === 'number' ? 'decimal' : undefined} />
      {hint && !error && <small>{t(hint)}</small>}
      {error && <em>{t(error)}</em>}
    </label>
  );
}
export function Area({ label, id, value, onChange, rows = 3, wide = true, dir, placeholder }: { label: string; id: string; value: string; onChange: (v: string) => void; rows?: number; wide?: boolean; dir?: 'rtl' | 'ltr'; placeholder?: string }) {
  return <label className={`ad-field ${wide ? 'ad-field--wide' : ''}`} htmlFor={id}><span>{t(label)}</span><textarea id={id} rows={rows} dir={dir ?? 'auto'} placeholder={placeholder && t(placeholder)} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
export function Select<T extends string>({ label, id, value, onChange, options, wide }: { label: string; id: string; value: T; onChange: (v: T) => void; options: { v: T; label: string }[]; wide?: boolean }) {
  return (
    <label className={`ad-field ${wide ? 'ad-field--wide' : ''}`} htmlFor={id}>
      <span>{t(label)}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>{options.map((o) => <option key={o.v} value={o.v}>{t(o.label)}</option>)}</select>
    </label>
  );
}
export function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="ad-toggle" htmlFor={id}>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="ad-toggle__track" aria-hidden="true"><span /></span>
      <span>{t(label)}</span>
    </label>
  );
}

/** A list of short strings (perks, focus areas) with add, edit and remove. */
export function StringList({ label, id, items, onChange, placeholder }: { label: string; id: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => { const v = draft.trim(); if (!v) return; onChange([...items, v]); setDraft(''); };
  return (
    <fieldset className="ad-field ad-field--wide ad-list">
      <legend>{t(label)}</legend>
      {items.map((it, i) => (
        <div key={i} className="ad-list__row">
          <input dir="auto" aria-label={`${t(label)} ${i + 1}`} value={it} onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))} />
          <button type="button" className="ad-icon" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label={t('Remove {name}', { name: it })}>×</button>
        </div>
      ))}
      <div className="ad-list__row">
        <input id={id} dir="auto" value={draft} placeholder={t(placeholder ?? 'Add another')} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={add}>{t('Add')}</button>
      </div>
    </fieldset>
  );
}

/** Image picker: shows the current image, uploads a new one (resized in the browser). */
export function ImageInput({ id, label, value, onChange, ratio, hint }: { id: string; label: string; value?: string; onChange: (v: string | undefined) => void; ratio?: number; hint?: string }) {
  const [err, setErr] = useState('');
  return (
    <div className="ad-image">
      <div className="ad-image__preview" style={{ aspectRatio: ratio ? String(ratio) : '4 / 5' }}>{value ? <img src={value} alt="" /> : <span>{t('No image')}</span>}</div>
      <div className="ad-image__side">
        <b>{t(label)}</b>
        <label className="ad-btn ad-btn--ghost ad-btn--sm" htmlFor={id}>{t(value ? 'Replace image' : 'Upload image')}</label>
        <input id={id} className="sr-only" type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { onChange(await fileToJpeg(f, 900, ratio)); setErr(''); } catch (x) { setErr((x as Error).message); } }} />
        {value && <button type="button" className="ad-link" onClick={() => onChange(undefined)}>{t('Remove image')}</button>}
        <small>{t(hint ?? 'JPG or PNG. It is cropped and resized for you.')}</small>
        {err && <em className="ad-err">{err}</em>}
      </div>
    </div>
  );
}

/* ---------- Drawer with confirm-to-delete ---------- */
export function Drawer({ title, onClose, onSave, onDelete, deleteLabel, children, saveLabel = 'Save changes' }: { title: string; onClose: () => void; onSave: () => void; onDelete?: () => void; deleteLabel?: string; children: ReactNode; saveLabel?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { ref.current?.focus(); const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; }; }, [onClose]);
  return (
    <div className="ad-drawer" role="dialog" aria-modal="true" aria-labelledby="ad-drawer-title">
      <button type="button" className="ad-drawer__scrim" aria-label={t('Close')} tabIndex={-1} onClick={onClose} />
      <form className="ad-drawer__panel" onSubmit={(e) => { e.preventDefault(); onSave(); }} noValidate>
        <header><h2 id="ad-drawer-title">{t(title)}</h2><button ref={ref} type="button" className="ad-icon" onClick={onClose} aria-label={t('Close')}>×</button></header>
        <div className="ad-drawer__body">{children}</div>
        <footer>
          {onDelete && (confirm ? (
            <span className="ad-confirm"><span>{t(deleteLabel ?? 'Delete this?')}</span><button type="button" className="ad-btn ad-btn--danger ad-btn--sm" onClick={onDelete}>{t('Delete')}</button><button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => setConfirm(false)}>{t('Keep')}</button></span>
          ) : <button type="button" className="ad-link ad-link--danger" onClick={() => setConfirm(true)}>{t('Delete')}</button>)}
          <span className="ad-spacer" />
          <button type="button" className="ad-btn ad-btn--ghost" onClick={onClose}>{t('Cancel')}</button>
          <button type="submit" className="ad-btn ad-btn--primary">{t(saveLabel)}</button>
        </footer>
      </form>
    </div>
  );
}

export function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'warn' }) {
  return <div className="ad-kpi"><span>{t(label)}</span><b>{value}</b>{sub && <small className={tone ? `is-${tone}` : ''}>{t(sub)}</small>}</div>;
}
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `item-${Date.now()}`;
