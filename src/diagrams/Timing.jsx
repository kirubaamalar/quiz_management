// Timing diagrams (digital electronics). Each signal is a short wave code, like WaveDrom:
//   p = clock (rising edge)  n = clock (falling edge)  0 / 1 = low / high  . = same as before
//   x = unknown  z = high impedance  = = data value (labels come from the "data" field)
import { Label } from './svgParts';

export const timingDefaults = () => ({
  cw: 40,
  signals: [
    { name: 'CLK', wave: 'p.......', data: '' },
    { name: 'D', wave: '0.1..0.1', data: '' },
    { name: 'Q', wave: 'x.1..0.1', data: '' },
    { name: 'BUS', wave: 'x.=.=.x.', data: 'A5 3C' },
  ],
});

function expand(wave, labels) {
  const out = [];
  let di = 0;
  for (const c of String(wave || '')) {
    const prev = out[out.length - 1];
    if (c === '.' || c === '|') { if (prev) out.push({ ...prev, cont: true }); continue; }
    if (c === 'p' || c === 'P') out.push({ k: 'clk', pol: 1 });
    else if (c === 'n' || c === 'N') out.push({ k: 'clk', pol: 0 });
    else if (c === '1' || c === 'h' || c === 'H' || c === 'u') out.push({ k: 'lvl', v: 1 });
    else if (c === '0' || c === 'l' || c === 'L' || c === 'd') out.push({ k: 'lvl', v: 0 });
    else if (c === 'x') out.push({ k: 'x' });
    else if (c === 'z') out.push({ k: 'z' });
    else if (c === '=' || /[2-9]/.test(c)) out.push({ k: 'data', label: labels[di++] || '' });
  }
  return out;
}

export function TimingView({ data }) {
  const CW = Number(data.cw) || 40, RH = 44, HI = 8, LO = 30, MID = 19;
  const sigs = data.signals || [];
  const cycles = Math.max(1, ...sigs.map((s) => expand(s.wave, []).length));
  const W = cycles * CW;
  return (
    <svg className="dg timing" viewBox={`-80 -14 ${W + 100} ${sigs.length * RH + 20}`} role="img"
      style={{ maxWidth: (W + 100) * 1.2 }}>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        {Array.from({ length: cycles + 1 }, (_, i) => (
          <line key={i} x1={i * CW} y1={-8} x2={i * CW} y2={sigs.length * RH} strokeWidth="1" strokeDasharray="3 4" opacity="0.25" />
        ))}
        {sigs.map((s, r) => {
          const st = expand(s.wave, String(s.data || '').split(/[\s,]+/).filter(Boolean));
          const y0 = r * RH;
          const parts = [];
          let lastY = null;
          // runs of bus data / unknown are drawn as one shape
          for (let i = 0; i < st.length; i++) {
            const a = st[i], x0 = i * CW, x1 = x0 + CW;
            if (a.k === 'clk') {
              const xm = x0 + CW / 2;
              const [p, q] = a.pol ? [HI, LO] : [LO, HI];
              parts.push(<path key={i} d={`M${x0} ${y0 + (lastY ?? q)}V${y0 + p}H${xm}V${y0 + q}H${x1}`} />);
              lastY = q;
            } else if (a.k === 'lvl') {
              const y = a.v ? HI : LO;
              const d = lastY !== null && lastY !== y && !a.cont ? `M${x0} ${y0 + lastY}L${x0 + 4} ${y0 + y}H${x1}` : `M${x0} ${y0 + y}H${x1}`;
              parts.push(<path key={i} d={d} />);
              lastY = y;
            } else if (a.k === 'z') {
              parts.push(<path key={i} d={`M${x0} ${y0 + MID}H${x1}`} style={{ stroke: 'var(--steel)' }} />);
              lastY = MID;
            } else if (!a.cont) {
              let e = i + 1;
              while (e < st.length && st[e].cont && st[e].k === a.k) e++;
              const ex = e * CW;
              const shape = `M${x0} ${y0 + MID}L${x0 + 5} ${y0 + HI}H${ex - 5}L${ex} ${y0 + MID}L${ex - 5} ${y0 + LO}H${x0 + 5}Z`;
              parts.push(
                <g key={i}>
                  <path d={shape} style={a.k === 'x' ? { fill: 'currentColor', fillOpacity: 0.16 } : { fill: 'var(--fig-bg)' }} />
                  {a.k === 'data' && a.label && <Label x={(x0 + ex) / 2} y={y0 + MID} size={13} weight={600}>{a.label}</Label>}
                </g>
              );
              lastY = null;
            }
          }
          return (
            <g key={r}>
              <Label x={-12} y={y0 + MID} anchor="end" size={14} weight={600}>{s.name}</Label>
              {parts}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function TimingEditor({ value: d, onChange }) {
  const set = (k, x) => onChange({ ...d, [k]: x });
  const setSig = (i, ch) => set('signals', d.signals.map((s, k) => (k === i ? { ...s, ...ch } : s)));
  return (
    <div className="dg-form">
      <span className="lbl">Signals</span>
      {d.signals.map((s, i) => (
        <div className="row-edit" key={i}>
          <label>name <input className="inp sm-inp" value={s.name} onChange={(e) => setSig(i, { name: e.target.value })} /></label>
          <label>wave <input className="inp mono" style={{ minWidth: 160 }} value={s.wave} onChange={(e) => setSig(i, { wave: e.target.value })} /></label>
          <label>data <input className="inp sm-inp" value={s.data} placeholder="A5 3C" onChange={(e) => setSig(i, { data: e.target.value })} /></label>
          <button type="button" className="part-x" aria-label="Remove signal" onClick={() => set('signals', d.signals.filter((_, k) => k !== i))}>×</button>
        </div>
      ))}
      <div className="row" style={{ gap: 6 }}>
        <button type="button" className="btn sm" onClick={() => set('signals', [...d.signals, { name: 'S' + (d.signals.length + 1), wave: '0...1...', data: '' }])}>+ Signal</button>
        <label>cycle width <input className="inp sm-inp" type="number" min="20" max="80" value={d.cw} onChange={(e) => set('cw', e.target.value)} /></label>
      </div>
      <table className="tbl key-tbl">
        <thead><tr><th>Wave letter</th><th>Meaning (one letter = one clock cycle)</th></tr></thead>
        <tbody>
          <tr><td><kbd>p</kbd> <kbd>n</kbd></td><td>clock starting with a rising / falling edge</td></tr>
          <tr><td><kbd>0</kbd> <kbd>1</kbd></td><td>low / high</td></tr>
          <tr><td><kbd>.</kbd></td><td>same as the previous cycle</td></tr>
          <tr><td><kbd>x</kbd> <kbd>z</kbd></td><td>unknown (shaded) / high impedance</td></tr>
          <tr><td><kbd>=</kbd></td><td>a data value; values come from the data box, for example A5 3C</td></tr>
        </tbody>
      </table>
    </div>
  );
}
