import { useEffect, useState } from 'react';
import { VIEWS } from '../components/Header';

/** Simple hash routing: #home, #studio, #bank, #quiz */
export default function useHashView() {
  const get = () => {
    const h = window.location.hash.replace('#', '');
    return VIEWS[h] ? h : 'home';
  };
  const [view, setView] = useState(get);
  useEffect(() => {
    const onChange = () => { setView(get()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const go = (v) => {
    if (window.location.hash !== '#' + v) window.location.hash = v;
    else setView(v);
  };
  return [view, go];
}
