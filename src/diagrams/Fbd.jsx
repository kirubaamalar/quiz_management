// Free-body diagrams: ready-made scenes (block on incline, block on floor, hanging mass) with selectable forces.
import { Arrow, AutoSvg, Label } from './svgParts';

const rad = (d) => (d * Math.PI) / 180;
const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);

const SCENES = {
  incline: { name: 'Block on an incline', forces: ['W', 'N', 'f', 'P'] },
  floor: { name: 'Block on a floor', forces: ['W', 'N', 'f', 'P'] },
  hanging: { name: 'Hanging mass (two strings)', forces: ['T1', 'T2', 'W'] },
};
const FORCE_NAMES = { W: 'Weight', N: 'Normal reaction', f: 'Friction', P: 'Applied force', T1: 'Tension 1', T2: 'Tension 2' };

export const fbdDefaults = () => ({
  scene: 'incline', angle: 30, pAngle: 0, angle2: 45, mass: 'm', showAngle: true, fdir: 'up',
  show: { W: true, N: true, f: true, P: false, T1: true, T2: true },
  labels: { W: 'mg', N: 'N', f: 'f', P: 'P', T1: 'T₁', T2: 'T₂' },
});

function Hatch({ x1, x2, y, up }) {
  const lines = [];
  for (let x = x1 + 6; x < x2; x += 12) lines.push(<line key={x} x1={x} y1={y} x2={x - 7} y2={up ? y - 8 : y + 8} strokeWidth={1.2} />);
  return <g>{lines}</g>;
}

export function FbdView({ data: d }) {
  const lab = (k) => d.labels?.[k] ?? k;
  const on = (k) => d.show?.[k] !== false;
  if (d.scene === 'hanging') {
    const a1 = rad(num(d.angle, 30)), a2 = rad(num(d.angle2, 45));
    const K = [0, 130];
    const len1 = 130 / Math.sin(a1), len2 = 130 / Math.sin(a2);
    const A = [K[0] - Math.cos(a1) * len1, 0], B = [K[0] + Math.cos(a2) * len2, 0];
    const x1 = Math.min(A[0], -60) - 30, x2 = Math.max(B[0], 60) + 30;
    return (
      <AutoSvg deps={[JSON.stringify(d)]}>
        <line x1={x1} y1={0} x2={x2} y2={0} /><Hatch x1={x1} x2={x2} y={0} up />
        <line x1={A[0]} y1={A[1]} x2={K[0]} y2={K[1]} /><line x1={B[0]} y1={B[1]} x2={K[0]} y2={K[1]} />
        <line x1={K[0]} y1={K[1]} x2={K[0]} y2={K[1] + 60} />
        <rect x={-28} y={K[1] + 60} width={56} height={44} style={{ fill: 'var(--fig-bg)' }} />
        <Label x={0} y={K[1] + 82} italic>{d.mass}</Label>
        <circle cx={K[0]} cy={K[1]} r={3.5} fill="currentColor" />
        {d.showAngle && <>
          <path d={`M${A[0] + 40} 0A40 40 0 0 1 ${A[0] + 40 * Math.cos(a1)} ${40 * Math.sin(a1)}`} strokeWidth={1.4} />
          <Label x={A[0] + 54} y={16} size={13}>{num(d.angle, 30)}°</Label>
          <path d={`M${B[0] - 40} 0A40 40 0 0 0 ${B[0] - 40 * Math.cos(a2)} ${40 * Math.sin(a2)}`} strokeWidth={1.4} />
          <Label x={B[0] - 54} y={16} size={13}>{num(d.angle2, 45)}°</Label>
        </>}
        {on('T1') && <><Arrow x1={K[0]} y1={K[1]} x2={K[0] - Math.cos(a1) * 70} y2={K[1] - Math.sin(a1) * 70} width={2.8} />
          <Label x={K[0] - Math.cos(a1) * 70 - 16} y={K[1] - Math.sin(a1) * 70 + 10} weight={700}>{lab('T1')}</Label></>}
        {on('T2') && <><Arrow x1={K[0]} y1={K[1]} x2={K[0] + Math.cos(a2) * 70} y2={K[1] - Math.sin(a2) * 70} width={2.8} />
          <Label x={K[0] + Math.cos(a2) * 70 + 16} y={K[1] - Math.sin(a2) * 70 + 10} weight={700}>{lab('T2')}</Label></>}
        {on('W') && <><Arrow x1={K[0] + 46} y1={K[1] + 82} x2={K[0] + 46} y2={K[1] + 150} width={2.8} />
          <Label x={K[0] + 58} y={K[1] + 150} anchor="start" weight={700}>{lab('W')}</Label></>}
      </AutoSvg>
    );
  }

  const isInc = d.scene !== 'floor';
  const th = isInc ? rad(Math.min(Math.max(num(d.angle, 30), 5), 70)) : 0;
  const base = isInc ? Math.min(340, 200 / Math.tan(th)) : 360;
  const h = isInc ? base * Math.tan(th) : 0;
  const u = [Math.cos(th), -Math.sin(th)], nrm = [-Math.sin(th), -Math.cos(th)];
  const t = isInc ? 0.55 : 0.5;
  const S = [base * t * 1, -h * t];
  const C = [S[0] + nrm[0] * 22, S[1] + nrm[1] * 22];
  const deg = (-th * 180) / Math.PI;
  const F = (dir, len) => [C[0] + dir[0] * len, C[1] + dir[1] * len];
  const fSign = d.fdir === 'down' ? -1 : 1;
  const pa = rad(num(d.pAngle, 0));
  const pDir = [u[0] * Math.cos(pa) + nrm[0] * Math.sin(pa), u[1] * Math.cos(pa) + nrm[1] * Math.sin(pa)];
  const tip = (dir, len, k, dx = 0, dy = 0) => {
    const [x, y] = F(dir, len);
    return <Label x={x + dir[0] * 16 + dx} y={y + dir[1] * 16 + dy} weight={700}>{lab(k)}</Label>;
  };
  return (
    <AutoSvg deps={[JSON.stringify(d)]}>
      {isInc
        ? <><path d={`M0 0H${base}V${-h}Z`} /><Hatch x1={-10} x2={base + 10} y={0} /></>
        : <><line x1={-20} y1={0} x2={base + 20} y2={0} /><Hatch x1={-20} x2={base + 20} y={0} /></>}
      <g transform={`translate(${C[0]} ${C[1]}) rotate(${deg})`}>
        <rect x={-34} y={-22} width={68} height={44} style={{ fill: 'var(--fig-bg)' }} />
      </g>
      <Label x={C[0] - u[0] * 18 - nrm[0] * 6} y={C[1] - u[1] * 18 - nrm[1] * 6} italic>{d.mass}</Label>
      {isInc && d.showAngle && <>
        <path d={`M48 0A48 48 0 0 0 ${48 * Math.cos(th)} ${-48 * Math.sin(th)}`} strokeWidth={1.4} />
        <Label x={62 * Math.cos(th / 2) + 8} y={-62 * Math.sin(th / 2)} size={13}>θ = {num(d.angle, 30)}°</Label>
      </>}
      {on('W') && <><Arrow x1={C[0]} y1={C[1]} x2={C[0]} y2={C[1] + 90} width={2.8} />{tip([0, 1], 90, 'W')}</>}
      {on('N') && <><Arrow x1={C[0]} y1={C[1]} x2={F(nrm, 85)[0]} y2={F(nrm, 85)[1]} width={2.8} />{tip(nrm, 85, 'N')}</>}
      {on('f') && (() => {
        const dir = isInc ? [u[0] * fSign, u[1] * fSign] : [-1, 0];
        const st = [C[0] + nrm[0] * -18, C[1] + nrm[1] * -18];
        const en = [st[0] + dir[0] * 75, st[1] + dir[1] * 75];
        return <><Arrow x1={st[0]} y1={st[1]} x2={en[0]} y2={en[1]} width={2.8} /><Label x={en[0] + dir[0] * 14} y={en[1] + dir[1] * 14 + 12} weight={700}>{lab('f')}</Label></>;
      })()}
      {on('P') && <>
        <Arrow x1={C[0]} y1={C[1]} x2={F(pDir, 95)[0]} y2={F(pDir, 95)[1]} width={2.8} />{tip(pDir, 95, 'P')}
        {num(d.pAngle, 0) !== 0 && <Label x={F(u, 70)[0]} y={F(u, 70)[1] + (isInc ? 4 : 0) - 14} size={12}>{num(d.pAngle, 0)}°</Label>}
      </>}
    </AutoSvg>
  );
}

export function FbdEditor({ value: v, onChange }) {
  const set = (k, x) => onChange({ ...v, [k]: x });
  const scene = SCENES[v.scene];
  return (
    <div className="dg-form">
      <div className="field"><span className="lbl">Scene</span>
        <div className="seg">{Object.entries(SCENES).map(([k, s]) => <button key={k} type="button" className={k === v.scene ? 'on' : ''} onClick={() => set('scene', k)}>{s.name}</button>)}</div>
      </div>
      <div className="form-grid">
        {v.scene !== 'floor' && <div className="field"><label>{v.scene === 'hanging' ? 'Left string angle (°)' : 'Incline angle θ (°)'}</label>
          <input className="inp" type="number" value={v.angle} onChange={(e) => set('angle', e.target.value)} /></div>}
        {v.scene === 'hanging' && <div className="field"><label>Right string angle (°)</label>
          <input className="inp" type="number" value={v.angle2} onChange={(e) => set('angle2', e.target.value)} /></div>}
        {v.scene !== 'hanging' && <div className="field"><label>Applied force angle (°)</label>
          <input className="inp" type="number" value={v.pAngle} onChange={(e) => set('pAngle', e.target.value)} /></div>}
        <div className="field"><label>Text on the block</label><input className="inp" value={v.mass} onChange={(e) => set('mass', e.target.value)} placeholder="m or 5 kg" /></div>
        {v.scene === 'incline' && <div className="field"><label>Friction acts</label>
          <select className="sel" value={v.fdir} onChange={(e) => set('fdir', e.target.value)}><option value="up">Up the slope</option><option value="down">Down the slope</option></select></div>}
      </div>
      <span className="lbl">Forces to show</span>
      {scene.forces.map((k) => (
        <div className="row-edit" key={k}>
          <label className="toggle"><input type="checkbox" checked={v.show[k] !== false} onChange={(e) => set('show', { ...v.show, [k]: e.target.checked })} />{FORCE_NAMES[k]}</label>
          <label>label <input className="inp sm-inp" value={v.labels[k]} onChange={(e) => set('labels', { ...v.labels, [k]: e.target.value })} /></label>
        </div>
      ))}
      <label className="toggle"><input type="checkbox" checked={!!v.showAngle} onChange={(e) => set('showAngle', e.target.checked)} />Show angle markers</label>
      <p className="hint">For anything else (pulleys, springs, levers), use the drawing board with the Mechanical symbols and the Arrow tool.</p>
    </div>
  );
}
