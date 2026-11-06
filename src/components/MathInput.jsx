import { useEffect, useRef } from 'react';
import { insertSnippet } from '../lib/mathlive';

/**
 * One visual formula box (MathLive). Staff type x^2, sqrt, pi, +- , / ... and it formats live.
 * value / onChange use LaTeX, but staff never see it.
 */
export default function MathInput({ value, onChange, onFocus, autoFocus, initialInsert, placeholder }) {
  const ref = useRef(null);
  const cb = useRef({});
  cb.current = { onChange, onFocus };

  useEffect(() => {
    const mf = ref.current;
    mf.mathVirtualKeyboardPolicy = 'auto'; // on-screen math keyboard on phones/tablets
    mf.value = value || '';
    const handleInput = () => cb.current.onChange(mf.value);
    const handleFocus = () => cb.current.onFocus && cb.current.onFocus(mf);
    mf.addEventListener('input', handleInput);
    mf.addEventListener('focusin', handleFocus);
    if (autoFocus) {
      requestAnimationFrame(() => {
        mf.focus();
        if (initialInsert) {
          insertSnippet(mf, initialInsert);
          cb.current.onChange(mf.value);
        }
      });
    }
    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('focusin', handleFocus);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the box in sync if the value is changed from outside.
  useEffect(() => {
    const mf = ref.current;
    if (mf && mf.value !== (value || '')) mf.value = value || '';
  }, [value]);

  return (
    <div className="mf-wrap">
      <math-field ref={ref} placeholder={placeholder}></math-field>
    </div>
  );
}
