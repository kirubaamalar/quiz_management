// Small SVG building blocks shared by all diagram types.
import { useLayoutEffect, useRef, useState } from 'react';
import { SYMBOLS, transformPt } from './symbols';

export const BG = { fill: 'var(--fig-bg)' }; // paper colour behind open circles

/** Line with an arrow head at (x2, y2). */
export function Arrow({ x1, y1, x2, y2, head = 10, width = 2, both = false, dashed, className }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hd = (x, y, ang) => {
    const p1 = [x - head * Math.cos(ang - 0.4), y - head * Math.sin(ang - 0.4)];
    const p2 = [x - head * Math.cos(ang + 0.4), y - head * Math.sin(ang + 0.4)];
    return `M${x} ${y}L${p1[0]} ${p1[1]}L${p2[0]} ${p2[1]}Z`;
  };
  return (
    <g className={className}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={width} strokeDasharray={dashed ? '6 5' : undefined} />
      <path d={hd(x2, y2, a)} fill="currentColor" stroke="none" />
      {both && <path d={hd(x1, y1, a + Math.PI)} fill="currentColor" stroke="none" />}
    </g>
  );
}

/** Text that stays upright. */
export function Label({ x, y, children, anchor = 'middle', size = 14, italic, weight, fill = 'currentColor', className }) {
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fontSize={size} fill={fill} stroke="none"
      fontStyle={italic ? 'italic' : undefined} fontWeight={weight} className={className}>
      {children}
    </text>
  );
}

/** Dimension line with end ticks and a centred value. */
export function Dim({ x1, x2, y, text, size = 13 }) {
  return (
    <g strokeWidth={1.2}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} />
      <path d={`M${x1} ${y}l7-3.5v7Z M${x2} ${y}l-7-3.5v7Z`} fill="currentColor" stroke="none" />
      <Label x={(x1 + x2) / 2} y={y + 13} size={size}>{text}</Label>
    </g>
  );
}

/** One placed symbol from the library. */
export function SymbolShape({ el }) {
  const s = SYMBOLS[el.s];
  if (!s) return null;
  const rot = el.rot || 0;
  const tf = `translate(${el.x} ${el.y}) rotate(${rot})${el.mirror ? ' scale(1 -1)' : ''}`;
  // label position: rotate the symbol's label point, flip to the other side if asked
  // slanted parts get their label pushed further out so the horizontal text clears the symbol
  const diag = Math.abs(Math.sin((2 * rot * Math.PI) / 180)) > 0.5 ? 1.7 : 1;
  const la = [s.labelAt[0], s.labelAt[1] * diag * (el.flip ? -1 : 1)];
  const [lx, ly] = transformPt(la, rot, el.mirror);
  const cx = (s.box[0] + s.box[2]) / 2, cy = (s.box[1] + s.box[3]) / 2;
  const [ccx, ccy] = transformPt([cx, cy], rot, el.mirror);
  const dx = lx - ccx, dy = ly - ccy;
  const anchor = s.labelInside || Math.abs(dx) <= Math.abs(dy) ? 'middle' : dx > 0 ? 'start' : 'end';
  return (
    <g>
      <g transform={tf}>
        {s.paths.map((p, i) => <path key={i} d={p.d} fill={p.fill ? 'currentColor' : 'none'} />)}
        {(s.circles || []).map(([x, y, r, f], i) => (
          <circle key={'c' + i} cx={x} cy={y} r={r} fill={f === true ? 'currentColor' : 'none'} style={f === 'bg' ? BG : undefined} />
        ))}
      </g>
      {(s.texts || []).map(([x, y, t, size], i) => {
        const [tx, ty] = transformPt([x, y], rot, el.mirror);
        return <Label key={'t' + i} x={el.x + tx} y={el.y + ty} size={size || 15} weight={600}>{t}</Label>;
      })}
      {el.label && <Label x={el.x + lx} y={el.y + ly} anchor={anchor} size={el.size || 14}>{el.label}</Label>}
    </g>
  );
}

/** SVG that sizes its viewBox to fit whatever is drawn inside. */
export function AutoSvg({ children, pad = 18, className = '', minW = 0, deps = [] }) {
  const g = useRef(null);
  const [vb, setVb] = useState('0 0 100 100');
  useLayoutEffect(() => {
    if (!g.current) return;
    try {
      const b = g.current.getBBox();
      const w = Math.max(b.width + pad * 2, minW);
      const x = b.x - pad - (w - b.width - pad * 2) / 2;
      setVb(`${x} ${b.y - pad} ${w} ${b.height + pad * 2}`);
    } catch { /* not rendered yet */ }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  const [, , w] = vb.split(' ').map(Number);
  return (
    <svg className={'dg ' + className} viewBox={vb} style={{ maxWidth: Math.max(w, 120) * 1.15 }} role="img">
      <g ref={g} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</g>
    </svg>
  );
}

/** Formats numbers for labels: 2.5, 12, 0.333 */
export const nf = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n ?? '');
  return String(Math.round(v * 1000) / 1000);
};
