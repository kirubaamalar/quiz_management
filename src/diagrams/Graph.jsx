// Graphs from equations: y = f(x), several curves, marked points and plotted data.
// Saved data: { curves: [{expr, label, dashed}], v, xmin, xmax, ymin, ymax, xlabel, ylabel, grid, points, table }
import { useId, useMemo } from 'react';
import { compile } from 'mathjs';
import { Label, nf } from './svgParts';

const W = 560, H = 340, M = { l: 58, r: 20, t: 18, b: 48 };
const COLORS = ['var(--steel)', 'var(--bad)', 'var(--ok)', 'var(--flag)', 'currentColor'];
const num = (v) => (v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v));

export const graphDefaults = () => ({
  curves: [{ expr: '10*e^(-t/2)', label: 'v(t)', dashed: false }],
  v: 't', xmin: 0, xmax: 10, ymin: '', ymax: '', xlabel: 't (s)', ylabel: 'v (V)', grid: true,
  points: [{ x: 2, y: 3.68, label: 'τ' }], table: '', connect: true,
});

function niceStep(range, count = 6) {
  const raw = range / count, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
}
function ticks(a, b) {
  const st = niceStep(b - a), out = [];
  for (let v = Math.ceil(a / st) * st; v <= b + st * 1e-6; v += st) out.push(+v.toFixed(10));
  return out;
}
const cleanExpr = (e) => String(e || '').replace(/^\s*[a-zA-Z]\w*\s*(\([^)]*\))?\s*=\s*/, '');

export function parseTable(text) {
  return String(text || '').split('\n').map((l) => l.trim().split(/[\s,;\t]+/).map(Number))
    .filter((r) => r.length >= 2 && Number.isFinite(r[0]) && Number.isFinite(r[1]));
}

export function GraphView({ data: d }) {
  const clipId = useId().replace(/:/g, '');
  const xmin = num(d.xmin) ?? 0, xmax = num(d.xmax) ?? 10;
  const v = (d.v || 'x').trim() || 'x';
  const { series, errors } = useMemo(() => {
    const errs = [], out = [];
    (d.curves || []).forEach((c, i) => {
      if (!String(c.expr || '').trim()) return;
      try {
        const f = compile(cleanExpr(c.expr));
        const pts = [];
        for (let k = 0; k <= 400; k++) {
          const x = xmin + ((xmax - xmin) * k) / 400;
          let y;
          try { y = f.evaluate({ [v]: x }); y = typeof y === 'number' ? y : Number(y?.re ?? y); } catch { y = NaN; }
          pts.push([x, Number.isFinite(y) ? y : NaN]);
        }
        out.push({ ...c, pts, color: COLORS[i % COLORS.length] });
      } catch { errs.push(`Curve ${i + 1}: check the equation`); }
    });
    return { series: out, errors: errs };
  }, [JSON.stringify(d.curves), xmin, xmax, v]); // eslint-disable-line react-hooks/exhaustive-deps

  const tablePts = parseTable(d.table);
  const pts = (d.points || []).filter((p) => num(p.x) !== null && num(p.y) !== null);
  let ymin = num(d.ymin), ymax = num(d.ymax);
  if (ymin === null || ymax === null) {
    const ys = [...series.flatMap((s) => s.pts.map((p) => p[1])), ...tablePts.map((p) => p[1]), ...pts.map((p) => Number(p.y))].filter(Number.isFinite).sort((a, b) => a - b);
    if (ys.length) {
      const lo = ys[Math.floor(ys.length * 0.02)], hi = ys[Math.ceil(ys.length * 0.98) - 1];
      const pad = (hi - lo || 1) * 0.08;
      if (ymin === null) ymin = lo >= 0 && lo - pad < 0 ? 0 : lo - pad;
      if (ymax === null) ymax = hi + pad;
    } else { ymin = ymin ?? -1; ymax = ymax ?? 1; }
  }
  if (ymax <= ymin) ymax = ymin + 1;
  const pw = W - M.l - M.r, ph = H - M.t - M.b;
  const sx = (x) => M.l + ((x - xmin) / (xmax - xmin || 1)) * pw;
  const sy = (y) => M.t + ph - ((y - ymin) / (ymax - ymin)) * ph;
  const xt = ticks(xmin, xmax), yt = ticks(ymin, ymax);
  const jump = (ymax - ymin) * 3;
  const pathOf = (p) => {
    let dd = '', pen = false, prev = null;
    for (const [x, y] of p) {
      if (!Number.isFinite(y) || (prev !== null && Math.abs(y - prev) > jump)) { pen = false; prev = Number.isFinite(y) ? y : null; if (!Number.isFinite(y)) continue; }
      dd += `${pen ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`;
      pen = true; prev = y;
    }
    return dd;
  };
  const x0 = xmin <= 0 && xmax >= 0 ? sx(0) : null, y0 = ymin <= 0 && ymax >= 0 ? sy(0) : null;
  const legend = series.filter((s) => s.label);

  return (
    <div className="graph-wrap">
      <svg className="dg graph" viewBox={`0 0 ${W} ${H}`} role="img">
        <defs><clipPath id={clipId}><rect x={M.l} y={M.t} width={pw} height={ph} /></clipPath></defs>
        <g fill="none" stroke="currentColor">
          {d.grid !== false && <g strokeWidth="1" opacity="0.18">
            {xt.map((t) => <line key={'gx' + t} x1={sx(t)} y1={M.t} x2={sx(t)} y2={M.t + ph} />)}
            {yt.map((t) => <line key={'gy' + t} x1={M.l} y1={sy(t)} x2={M.l + pw} y2={sy(t)} />)}
          </g>}
          <rect x={M.l} y={M.t} width={pw} height={ph} strokeWidth="1.2" opacity="0.5" />
          {y0 !== null && <line x1={M.l} y1={y0} x2={M.l + pw} y2={y0} strokeWidth="1.6" />}
          {x0 !== null && <line x1={x0} y1={M.t} x2={x0} y2={M.t + ph} strokeWidth="1.6" />}
          {xt.map((t) => <Label key={'tx' + t} x={sx(t)} y={M.t + ph + 14} size={12}>{nf(t)}</Label>)}
          {yt.map((t) => <Label key={'ty' + t} x={M.l - 8} y={sy(t)} size={12} anchor="end">{nf(t)}</Label>)}
          {d.xlabel && <Label x={M.l + pw / 2} y={H - 10} size={14} italic>{d.xlabel}</Label>}
          {d.ylabel && <text x={0} y={0} transform={`translate(14 ${M.t + ph / 2}) rotate(-90)`} textAnchor="middle" dominantBaseline="central" fontSize="14" fontStyle="italic" fill="currentColor" stroke="none">{d.ylabel}</text>}
          <g clipPath={`url(#${clipId})`}>
            {series.map((s, i) => <path key={i} d={pathOf(s.pts)} style={{ stroke: s.color }} strokeWidth="2.6" strokeDasharray={s.dashed ? '8 6' : undefined} strokeLinejoin="round" />)}
            {tablePts.length > 0 && d.connect && <polyline points={tablePts.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} strokeWidth="1.8" />}
            {tablePts.map(([x, y], i) => <circle key={'tp' + i} cx={sx(x)} cy={sy(y)} r="4" fill="currentColor" stroke="none" />)}
          </g>
          {pts.map((p, i) => (
            <g key={'p' + i}>
              <line x1={sx(+p.x)} y1={sy(+p.y)} x2={sx(+p.x)} y2={M.t + ph} strokeDasharray="4 4" strokeWidth="1.2" opacity="0.7" />
              <line x1={sx(+p.x)} y1={sy(+p.y)} x2={M.l} y2={sy(+p.y)} strokeDasharray="4 4" strokeWidth="1.2" opacity="0.7" />
              <circle cx={sx(+p.x)} cy={sy(+p.y)} r="5" style={{ fill: 'var(--fig-bg)' }} strokeWidth="2" />
              {p.label && <Label x={sx(+p.x) + 9} y={sy(+p.y) - 12} anchor="start" size={13} weight={600}>{p.label}</Label>}
            </g>
          ))}
          {legend.length > 0 && (
            <g transform={`translate(${M.l + pw - 10} ${M.t + 12})`}>
              {legend.map((s, i) => (
                <g key={i} transform={`translate(0 ${i * 20})`}>
                  <line x1={-110} y1={0} x2={-88} y2={0} style={{ stroke: s.color }} strokeWidth="2.6" strokeDasharray={s.dashed ? '6 4' : undefined} />
                  <Label x={-82} y={0} anchor="start" size={13}>{s.label}</Label>
                </g>
              ))}
            </g>
          )}
        </g>
      </svg>
      {errors.length > 0 && <div className="dg-error">{errors.join('. ')}</div>}
    </div>
  );
}

export function GraphEditor({ value: d, onChange }) {
  const set = (k, x) => onChange({ ...d, [k]: x });
  const setCurve = (i, ch) => set('curves', d.curves.map((c, k) => (k === i ? { ...c, ...ch } : c)));
  const setPt = (i, ch) => set('points', d.points.map((c, k) => (k === i ? { ...c, ...ch } : c)));
  return (
    <div className="dg-form">
      <span className="lbl">Equations</span>
      {d.curves.map((c, i) => (
        <div className="row-edit" key={i}>
          <label>y = <input className="inp" style={{ minWidth: 200 }} value={c.expr} placeholder="e.g. 5*sin(2*pi*t)" onChange={(e) => setCurve(i, { expr: e.target.value })} /></label>
          <label>name <input className="inp sm-inp" value={c.label} onChange={(e) => setCurve(i, { label: e.target.value })} /></label>
          <label className="toggle"><input type="checkbox" checked={!!c.dashed} onChange={(e) => setCurve(i, { dashed: e.target.checked })} />Dashed</label>
          <button type="button" className="part-x" aria-label="Remove curve" onClick={() => set('curves', d.curves.filter((_, k) => k !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="btn sm" onClick={() => set('curves', [...d.curves, { expr: '', label: '', dashed: false }])}>+ Curve</button>
      <p className="hint">Write equations like a calculator: <code>3*x^2 - 2</code>, <code>sin(x)</code>, <code>e^(-t/2)</code>, <code>sqrt(x)</code>, <code>log(x)</code>.</p>

      <div className="form-grid">
        <div className="field"><label>Variable</label><input className="inp" value={d.v} onChange={(e) => set('v', e.target.value)} /></div>
        <div className="field"><label>From</label><input className="inp" type="number" step="any" value={d.xmin} onChange={(e) => set('xmin', e.target.value)} /></div>
        <div className="field"><label>To</label><input className="inp" type="number" step="any" value={d.xmax} onChange={(e) => set('xmax', e.target.value)} /></div>
        <div className="field"><label>y min (blank = auto)</label><input className="inp" type="number" step="any" value={d.ymin} onChange={(e) => set('ymin', e.target.value)} /></div>
        <div className="field"><label>y max (blank = auto)</label><input className="inp" type="number" step="any" value={d.ymax} onChange={(e) => set('ymax', e.target.value)} /></div>
        <div className="field"><label>Horizontal axis label</label><input className="inp" value={d.xlabel} onChange={(e) => set('xlabel', e.target.value)} /></div>
        <div className="field"><label>Vertical axis label</label><input className="inp" value={d.ylabel} onChange={(e) => set('ylabel', e.target.value)} /></div>
        <label className="toggle" style={{ alignSelf: 'end' }}><input type="checkbox" checked={d.grid !== false} onChange={(e) => set('grid', e.target.checked)} />Grid lines</label>
      </div>

      <span className="lbl">Marked points</span>
      {d.points.map((p, i) => (
        <div className="row-edit" key={i}>
          <label>x <input className="inp sm-inp" type="number" step="any" value={p.x} onChange={(e) => setPt(i, { x: e.target.value })} /></label>
          <label>y <input className="inp sm-inp" type="number" step="any" value={p.y} onChange={(e) => setPt(i, { y: e.target.value })} /></label>
          <label>label <input className="inp sm-inp" value={p.label} onChange={(e) => setPt(i, { label: e.target.value })} /></label>
          <button type="button" className="part-x" aria-label="Remove point" onClick={() => set('points', d.points.filter((_, k) => k !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="btn sm" onClick={() => set('points', [...d.points, { x: 0, y: 0, label: '' }])}>+ Point</button>

      <div className="field">
        <label>Plot data from readings (one “x, y” pair per line)</label>
        <textarea className="ta-text" rows={3} value={d.table} placeholder={'0, 0\n1, 2.1\n2, 3.9'} onChange={(e) => set('table', e.target.value)} />
        <label className="toggle"><input type="checkbox" checked={!!d.connect} onChange={(e) => set('connect', e.target.checked)} />Join the data points</label>
      </div>
    </div>
  );
}
