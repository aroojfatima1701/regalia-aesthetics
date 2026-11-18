import { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import { Lockup } from './Logo';
import { CitySwitch } from './CitySwitch';
import { chosenLang, setLang, t } from '../lib/i18n';

function LangSwitch() {
  const ar = chosenLang() === 'ar';
  return <button type="button" className="langsw" lang={ar ? 'en' : 'ar'} onClick={() => setLang(ar ? 'en' : 'ar')} aria-label={ar ? 'View the website in English' : 'عرض الموقع بالعربية'}>{ar ? 'English' : 'عربي'}</button>;
}

const nav = [
  { to: '/treatments', label: 'Treatments' },
  { to: '/?s=concerns', label: 'Your concerns' },
  { to: '/quiz', label: 'Skin quiz' },
  { to: '/?s=membership', label: 'Membership' },
  { to: '/?s=clinics', label: 'Clinics' },
];

export function Header({ route }: { route: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const on = () => setScrolled(window.scrollY > 20); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on); }, []);
  useEffect(() => { setOpen(false); }, [route]);
  return (
    <header className={`hdr ${scrolled ? 'hdr--scrolled' : ''}`}>
      <div className="hdr__in">
        <Link to="/" className="hdr__logo" aria-label={t('Regalia Aesthetics home')}><Lockup height={scrolled ? 42 : 52} /></Link>
        <nav className="hdr__nav" aria-label={t('Main')}>
          {nav.map((n) => <Link key={n.to} to={n.to} className={`hdr__link ${route === n.to ? 'is-on' : ''}`} aria-current={route === n.to ? 'page' : undefined}>{t(n.label)}</Link>)}
        </nav>
        <div className="hdr__actions">
          <LangSwitch />
          <CitySwitch />
          <Link to="/book" className="btn btn--plum">{t('Book consultation')}</Link>
          <button type="button" className="hdr__menu" aria-expanded={open} aria-label={t('Menu')} onClick={() => setOpen((v) => !v)}><span /><span /></button>
        </div>
      </div>
      <div className={`mnav ${open ? 'is-open' : ''}`}>
        {nav.map((n, i) => <Link key={n.to} to={n.to} style={{ transitionDelay: `${open ? 60 + i * 50 : 0}ms` }}>{t(n.label)}</Link>)}
        <CitySwitch />
        <Link to="/book" className="btn btn--plum">{t('Book consultation')}</Link>
      </div>
    </header>
  );
}
