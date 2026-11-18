import { useEffect } from 'react';
import { StoreProvider } from './lib/store';
import { ContentProvider, useContent } from './lib/content';
import AdminApp from './admin/AdminApp';
import { SECTIONS, useRoute } from './lib/router';
import { treatmentById } from './lib/data';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import Home from './views/Home';
import Treatments from './views/Treatments';
import Treatment from './views/Treatment';
import Book from './views/Book';
import Quiz from './views/Quiz';
import { lang, setAdminMode, t, useLang } from './lib/i18n';

function Shell() {
  const route = useRoute();
  setAdminMode(route.startsWith('/admin'));
  useLang();
  useContent();
  const l = lang();
  useEffect(() => { document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; }, [l]);
  let view;
  let title = t('Regalia Aesthetics · Beauty, Care, Confidence');
  if (route === '/treatments') { view = <Treatments />; title = t('Treatments · Regalia Aesthetics'); }
  else if (route.startsWith('/treatment/')) { const id = route.slice(11); view = <Treatment id={id} />; title = `${treatmentById(id)?.name ?? t('Treatment')} · ${t('Regalia Aesthetics')}`; }
  else if (route === '/book') { view = <Book />; title = t('Book a consultation · Regalia Aesthetics'); }
  else if (route === '/quiz') { view = <Quiz />; title = t('Skin quiz · Regalia Aesthetics'); }
  else view = <Home />;
  useEffect(() => { document.title = route.startsWith('/admin') ? 'Admin · Regalia Aesthetics' : title; if (!SECTIONS.includes(window.location.hash.slice(1))) window.scrollTo(0, 0); }, [route, title]);
  if (route.startsWith('/admin')) return <AdminApp route={route} />;
  return (
    <>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('Skip to content')}</a>
      <div className="ribbon">{t('Concept project · sample doctors and prices')}</div>
      <Header route={route} />
      <main id="main" tabIndex={-1} key={`${route}${l}`} className="page-in">{view}</main>
      <Footer />
    </>
  );
}
export default function App() { return <ContentProvider><StoreProvider><Shell /></StoreProvider></ContentProvider>; }
