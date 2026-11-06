import { useMemo, useRef, useState } from 'react';
import { safeEval, fmt } from '../lib/calc';
import { cls } from '../lib/utils';

const KEYS = [
  ['sin(', 'sin('], ['cos(', 'cos('], ['tan(', 'tan('], ['√', 'sqrt('], ['^', '^'],
  ['ln', 'log('], ['log₁₀', 'log10('], ['π', 'pi'], ['e', 'e'], ['!', '!'],
  ['(', '('], [')', ')'], ['×10ⁿ', 'e'], ['ans', 'ans'], ['÷', '/'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['×', '*'], ['−', '-'],
  ['4', '4'], ['5', '5'], ['6', '6'], ['+', '+'], ['%', '/100'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['0', '0'], ['.', '.'],
];

export default function Calculator({ onClose }) {
  const [expr, setExpr] = useState('');
  const [deg, setDeg] = useState(true);
  const [hist, setHist] = useState([]);
  const ref = useRef(null);

  // In DEG mode, trig functions take and return degrees.
  const scope = useMemo(() => {
    const s = { ans: hist[0] ? hist[0].v : 0 };
    if (deg) {
      const r = (x) => (x * Math.PI) / 180;
      const d = (x) => (x * 180) / Math.PI;
      Object.assign(s, {
        sin: (x) => Math.sin(r(x)), cos: (x) => Math.cos(r(x)), tan: (x) => Math.tan(r(x)),
        asin: (x) => d(Math.asin(x)), acos: (x) => d(Math.acos(x)), atan: (x) => d(Math.atan(x)),
      });
    }
    return s;
  }, [deg, hist]);

  const live = safeEval(expr, scope);

  const add = (t) => {
    const el = ref.current;
    const s = el ? el.selectionStart : expr.length;
    const e = el ? el.selectionEnd : expr.length;
    setExpr(expr.slice(0, s) + t + expr.slice(e));
    requestAnimationFrame(() => {
      if (el) { el.focus(); el.setSelectionRange(s + t.length, s + t.length); }
    });
  };
  const run = () => {
    if (live == null) return;
    setHist((h) => [{ e: expr, v: live }, ...h].slice(0, 20));
    setExpr(fmt(live));
  };

  return (
    <div className="calc" role="dialog" aria-label="Scientific calculator">
      <div className="calc-head">
        <b>Calculator</b>
        <div className="row" style={{ gap: 6 }}>
          <button className="calc-x" style={{ width: 'auto', padding: '0 10px', fontSize: 13 }} onClick={() => setDeg(!deg)}>
            {deg ? 'DEG' : 'RAD'}
          </button>
          <button className="calc-x" aria-label="Close calculator" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="calc-screen">
        <input ref={ref} value={expr} autoFocus aria-label="Expression" placeholder="e.g. 1/(2*pi*sqrt(0.01*1e-6))"
          onChange={(e) => setExpr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} />
        <div className={cls('calc-res', expr && live == null && 'err')}>
          {!expr ? '0' : live == null ? 'Incomplete or invalid expression' : '= ' + fmt(live)}
        </div>
      </div>
      <div className="calc-keys">
        {KEYS.map(([label, text], i) => (
          <button key={i} className={cls('ck', /[÷×−+^]/.test(label) && 'op')} onClick={() => add(text)}>{label}</button>
        ))}
        <button className="ck op" onClick={() => setExpr(expr.slice(0, -1))}>⌫</button>
        <button className="ck op" onClick={() => setExpr('')}>C</button>
        <button className="ck eq" style={{ gridColumn: 'span 3' }} onClick={run}>=</button>
      </div>
      {hist.length > 0 && (
        <div className="calc-hist">
          {hist.map((h, i) => (
            <button key={i} onClick={() => setExpr(fmt(h.v))}><span>{h.e}</span><b>{fmt(h.v)}</b></button>
          ))}
        </div>
      )}
    </div>
  );
}
