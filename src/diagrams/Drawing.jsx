// Drawing board: free diagrams built from library symbols, wires, arrows, shapes and text.
// Saved data: { elements: [...] }. Used directly, and by the Circuit and Logic tools.
import { useEffect, useMemo, useRef, useState } from 'react';
import { SYMBOLS, SYMBOL_GROUPS } from './symbols';
import { Arrow, AutoSvg, Label, SymbolShape, BG } from './svgParts';
import { cls, uid } from '../lib/utils';

const GRID = 10;
const snap = (v) => Math.round(v / GRID) * GRID;

/** Draws one element (shared by the viewer and the editor). */
export function DrawEl({ el }) {
  switch (el.t) {
    case 'sym': return <SymbolShape el={el} />;
    case 'wire': return <polyline points={el.pts.map((p) => p.join(',')).join(' ')} />;
    case 'line': {
      const [[x1, y1], [x2, y2]] = el.pts;
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={el.dashed ? '7 6' : undefined} />
          {el.label && <Label x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 14}>{el.label}</Label>}
        </g>
      );
    }
    case 'arrow': {
      const [[x1, y1], [x2, y2]] = el.pts;
      // label beside the tail
      const a = Math.atan2(y2 - y1, x2 - x1);
      const lx = x1 - 14 * Math.cos(a), ly = y1 - 14 * Math.sin(a);
      return (
        <g>
          <Arrow x1={x1} y1={y1} x2={x2} y2={y2} both={el.both} dashed={el.dashed} width={el.thick ? 3 : 2} />
          {el.label && <Label x={lx} y={ly} anchor={Math.cos(a) > 0.3 ? 'end' : Math.cos(a) < -0.3 ? 'start' : 'middle'}>{el.label}</Label>}
        </g>
      );
    }
    case 'rect':
      return (
        <g>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.round ? 10 : 0} style={el.filled ? BG : undefined} />
          {el.label && <Label x={el.x + el.w / 2} y={el.y + el.h / 2}>{el.label}</Label>}
        </g>
      );
    case 'ellipse':
      return (
        <g>
          <ellipse cx={el.x + el.w / 2} cy={el.y + el.h / 2} rx={Math.abs(el.w / 2)} ry={Math.abs(el.h / 2)} style={el.filled ? BG : undefined} />
          {el.label && <Label x={el.x + el.w / 2} y={el.y + el.h / 2}>{el.label}</Label>}
        </g>
      );
    case 'text':
      return <Label x={el.x} y={el.y} size={el.size || 16} anchor="start" italic={el.italic}>{el.label}</Label>;
    default: return null;
  }
}

export function DrawingView({ data }) {
  const els = (data && data.elements) || [];
  if (!els.length) return <div className="dg-empty">Empty drawing</div>;
  return <AutoSvg deps={[els]}>{els.map((el) => <DrawEl key={el.id} el={el} />)}</AutoSvg>;
}

// ---------- editor ----------
const TOOLS = [
  ['select', '⬚ Select'], ['wire', '⌐ Wire'], ['line', '╱ Line'], ['arrow', '→ Arrow / force'],
  ['rect', '▭ Box'], ['ellipse', '◯ Circle'], ['text', 'T Text'],
];
const QUICK = ['Ω', 'μ', 'θ', 'α', 'β', 'ω', 'π', 'Δ', '°', '²', '³', '₁', '₂', '₃', '·', '√', '∞', '±', '→'];
const HINTS = {
  select: 'Drag items to move them. Drag empty space to pan. Delete removes, R rotates, Ctrl+Z undoes.',
  wire: 'Click to add corners (wires bend at right angles). Double-click or press Enter to finish, Esc to cancel.',
  line: 'Drag to draw a line.',
  arrow: 'Drag from the tail to the tip. Use it for forces, currents and directions.',
  rect: 'Drag to draw a box.',
  ellipse: 'Drag to draw a circle or ellipse.',
  text: 'Click where the text should go, then type it in the panel.',
};

/** Rough bounding box of an element, for selection outlines and fitting the view. */
function bounds(el) {
  if (el.t === 'sym') {
    const b = SYMBOLS[el.s]?.box || [-10, -10, 10, 10];
    const r = ((el.rot || 0) % 360 + 360) % 360;
    const pts = [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(([x, y]) => {
      const yy = el.mirror ? -y : y;
      const a = (r * Math.PI) / 180;
      return [x * Math.cos(a) - yy * Math.sin(a), x * Math.sin(a) + yy * Math.cos(a)];
    });
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return [el.x + Math.min(...xs), el.y + Math.min(...ys), el.x + Math.max(...xs), el.y + Math.max(...ys)];
  }
  if (el.pts) {
    const xs = el.pts.map((p) => p[0]), ys = el.pts.map((p) => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  if (el.t === 'text') {
    const w = (el.label || '').length * (el.size || 16) * 0.55;
    return [el.x, el.y - 10, el.x + w, el.y + 10];
  }
  return [Math.min(el.x, el.x + el.w), Math.min(el.y, el.y + el.h), Math.max(el.x, el.x + el.w), Math.max(el.y, el.y + el.h)];
}

const moveEl = (el, dx, dy) =>
  el.pts ? { ...el, pts: el.pts.map(([x, y]) => [x + dx, y + dy]) } : { ...el, x: el.x + dx, y: el.y + dy };

function fitBox(els) {
  if (!els.length) return { x: -40, y: -40, w: 800, h: 460 };
  const bs = els.map(bounds);
  const x0 = Math.min(...bs.map((b) => b[0])) - 60, y0 = Math.min(...bs.map((b) => b[1])) - 60;
  const x1 = Math.max(...bs.map((b) => b[2])) + 60, y1 = Math.max(...bs.map((b) => b[3])) + 60;
  let w = x1 - x0, h = y1 - y0;
  const ratio = 800 / 460;
  if (w / h < ratio) w = h * ratio; else h = w / ratio;
  return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h };
}

function SymbolIcon({ name }) {
  const s = SYMBOLS[name];
  const b = s.box;
  return (
    <svg viewBox={`${b[0] - 4} ${b[1] - 4} ${b[2] - b[0] + 8} ${b[3] - b[1] + 8}`} className="sym-icon" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <SymbolShape el={{ s: name, x: 0, y: 0 }} />
      </g>
    </svg>
  );
}

export function DrawingEditor({ value, onChange }) {
  const els = value.elements || [];
  const [tool, setTool] = useState('select');
  const [group, setGroup] = useState('Electrical');
  const [sel, setSel] = useState(null);
  const [view, setView] = useState(() => fitBox(els));
  const [draft, setDraft] = useState(null); // shape being drawn
  const [cursor, setCursor] = useState(null);
  const svgRef = useRef(null);
  const drag = useRef(null);
  const hist = useRef({ past: [], future: [] });
  const elsRef = useRef(els);
  elsRef.current = els;

  const commit = (next, record = true) => {
    if (record) { hist.current.past.push(elsRef.current); hist.current.future = []; }
    onChange({ ...value, elements: next });
  };
  const undo = () => {
    const h = hist.current; if (!h.past.length) return;
    h.future.push(elsRef.current); onChange({ ...value, elements: h.past.pop() }); setSel(null);
  };
  const redo = () => {
    const h = hist.current; if (!h.future.length) return;
    h.past.push(elsRef.current); onChange({ ...value, elements: h.future.pop() });
  };
  const selected = els.find((e) => e.id === sel);
  const update = (changes, record = true) => commit(els.map((e) => (e.id === sel ? { ...e, ...changes } : e)), record);
  const removeSel = () => { if (!sel) return; commit(els.filter((e) => e.id !== sel)); setSel(null); };
  const rotateSel = () => selected && selected.t === 'sym' && update({ rot: ((selected.rot || 0) + 90) % 360 });
  const duplicateSel = () => {
    if (!selected) return;
    const copy = { ...moveEl(selected, 20, 20), id: uid() };
    commit([...els, copy]); setSel(copy.id);
  };

  const toPt = (e, doSnap = true) => {
    const svg = svgRef.current;
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(svg.getScreenCTM().inverse());
    return doSnap ? [snap(q.x), snap(q.y)] : [q.x, q.y];
  };

  const finishWire = () => {
    if (draft && draft.t === 'wire' && draft.pts.length > 1) { commit([...els, { ...draft, id: uid() }]); }
    setDraft(null);
  };

  const onBgDown = (e) => {
    if (e.button !== 0) return;
    const p = toPt(e);
    if (tool === 'select') { setSel(null); drag.current = { pan: true, start: toPt(e, false), view }; return; }
    if (tool.startsWith('sym:')) {
      const el = { id: uid(), t: 'sym', s: tool.slice(4), x: p[0], y: p[1], rot: 0, label: '' };
      commit([...els, el]); setSel(el.id); setTool('select'); return;
    }
    if (tool === 'text') {
      const el = { id: uid(), t: 'text', x: p[0], y: p[1], label: 'Text', size: 16 };
      commit([...els, el]); setSel(el.id); setTool('select');
      setTimeout(() => document.getElementById('dg-label')?.select(), 30);
      return;
    }
    if (tool === 'wire') {
      if (!draft) { setDraft({ t: 'wire', pts: [p] }); return; }
      const last = draft.pts[draft.pts.length - 1];
      if (last[0] === p[0] && last[1] === p[1]) return;
      const add = last[0] !== p[0] && last[1] !== p[1] ? [[p[0], last[1]], p] : [p];
      setDraft({ ...draft, pts: [...draft.pts, ...add] });
      return;
    }
    // line / arrow / rect / ellipse: drag to draw
    svgRef.current.setPointerCapture(e.pointerId);
    if (tool === 'line' || tool === 'arrow') setDraft({ t: tool, pts: [p, p] });
    else setDraft({ t: tool, x: p[0], y: p[1], w: 0, h: 0 });
  };

  const onElDown = (e, el) => {
    if (tool !== 'select') return; // let drawing tools work on top of shapes
    e.stopPropagation();
    setSel(el.id);
    svgRef.current.setPointerCapture(e.pointerId);
    drag.current = { id: el.id, start: toPt(e), orig: el, moved: false };
  };

  const onMove = (e) => {
    const d = drag.current;
    if (d && d.pan) {
      const p = toPt(e, false);
      const dx = p[0] - d.start[0], dy = p[1] - d.start[1];
      setView((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
      return;
    }
    const p = toPt(e);
    setCursor(p);
    if (d && d.id) {
      const dx = p[0] - d.start[0], dy = p[1] - d.start[1];
      if (!dx && !dy && !d.moved) return;
      if (!d.moved) { hist.current.past.push(elsRef.current); hist.current.future = []; d.moved = true; }
      onChange({ ...value, elements: elsRef.current.map((x) => (x.id === d.id ? moveEl(d.orig, dx, dy) : x)) });
      return;
    }
    if (draft && (draft.t === 'line' || draft.t === 'arrow')) setDraft({ ...draft, pts: [draft.pts[0], p] });
    else if (draft && (draft.t === 'rect' || draft.t === 'ellipse')) setDraft({ ...draft, w: p[0] - draft.x, h: p[1] - draft.y });
  };

  const onUp = () => {
    drag.current = null;
    if (!draft || draft.t === 'wire') return;
    let el = { ...draft, id: uid(), label: '' };
    if (el.t === 'rect' || el.t === 'ellipse') {
      if (Math.abs(el.w) < 10 || Math.abs(el.h) < 10) { setDraft(null); return; }
      el = { ...el, x: Math.min(el.x, el.x + el.w), y: Math.min(el.y, el.y + el.h), w: Math.abs(el.w), h: Math.abs(el.h) };
    } else if (el.pts[0][0] === el.pts[1][0] && el.pts[0][1] === el.pts[1][1]) { setDraft(null); return; }
    commit([...els, el]); setSel(el.id); setDraft(null); setTool('select');
  };

  const zoom = (f) => setView((v) => ({ x: v.x + (v.w * (1 - f)) / 2, y: v.y + (v.h * (1 - f)) / 2, w: v.w * f, h: v.h * f }));

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      if (!svgRef.current || !document.body.contains(svgRef.current)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); removeSel(); }
      else if (e.key.toLowerCase() === 'r' && sel) rotateSel();
      else if (e.key === 'Enter' && draft?.t === 'wire') finishWire();
      else if (e.key === 'Escape') { setDraft(null); setTool('select'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const symbolNames = useMemo(() => Object.keys(SYMBOLS).filter((k) => SYMBOLS[k].group === group), [group]);
  const wirePreview = draft && draft.t === 'wire' && cursor
    ? (() => {
      const last = draft.pts[draft.pts.length - 1];
      const extra = last[0] !== cursor[0] && last[1] !== cursor[1] ? [[cursor[0], last[1]], cursor] : [cursor];
      return [...draft.pts, ...extra];
    })() : null;
  const sb = selected ? bounds(selected) : null;
  const hint = tool.startsWith('sym:') ? 'Click on the board to place the ' + SYMBOLS[tool.slice(4)].name.toLowerCase() + '.' : HINTS[tool];

  return (
    <div className="draw">
      <div className="draw-tools">
        {TOOLS.map(([k, label]) => (
          <button key={k} type="button" className={cls('tool-btn', tool === k && 'on')} onClick={() => { finishWire(); setTool(k); }}>{label}</button>
        ))}
        <span className="tool-sep" />
        <button type="button" className="tool-btn" onClick={undo} title="Undo (Ctrl+Z)">↶ Undo</button>
        <button type="button" className="tool-btn" onClick={redo} title="Redo (Ctrl+Y)">↷ Redo</button>
        <button type="button" className="tool-btn" onClick={() => zoom(0.8)} title="Zoom in">＋</button>
        <button type="button" className="tool-btn" onClick={() => zoom(1.25)} title="Zoom out">－</button>
        <button type="button" className="tool-btn" onClick={() => setView(fitBox(els))}>Fit</button>
        <button type="button" className="tool-btn danger" onClick={() => { if (els.length && window.confirm('Clear the whole drawing?')) { commit([]); setSel(null); } }}>Clear</button>
      </div>

      <div className="draw-body">
        <div className="sym-panel">
          <div className="seg mini sym-groups">
            {SYMBOL_GROUPS.map((g) => <button key={g} type="button" className={cls(group === g && 'on')} onClick={() => setGroup(g)}>{g}</button>)}
          </div>
          <div className="sym-grid">
            {symbolNames.map((n) => (
              <button key={n} type="button" className={cls('sym-btn', tool === 'sym:' + n && 'on')} title={SYMBOLS[n].name}
                onClick={() => { finishWire(); setTool('sym:' + n); }}>
                <SymbolIcon name={n} />
                <span>{SYMBOLS[n].name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="canvas-wrap">
          <svg ref={svgRef} className={cls('canvas', 'tool-' + tool.split(':')[0])} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
            onPointerDown={onBgDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => setCursor(null)}
            onDoubleClick={() => draft?.t === 'wire' && finishWire()}>
            <defs>
              <pattern id="dg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="0" cy="0" r="1.2" fill="var(--grid-major)" />
              </pattern>
            </defs>
            <rect x={view.x - 2000} y={view.y - 2000} width={view.w + 4000} height={view.h + 4000} fill="url(#dg-grid)" />
            <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {els.map((el) => (
                <g key={el.id} className="dg-el" onPointerDown={(e) => onElDown(e, el)}>
                  <DrawEl el={el} />
                  {/* wide invisible outline so thin lines are easy to grab */}
                  {el.pts
                    ? <polyline points={el.pts.map((p) => p.join(',')).join(' ')} stroke="transparent" strokeWidth="14" />
                    : (() => { const b = bounds(el); return <rect x={b[0]} y={b[1]} width={b[2] - b[0]} height={b[3] - b[1]} fill="transparent" stroke="none" />; })()}
                </g>
              ))}
              {draft && draft.t !== 'wire' && <g opacity="0.6"><DrawEl el={draft.t === 'rect' || draft.t === 'ellipse'
                ? { ...draft, x: Math.min(draft.x, draft.x + draft.w), y: Math.min(draft.y, draft.y + draft.h), w: Math.abs(draft.w), h: Math.abs(draft.h) } : draft} /></g>}
              {wirePreview && <polyline points={wirePreview.map((p) => p.join(',')).join(' ')} opacity="0.6" />}
              {sb && <rect x={sb[0] - 6} y={sb[1] - 6} width={sb[2] - sb[0] + 12} height={sb[3] - sb[1] + 12} stroke="var(--accent)" strokeDasharray="5 4" strokeWidth="1.5" fill="none" pointerEvents="none" />}
              {cursor && tool !== 'select' && <circle cx={cursor[0]} cy={cursor[1]} r="3" fill="var(--accent)" stroke="none" pointerEvents="none" />}
            </g>
          </svg>
          <div className="draw-hint">{hint}</div>
        </div>

        <div className="prop-panel">
          {!selected ? (
            <p className="hint">Select an item to label, rotate or delete it.<br /><br />Tip: place symbols first, then join them with the Wire tool.</p>
          ) : (
            <>
              <b className="prop-title">{selected.t === 'sym' ? SYMBOLS[selected.s].name : { wire: 'Wire', line: 'Line', arrow: 'Arrow', rect: 'Box', ellipse: 'Circle', text: 'Text' }[selected.t]}</b>
              {selected.t !== 'wire' && (
                <div className="field">
                  <label htmlFor="dg-label">{selected.t === 'text' ? 'Text' : 'Label'}</label>
                  <input id="dg-label" className="inp" value={selected.label || ''} placeholder={selected.t === 'sym' ? 'e.g. R1 = 10 Ω' : 'e.g. F = 20 N'}
                    onFocus={() => { hist.current.past.push(elsRef.current); }}
                    onChange={(e) => update({ label: e.target.value }, false)} />
                  <div className="quick-chars">
                    {QUICK.map((c) => <button key={c} type="button" onClick={() => update({ label: (selected.label || '') + c })}>{c}</button>)}
                  </div>
                </div>
              )}
              <div className="row" style={{ gap: 6 }}>
                {selected.t === 'sym' && <button type="button" className="btn sm" onClick={rotateSel}>⟳ Rotate</button>}
                {selected.t === 'sym' && <button type="button" className="btn sm" onClick={() => update({ flip: !selected.flip })}>Label other side</button>}
                {selected.t === 'sym' && (selected.s === 'opamp' || selected.s === 'npn') && <button type="button" className="btn sm" onClick={() => update({ mirror: !selected.mirror })}>Mirror</button>}
                {(selected.t === 'line' || selected.t === 'arrow') && (
                  <label className="toggle"><input type="checkbox" checked={!!selected.dashed} onChange={(e) => update({ dashed: e.target.checked })} />Dashed</label>
                )}
                {selected.t === 'arrow' && (
                  <label className="toggle"><input type="checkbox" checked={!!selected.both} onChange={(e) => update({ both: e.target.checked })} />Both ends</label>
                )}
                {(selected.t === 'rect') && (
                  <label className="toggle"><input type="checkbox" checked={!!selected.round} onChange={(e) => update({ round: e.target.checked })} />Rounded</label>
                )}
                {selected.t === 'text' && (
                  <select className="sel" style={{ width: 'auto' }} value={selected.size || 16} onChange={(e) => update({ size: +e.target.value })}>
                    {[12, 14, 16, 20, 24, 32].map((s) => <option key={s} value={s}>{s}px</option>)}
                  </select>
                )}
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button type="button" className="btn sm" onClick={duplicateSel}>Duplicate</button>
                <button type="button" className="btn sm danger" onClick={removeSel}>Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const drawingDefaults = () => ({ elements: [] });
