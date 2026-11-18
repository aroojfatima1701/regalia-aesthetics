import { useEffect, useState, type ReactNode } from 'react';
import { useContent } from '../lib/content';
import { useStore } from '../lib/store';
import { Link } from '../lib/router';
import { logoSrc } from '../components/Logo';
import { ToastProvider, useToast } from './ui';
import { adminLang, setAdminLang, t } from '../lib/i18n';
import Dashboard from './Dashboard';
import Appointments from './Appointments';
import TreatmentsAdmin from './TreatmentsAdmin';
import DoctorsAdmin from './DoctorsAdmin';
import { ClinicsAdmin, MembershipsAdmin, WebsiteAdmin } from './Settings';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: 'M4 13h6V4H4zm10 7h6v-9h-6zM4 20h6v-5H4zm10-11h6V4h-6z' },
  { to: '/admin-appointments', label: 'Appointments', icon: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 12h3v3H8z' },
  { to: '/admin-treatments', label: 'Treatments', icon: 'M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z' },
  { to: '/admin-doctors', label: 'Doctors', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4 4-6 8-6s7 2 8 6' },
  { to: '/admin-memberships', label: 'Memberships', icon: 'M4 7h16v10H4zM4 11h16M8 15h3' },
  { to: '/admin-clinics', label: 'Clinics', icon: 'M4 21V9l8-5 8 5v12M9 21v-6h6v6' },
  { to: '/admin-website', label: 'Website content', icon: 'M4 5h16v14H4zM4 9h16M8 13h8M8 16h5' },
];

function Shell({ route }: { route: string }) {
  const { reset } = useContent();
  const { bookings, resetBookings } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [route]);
  const requests = bookings.filter((b) => b.status === 'requested').length;
  const ar = adminLang() === 'ar';
  let view: ReactNode;
  switch (route) {
    case '/admin-appointments': view = <Appointments />; break;
    case '/admin-treatments': view = <TreatmentsAdmin />; break;
    case '/admin-doctors': view = <DoctorsAdmin />; break;
    case '/admin-memberships': view = <MembershipsAdmin />; break;
    case '/admin-clinics': view = <ClinicsAdmin />; break;
    case '/admin-website': view = <WebsiteAdmin />; break;
    default: view = <Dashboard />;
  }
  return (
    <div className="ad">
      <aside className={`ad-side ${open ? 'is-open' : ''}`}>
        <Link to="/admin" className="ad-side__brand"><img src={logoSrc.iconLight} alt="" width={30} height={54} /><span><img src={logoSrc.wordmarkLight} alt="Regalia Aesthetics" width={140} height={30} /><small>{t('Clinic admin')}</small></span></Link>
        <nav aria-label={t('Admin')}>
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={`ad-side__link ${route === n.to ? 'is-on' : ''}`} aria-current={route === n.to ? 'page' : undefined}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.icon} /></svg>
              {t(n.label)}
              {n.to === '/admin-appointments' && requests > 0 && <span className="ad-side__badge">{requests}</span>}
            </Link>
          ))}
        </nav>
        <div className="ad-side__foot">
          {confirm ? (
            <div className="ad-side__confirm"><span>{t('Reset every change to the sample data?')}</span><button type="button" onClick={() => { reset(); resetBookings(); setConfirm(false); toast('Demo data reset'); }}>{t('Reset')}</button><button type="button" onClick={() => setConfirm(false)}>{t('Keep')}</button></div>
          ) : <button type="button" className="ad-side__reset" onClick={() => setConfirm(true)}>{t('Reset demo data')}</button>}
          <Link to="/" className="ad-side__site">{t('← View the website')}</Link>
        </div>
      </aside>
      {open && <button type="button" className="ad-side__scrim" aria-label={t('Close menu')} onClick={() => setOpen(false)} />}
      <div className="ad-main">
        <div className="ad-top">
          <button type="button" className="ad-top__menu" onClick={() => setOpen(true)} aria-label={t('Open admin menu')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
          <p>{t('Concept admin panel · sample data · changes are saved in this browser and show on the website instantly')}</p>
          <button type="button" className="langsw ad-lang" lang={ar ? 'en' : 'ar'} onClick={() => setAdminLang(ar ? 'en' : 'ar')} aria-label={ar ? 'Show the admin panel in English' : 'عرض لوحة الإدارة بالعربية'}>{ar ? 'English' : 'عربي'}</button>
          <span className="ad-top__user"><span aria-hidden="true">RA</span>{t('Clinic manager')}</span>
        </div>
        <div className="ad-content" key={route}>{view}</div>
      </div>
    </div>
  );
}

export default function AdminApp({ route }: { route: string }) {
  return <ToastProvider><Shell route={route} /></ToastProvider>;
}
