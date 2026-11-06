// Truss: joints, members, supports and joint loads. A generator builds common trusses.
// Saved data: { joints: [{n, x, y}], members: 'A-B, B-C', supports: [{j, type}], loads: [{j, P, angle}], lu, fu, dims }
import { Arrow, AutoSvg, Dim, Label, SymbolShape, nf } from './svgParts';

const letters = (i) => (i < 26 ? String.fromCharCode(65 + i) : 'J' + (i + 1));
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

export function generateTruss(kind, panels, span, height) {
  const n = Math.max(1, Math.round(panels)), p = span / n;
  const joints = [], members = [];
  const add = (x, y) => { joints.push({ n: letters(joints.length), x: +x.toFixed(3), y: +y.toFixed(3) }); return joints.length - 1; };
  if (kind === 'Roof (king post)') {
    const a = add(0, 0), m = add(span / 2, 0), b = add(span, 0), t = add(span / 2, height);
    members.push([a, m], [m, b], [a, t], [t, b], [m, t]);
  }
  const B = kind === 'Roof (king post)' ? [] : Array.from({ length: n + 1 }, (_, i) => add(i * p, 0));
  for (let i = 0; i < B.length - 1; i++) members.push([B[i], B[i + 1]]);
  if (kind === 'Roof (king post)') {
    // done above
  } else if (kind === 'Warren') {
    const T = Array.from({ length: n }, (_, i) => add((i + 0.5) * p, height));
    for (let i = 0; i < n - 1; i++) members.push([T[i], T[i + 1]]);
    for (let i = 0; i < n; i++) members.push([B[i], T[i]], [T[i], B[i + 1]]);
  } else {
    const T = []; // Pratt or Howe: verticals at interior bottom joints
    for (let i = 1; i < n; i++) T[i] = add(i * p, height);
    if (n === 1) return generateTruss('Roof (king post)', 2, span, height);
    members.push([B[0], T[1]], [T[n - 1], B[n]]);
    for (let i = 1; i < n - 1; i++) members.push([T[i], T[i + 1]]);
    for (let i = 1; i < n; i++) members.push([B[i], T[i]]);
    for (let i = 1; i < n - 1; i++) {
      const left = i + 0.5 < n / 2;
      if (kind === 'Pratt') members.push(left ? [T[i], B[i + 1]] : [T[i + 1], B[i]]);
      else members.push(left ? [B[i], T[i + 1]] : [B[i + 1], T[i]]);
    }
  }
  const named = members.map(([a, b]) => joints[a].n + '-' + joints[b].n).join(', ');
  const last = joints.filter((j) => j.y === 0).sort((a, b) => b.x - a.x)[0];
  const tops = joints.filter((j) => j.y > 0);
  const mid = tops.sort((a, b) => Math.abs(a.x - span / 2) - Math.abs(b.x - span / 2))[0];
  return {
    joints, members: named,
    supports: [{ j: 'A', type: 'pin' }, { j: last.n, type: 'roller' }],
    loads: mid ? [{ j: mid.n, P: 10, angle: 90 }] : [],
  };
}

export const trussDefaults = () => ({ kind: 'Pratt', panels: 4, span: 12, height: 3, lu: 'm', fu: 'kN', dims: true, names: true, ...generateTruss('Pratt', 4, 12, 3) });

export function parseMembers(text, joints) {
  const names = new Set(joints.map((j) => j.n));
  return String(text || '').split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
    .map((s) => s.split(/\s*[-–]\s*/)).filter((p) => p.length === 2 && names.has(p[0]) && names.has(p[1]));
}

export function TrussView({ data }) {
  const joints = data.joints || [];
  if (!joints.length) return <div className="dg-empty">Add joints to draw the truss</div>;
  const xs = joints.map((j) => num(j.x)), ys = joints.map((j) => num(j.y));
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min(460 / Math.max(maxX - minX, 0.001), 230 / Math.max(maxY - minY, 0.001));
  const P = (j) => [(num(j.x) - minX) * s, -(num(j.y) - minY) * s];
  const byName = Object.fromEntries(joints.map((j) => [j.n, j]));
  const members = parseMembers(data.members, joints);
  const cx = ((maxX - minX) * s) / 2;
  const fu = data.fu || 'kN', lu = data.lu || 'm';
  return (
    <AutoSvg deps={[JSON.stringify(data)]}>
      {members.map(([a, b], i) => {
        const [x1, y1] = P(byName[a]), [x2, y2] = P(byName[b]);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={3} />;
      })}
      {(data.supports || []).filter((s2) => byName[s2.j]).map((sp, i) => {
        const [x, y] = P(byName[sp.j]);
        return <SymbolShape key={'s' + i} el={{ s: sp.type === 'roller' ? 'roller' : 'pin', x, y }} />;
      })}
      {(data.loads || []).filter((l) => byName[l.j]).map((l, i) => {
        const [x, y] = P(byName[l.j]);
        const a = (num(l.angle, 90) * Math.PI) / 180, len = 60;
        const tx = x - Math.cos(a) * len, ty = y - Math.sin(a) * len;
        return (
          <g key={'l' + i}>
            <Arrow x1={tx} y1={ty} x2={x - Math.cos(a) * 6} y2={y - Math.sin(a) * 6} width={2.4} head={11} />
            <Label x={tx} y={ty - 12} weight={600}>{nf(l.P)} {fu}</Label>
          </g>
        );
      })}
      {joints.map((j) => {
        const [x, y] = P(j);
        const above = num(j.y) > minY + 1e-9;
        const loaded = (data.loads || []).some((l) => l.j === j.n);
        const supported = (data.supports || []).some((sp) => sp.j === j.n);
        let lx = x + (x < cx - 1 ? -12 : x > cx + 1 ? 12 : loaded ? 14 : 0), ly = above ? y - 16 : y + 16;
        if (supported) { lx = x + (x <= cx ? -30 : 30); ly = y - 6; } // keep clear of the support symbol
        return (
          <g key={j.n}>
            <circle cx={x} cy={y} r={5} style={{ fill: 'var(--fig-bg)' }} />
            {data.names !== false && <Label x={lx} y={ly} italic weight={600}>{j.n}</Label>}
          </g>
        );
      })}
      {data.dims !== false && (() => {
        const bottom = joints.filter((j) => num(j.y) === minY).map((j) => (num(j.x) - minX) * s).sort((a, b) => a - b);
        const xsU = [...new Set(bottom)];
        const yDim = 70;
        return (
          <g>
            {xsU.slice(1).map((x, i) => <Dim key={i} x1={xsU[i]} x2={x} y={yDim} text={`${nf((x - xsU[i]) / s)} ${lu}`} />)}
            {maxY > minY && (
              <g strokeWidth={1.2}>
                <line x1={(maxX - minX) * s + 66} y1={0} x2={(maxX - minX) * s + 66} y2={-(maxY - minY) * s} />
                <path d={`M${(maxX - minX) * s + 60} 0h12M${(maxX - minX) * s + 60} ${-(maxY - minY) * s}h12`} />
                <Label x={(maxX - minX) * s + 76} y={-((maxY - minY) * s) / 2} anchor="start" size={13}>{nf(maxY - minY)} {lu}</Label>
              </g>
            )}
          </g>
        );
      })()}
    </AutoSvg>
  );
}

export function TrussEditor({ value: v, onChange }) {
  const set = (k, x) => onChange({ ...v, [k]: x });
  const regen = (ch) => {
    const nv = { ...v, ...ch };
    onChange({ ...nv, ...generateTruss(nv.kind, num(nv.panels, 4), num(nv.span, 12), num(nv.height, 3)) });
  };
  const setJoint = (i, ch) => set('joints', v.joints.map((j, k) => (k === i ? { ...j, ...ch } : j)));
  const names = v.joints.map((j) => j.n);
  return (
    <div className="dg-form">
      <span className="lbl">Quick start: generate a truss</span>
      <div className="form-grid">
        <div className="field"><label>Type</label>
          <select className="sel" value={v.kind} onChange={(e) => regen({ kind: e.target.value })}>
            {['Pratt', 'Howe', 'Warren', 'Roof (king post)'].map((k) => <option key={k}>{k}</option>)}
          </select></div>
        <div className="field"><label>Panels</label><input className="inp" type="number" min="1" max="12" value={v.panels} onChange={(e) => regen({ panels: e.target.value })} /></div>
        <div className="field"><label>Span ({v.lu})</label><input className="inp" type="number" step="any" value={v.span} onChange={(e) => regen({ span: e.target.value })} /></div>
        <div className="field"><label>Height ({v.lu})</label><input className="inp" type="number" step="any" value={v.height} onChange={(e) => regen({ height: e.target.value })} /></div>
      </div>
      <p className="hint">Changing these rebuilds the truss. Then fine-tune the joints, members, supports and loads below.</p>

      <details className="dg-details">
        <summary>Joints ({v.joints.length})</summary>
        {v.joints.map((j, i) => (
          <div className="row-edit" key={i}>
            <label>name <input className="inp sm-inp" value={j.n} onChange={(e) => setJoint(i, { n: e.target.value })} /></label>
            <label>x <input className="inp sm-inp" type="number" step="any" value={j.x} onChange={(e) => setJoint(i, { x: e.target.value })} /></label>
            <label>y <input className="inp sm-inp" type="number" step="any" value={j.y} onChange={(e) => setJoint(i, { y: e.target.value })} /></label>
            <button type="button" className="part-x" aria-label="Remove joint" onClick={() => set('joints', v.joints.filter((_, k) => k !== i))}>×</button>
          </div>
        ))}
        <button type="button" className="btn sm" onClick={() => set('joints', [...v.joints, { n: letters(v.joints.length), x: 0, y: 0 }])}>+ Joint</button>
      </details>

      <div className="field">
        <label>Members (pairs of joints)</label>
        <textarea className="ta-text" rows={2} value={v.members} onChange={(e) => set('members', e.target.value)} placeholder="A-B, B-C, A-C" />
      </div>

      <span className="lbl">Supports</span>
      {v.supports.map((sp, i) => (
        <div className="row-edit" key={i}>
          <select className="sel" value={sp.j} onChange={(e) => set('supports', v.supports.map((x, k) => (k === i ? { ...x, j: e.target.value } : x)))}>
            {names.map((nm) => <option key={nm}>{nm}</option>)}
          </select>
          <select className="sel" value={sp.type} onChange={(e) => set('supports', v.supports.map((x, k) => (k === i ? { ...x, type: e.target.value } : x)))}>
            <option value="pin">Pin</option><option value="roller">Roller</option>
          </select>
          <button type="button" className="part-x" aria-label="Remove support" onClick={() => set('supports', v.supports.filter((_, k) => k !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="btn sm" onClick={() => set('supports', [...v.supports, { j: names[0], type: 'roller' }])}>+ Support</button>

      <span className="lbl">Loads at joints</span>
      {v.loads.map((l, i) => (
        <div className="row-edit" key={i}>
          <select className="sel" value={l.j} onChange={(e) => set('loads', v.loads.map((x, k) => (k === i ? { ...x, j: e.target.value } : x)))}>
            {names.map((nm) => <option key={nm}>{nm}</option>)}
          </select>
          <label>load <input className="inp sm-inp" type="number" step="any" value={l.P} onChange={(e) => set('loads', v.loads.map((x, k) => (k === i ? { ...x, P: e.target.value } : x)))} /> {v.fu}</label>
          <label>angle <input className="inp sm-inp" type="number" step="any" value={l.angle} onChange={(e) => set('loads', v.loads.map((x, k) => (k === i ? { ...x, angle: e.target.value } : x)))} />°</label>
          <button type="button" className="part-x" aria-label="Remove load" onClick={() => set('loads', v.loads.filter((_, k) => k !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="btn sm" onClick={() => set('loads', [...v.loads, { j: names[names.length - 1], P: 10, angle: 90 }])}>+ Load</button>

      <div className="row" style={{ gap: 18 }}>
        <div className="field"><label>Length unit</label><input className="inp sm-inp" value={v.lu} onChange={(e) => set('lu', e.target.value)} /></div>
        <div className="field"><label>Force unit</label><input className="inp sm-inp" value={v.fu} onChange={(e) => set('fu', e.target.value)} /></div>
        <label className="toggle"><input type="checkbox" checked={v.dims !== false} onChange={(e) => set('dims', e.target.checked)} />Dimensions</label>
        <label className="toggle"><input type="checkbox" checked={v.names !== false} onChange={(e) => set('names', e.target.checked)} />Joint names</label>
      </div>
      <p className="hint">Angle 90° = straight down, 0° = pushing to the right.</p>
    </div>
  );
}
