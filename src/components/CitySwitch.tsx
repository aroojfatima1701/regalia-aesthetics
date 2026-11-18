import { useStore } from '../lib/store';
import { isAr, t } from '../lib/i18n';

export function CitySwitch({ light = false }: { light?: boolean }) {
  const { city, setCity } = useStore();
  return (
    <div className={`cswitch ${light ? 'cswitch--light' : ''}`} role="radiogroup" aria-label={t('Choose your clinic')}>
      <span className="cswitch__thumb" style={{ transform: city === 'nyc' ? `translateX(${isAr() ? '-100%' : '100%'})` : 'none' }} />
      <button type="button" role="radio" aria-checked={city === 'dxb'} onClick={() => setCity('dxb')}>{t('Dubai')}</button>
      <button type="button" role="radio" aria-checked={city === 'nyc'} onClick={() => setCity('nyc')}>{t('New York')}</button>
    </div>
  );
}
