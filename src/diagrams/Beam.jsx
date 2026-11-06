// Beam template: span, supports and loads -> drawn to scale with dimensions.
// Saved data: { L, lu, fu, supports: [{type, x, name}], loads: [{type, ...}], dims }
import { Arrow, AutoSvg, Dim, Label, SymbolShape, nf } from './svgParts';
import { uid } from '../lib/utils';

const BW = 440; // beam length in pixels (keeps labels readable at normal sizes)
const n = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

export const beamDefaults = () => ({
  L: 6, lu: 'm', fu: 'kN', dims: true,
  supports: [{ id: uid(), type: 'pin', x: 0, name: 'A' }, { id: uid(), type: 'roller', x: 6, name: 'B' }],
  loads: [{ id: uid(), type: 'point', x: 2, P: 12, angle: 90 }, { id: uid(), type: 'udl', x1: 3, x2: 6, w: 4 }],
});

const PRESETS = {
  'Simply supported, central load': () => ({
    ...beamDefaults(), L: 4, supports: [{ id: uid(), type: 'pin', x: 0, name: 'A' }, { id: uid(), type: 'roller', x: 4, name: 'B' }],
    loads: [{ id: uid(), type: 'point', x: 2, P: 20, angle: 90 }],
  }),
  'Cantilever with UDL': () => ({
    ...beamDefaults(), L: 3, supports: [{ id: uid(), type: 'fixed', x: 0, name: 'A' }],
    loads: [{ id: uid(), type: 'udl', x1: 0, x2: 3, w: 5 }],
  }),
  'Overhanging beam': () => ({
    ...beamDefaults(), L: 8, supports: [{ id: uid(), type: 'pin', x: 0, name: 'A' }, { id: uid(), type: 'roller', x: 6, name: 'B' }],
    loads: [{ id: uid(), type: 'udl', x1: 0, x2: 6, w: 2 }, { id: uid(), type: 'point', x: 8, P: 10, angle: 90 }],
  }),
  'Triangular load (UVL)': () => ({
    ...beamDefaults(), L: 6, supports: [{ id: uid(), type: 'pin', x: 0, name: 'A' }, { id: uid(), type: 'roller', x: 6, name: 'B' }],
    loads: [{ id: uid(), type: 'uvl', x1: 0, x2: 6, w1: 0, w2: 9 }],
  }),
  'Point load and moment': () => ({
    ...beamDefaults(), L: 5, supports: [{ id: uid(), type: 'pin', x: 0, name: 'A' }, { id: uid(), type: 'roller', x: 5, name: 'B' }],
    loads: [{ id: uid(), type: 'point', x: 1.5, P: 8, angle: 90 }, { id: uid(), type: 'moment', x: 3.5, M: 6, dir: 'cw' }],
  }),
};

export function BeamView({ data }) {
  const L = Math.max(n(data.L, 1), 0.001);
  const s = BW / L;
  const X = (x) => Math.min(Math.max(n(x), 0), L) * s;
  const fu = data.fu || 'kN', lu = data.lu || 'm';
  const loads = data.loads || [], sups = data.supports || [];
  const maxW = Math.max(1e-9, ...loads.flatMap((l) => (l.type === 'udl' ? [Math.abs(n(l.w))] : l.type === 'uvl' ? [Math.abs(n(l.w1)), Math.abs(n(l.w2))] : [])));

  const keyXs = [...new Set([0, L, ...sups.map((p) => n(p.x)), ...loads.flatMap((l) =>
    l.type === 'udl' || l.type === 'uvl' ? [n(l.x1), n(l.x2)] : [n(l.x)])].map((v) => Math.min(Math.max(v, 0), L)))].sort((a, b) => a - b);

  return (
    <AutoSvg deps={[JSON.stringify(data)]}>
      {/* beam */}
      <rect x={0} y={0} width={BW} height={12} style={{ fill: 'var(--fig-beam)' }} />
      {/* supports */}
      {sups.map((p) => {
        const x = X(p.x);
        if (p.type === 'fixed') {
          const atEnd = n(p.x) >= L / 2;
          return (
            <g key={p.id}>
              <SymbolShape el={{ s: 'fixed', x: atEnd ? x : x, y: 6, rot: atEnd ? 180 : 0 }} />
              {p.name && <Label x={atEnd ? x + 20 : x - 20} y={52}>{p.name}</Label>}
            </g>
          );
        }
        return (
          <g key={p.id}>
            <SymbolShape el={{ s: p.type === 'roller' ? 'roller' : 'pin', x, y: 12 }} />
            {p.name && <Label x={x} y={p.type === 'roller' ? 58 : 50}>{p.name}</Label>}
          </g>
        );
      })}
      {/* loads */}
      {loads.map((l) => {
        if (l.type === 'point') {
          const x = X(l.x), a = ((n(l.angle, 90)) * Math.PI) / 180, len = 70;
          const P = n(l.P);
          const down = P >= 0;
          // tip touches the beam top (downward) or bottom (upward)
          const tipY = down ? -2 : 14;
          const tailY = down ? -2 - len * Math.sin(a) : 14 + len * Math.sin(a);
          const tailX = x - Math.cos(a) * len;
          return (
            <g key={l.id}>
              <Arrow x1={tailX} y1={tailY} x2={x} y2={tipY} width={2.4} head={12} />
              <Label x={tailX} y={down ? tailY - 14 : tailY + 14} weight={600}>{nf(Math.abs(P))} {fu}</Label>
            </g>
          );
        }
        if (l.type === 'udl' || l.type === 'uvl') {
          const x1 = X(Math.min(n(l.x1), n(l.x2))), x2 = X(Math.max(n(l.x1), n(l.x2)));
          const w1 = l.type === 'udl' ? n(l.w) : n(l.w1), w2 = l.type === 'udl' ? n(l.w) : n(l.w2);
          const h = (w) => 12 + (Math.abs(w) / maxW) * 38;
          const count = Math.max(2, Math.round((x2 - x1) / 24) + 1);
          const arrows = Array.from({ length: count }, (_, i) => {
            const t = i / (count - 1), x = x1 + (x2 - x1) * t;
            return { x, h: h(w1 + (w2 - w1) * t) };
          });
          return (
            <g key={l.id}>
              <path d={`M${x1} ${-2 - h(w1)}L${x2} ${-2 - h(w2)}`} strokeWidth={2} />
              {arrows.map((ar, i) => ar.h > 13 && <Arrow key={i} x1={ar.x} y1={-2 - ar.h} x2={ar.x} y2={-2} head={7} width={1.6} />)}
              {l.type === 'udl'
                ? <Label x={(x1 + x2) / 2} y={-2 - h(w1) - 14} weight={600}>{nf(w1)} {fu}/{lu}</Label>
                : <>
                  {Math.abs(w1) > 0 && <Label x={x1} y={-2 - h(w1) - 14} weight={600}>{nf(w1)} {fu}/{lu}</Label>}
                  {Math.abs(w2) > 0 && <Label x={x2} y={-2 - h(w2) - 14} weight={600}>{nf(w2)} {fu}/{lu}</Label>}
                </>}
            </g>
          );
        }
        if (l.type === 'moment') {
          const x = X(l.x), cw = l.dir !== 'ccw';
          const r = 22;
          // arc above the beam with an arrow head
          const d = cw ? `M${x - r} ${6}A${r} ${r} 0 1 1 ${x + r} ${6}` : `M${x + r} ${6}A${r} ${r} 0 1 0 ${x - r} ${6}`;
          const hx = cw ? x + r : x - r;
          return (
            <g key={l.id}>
              <path d={d} strokeWidth={2.2} />
              <path d={`M${hx} ${12} l-6 -10 h12 Z`} fill="currentColor" stroke="none" />
              <Label x={x} y={-r - 14} weight={600}>{nf(n(l.M))} {fu}·{lu}</Label>
            </g>
          );
        }
        return null;
      })}
      {/* dimensions */}
      {data.dims !== false && keyXs.slice(1).map((x, i) => (
        <Dim key={i} x1={X(keyXs[i])} x2={X(x)} y={84} text={`${nf(x - keyXs[i])} ${lu}`} />
      ))}
    </AutoSvg>
  );
}

const LOAD_FIELDS = {
  point: [['x', 'Position'], ['P', 'Load'], ['angle', 'Angle (°)']],
  udl: [['x1', 'From'], ['x2', 'To'], ['w', 'Intensity']],
  uvl: [['x1', 'From'], ['x2', 'To'], ['w1', 'Start w'], ['w2', 'End w']],
  moment: [['x', 'Position'], ['M', 'Moment']],
};
const LOAD_NAMES = { point: 'Point load', udl: 'UDL', uvl: 'UVL (varying)', moment: 'Moment' };
const NEW_LOAD = {
  point: (L) => ({ type: 'point', x: L / 2, P: 10, angle: 90 }),
  udl: (L) => ({ type: 'udl', x1: 0, x2: L, w: 5 }),
  uvl: (L) => ({ type: 'uvl', x1: 0, x2: L, w1: 0, w2: 6 }),
  moment: (L) => ({ type: 'moment', x: L / 2, M: 10, dir: 'cw' }),
};

export function BeamEditor({ value: v, onChange }) {
  const set = (k, x) => onChange({ ...v, [k]: x });
  const setSup = (i, ch) => set('supports', v.supports.map((s, k) => (k === i ? { ...s, ...ch } : s)));
  const setLoad = (i, ch) => set('loads', v.loads.map((s, k) => (k === i ? { ...s, ...ch } : s)));
  const num = (x) => (x === '' || x === '-' ? x : Number(x));
  return (
    <div className="dg-form">
      <div className="field">
        <span className="lbl">Start from an example</span>
        <div className="tpl-grid">
          {Object.entries(PRESETS).map(([name, make]) => <button key={name} type="button" className="tpl-btn" onClick={() => onChange(make())}>{name}</button>)}
        </div>
      </div>
      <div className="form-grid">
        <div className="field"><label>Span length</label><input className="inp" type="number" step="any" value={v.L} onChange={(e) => set('L', num(e.target.value))} /></div>
        <div className="field"><label>Length unit</label><input className="inp" value={v.lu} onChange={(e) => set('lu', e.target.value)} /></div>
        <div className="field"><label>Force unit</label><input className="inp" value={v.fu} onChange={(e) => set('fu', e.target.value)} /></div>
        <label className="toggle" style={{ alignSelf: 'end' }}><input type="checkbox" checked={v.dims !== false} onChange={(e) => set('dims', e.target.checked)} />Show dimensions</label>
      </div>

      <span className="lbl">Supports</span>
      {v.supports.map((s, i) => (
        <div className="row-edit" key={s.id}>
          <select className="sel" value={s.type} onChange={(e) => setSup(i, { type: e.target.value })}>
            <option value="pin">Pin (hinged)</option><option value="roller">Roller</option><option value="fixed">Fixed</option>
          </select>
          <label>at <input className="inp sm-inp" type="number" step="any" value={s.x} onChange={(e) => setSup(i, { x: num(e.target.value) })} /> {v.lu}</label>
          <label>name <input className="inp sm-inp" value={s.name} onChange={(e) => setSup(i, { name: e.target.value })} /></label>
          <button type="button" className="part-x" aria-label="Remove support" onClick={() => set('supports', v.supports.filter((_, k) => k !== i))}>×</button>
        </div>
      ))}
      <div className="row" style={{ gap: 6 }}>
        <button type="button" className="btn sm" onClick={() => set('supports', [...v.supports, { id: uid(), type: 'roller', x: v.L, name: String.fromCharCode(65 + v.supports.length) }])}>+ Support</button>
      </div>

      <span className="lbl">Loads</span>
      {v.loads.map((l, i) => (
        <div className="row-edit" key={l.id}>
          <b className="row-tag">{LOAD_NAMES[l.type]}</b>
          {LOAD_FIELDS[l.type].map(([k, label]) => (
            <label key={k}>{label} <input className="inp sm-inp" type="number" step="any" value={l[k]} onChange={(e) => setLoad(i, { [k]: num(e.target.value) })} /></label>
          ))}
          {l.type === 'moment' && (
            <select className="sel" style={{ width: 'auto' }} value={l.dir} onChange={(e) => setLoad(i, { dir: e.target.value })}>
              <option value="cw">Clockwise</option><option value="ccw">Anticlockwise</option>
            </select>
          )}
          <button type="button" className="part-x" aria-label="Remove load" onClick={() => set('loads', v.loads.filter((_, k) => k !== i))}>×</button>
        </div>
      ))}
      <div className="row" style={{ gap: 6 }}>
        {Object.keys(NEW_LOAD).map((k) => (
          <button key={k} type="button" className="btn sm" onClick={() => set('loads', [...v.loads, { id: uid(), ...NEW_LOAD[k](n(v.L, 1)) }])}>+ {LOAD_NAMES[k]}</button>
        ))}
      </div>
      <p className="hint">Positions are measured from the left end. A negative point load points upward. Angle 90° means straight down.</p>
    </div>
  );
}
