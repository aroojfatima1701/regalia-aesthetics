import { useEffect, useState, type AnchorHTMLAttributes } from 'react';

// Hash router for the preview: #treatments, #treatment-<id>, #book, #quiz, and home sections
// (#concerns, #membership, #doctors, #clinics). In the Next.js project each route is
// app/<route>/page.tsx and Link comes from next/link.
const ROUTES = ['treatments', 'book', 'quiz', 'admin', 'admin-appointments', 'admin-treatments', 'admin-doctors', 'admin-memberships', 'admin-clinics', 'admin-website'];
export const SECTIONS = ['concerns', 'signature', 'membership', 'doctors', 'clinics'];

function current(): string {
  const name = window.location.hash.replace(/^#/, '');
  if (name.startsWith('treatment-')) return `/treatment/${name.slice(10)}`;
  return ROUTES.includes(name) ? `/${name}` : '/';
}
export function toHash(path: string): string {
  if (path.startsWith('/?s=')) return `#${path.slice(4)}`;
  if (path === '/') return '#home';
  if (path.startsWith('/treatment/')) return `#treatment-${path.slice(11)}`;
  return `#${path.replace(/^\//, '')}`;
}
export function useRoute(): string {
  const [route, setRoute] = useState('/');
  useEffect(() => {
    const read = () => setRoute(current());
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  return route;
}
export function go(path: string) { window.location.hash = toHash(path); }
export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={toHash(to)} {...rest} />;
}
