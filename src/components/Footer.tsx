import { clinics } from '../lib/data';
import { Link } from '../lib/router';
import { logoSrc } from './Logo';
import { t } from '../lib/i18n';

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr__grid">
        <div className="ftr__brand">
          <img src={logoSrc.fullLight} alt="Regalia Aesthetics" width={190} height={187} />
          <p className="ftr__tag">{t('Beauty · Care · Confidence')}</p>
        </div>
        {(['dxb', 'nyc'] as const).map((c) => (
          <div key={c} className="ftr__col">
            <h3>{clinics[c].city}</h3>
            <p>{clinics[c].address}<br />{clinics[c].hoursLabel}<br /><span className="sel">{clinics[c].phone}</span></p>
          </div>
        ))}
        <div className="ftr__col">
          <h3>{t('Explore')}</h3>
          <nav className="ftr__links" aria-label={t('Footer')}>
            <Link to="/treatments">{t('Treatments')}</Link><Link to="/quiz">{t('Skin quiz')}</Link><Link to="/?s=membership">{t('Membership')}</Link><Link to="/?s=doctors">{t('Our doctors')}</Link><Link to="/book">{t('Book a consultation')}</Link><Link to="/admin">{t('Admin panel demo')}</Link>
          </nav>
        </div>
      </div>
      <div className="wrap ftr__base">
        <span>{t('© 2026 Regalia Aesthetics')}</span>
        <span>{t('Concept project by Arooj Fatima · sample doctors, prices and addresses · photography from Pexels · not medical advice')}</span>
      </div>
    </footer>
  );
}
