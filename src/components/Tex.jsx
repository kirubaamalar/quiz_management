import { createElement, useEffect, useRef } from 'react';
import { typeset } from '../lib/mathjax';

/**
 * Renders text that contains LaTeX. Use $...$ for inline formulas and $$...$$ for a centred line.
 * Example: <Tex src="Find $\sqrt{x^2+1}$ when $x = 3$" />
 */
export default function Tex({ src, className = '', as = 'div' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = src || '';
    typeset(el);
  }, [src]);
  return createElement(as, { ref, className: 'tex ' + className });
}
