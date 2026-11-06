// Flowcharts and block diagrams, drawn with Mermaid (loaded only when needed).
// Saved data: { dir, steps: [{id, shape, text}], links: [{from, to, label}], mode: 'builder' | 'code', code }
import { useEffect, useState } from 'react';

let mermaidPromise;
const getMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false, theme: 'neutral', securityLevel: 'strict', suppressErrorRendering: true,
        fontFamily: 'IBM Plex Sans, Segoe UI, sans-serif', flowchart: { htmlLabels: false, curve: 'linear' },
      });
      return m.default;
    });
  }
  return mermaidPromise;
};

export const SHAPES = {
  start: ['Start / Stop', (id, t) => `${id}(["${t}"])`],
  process: ['Process', (id, t) => `${id}["${t}"]`],
  decision: ['Decision', (id, t) => `${id}{"${t}"}`],
  io: ['Input / Output', (id, t) => `${id}[/"${t}"/]`],
  sub: ['Sub-process', (id, t) => `${id}[["${t}"]]`],
  circle: ['Circle / junction', (id, t) => `${id}(("${t}"))`],
};
const esc = (s) => String(s || ' ').replace(/"/g, '#quot;');

export function flowCode(d) {
  if (d.mode === 'code') return d.code || '';
  const lines = [`flowchart ${d.dir || 'TD'}`];
  d.steps.forEach((s) => lines.push('  ' + (SHAPES[s.shape] || SHAPES.process)[1](s.id, esc(s.text))));
  d.links.forEach((l) => {
    if (!l.from || !l.to) return;
    lines.push(`  ${l.from} -->${l.label ? `|"${esc(l.label)}"|` : ''} ${l.to}`);
  });
  return lines.join('\n');
}

const EXAMPLE_FLOW = () => ({
  mode: 'builder', dir: 'TD', code: '',
  steps: [
    { id: 's1', shape: 'start', text: 'Start' }, { id: 's2', shape: 'io', text: 'Read N' },
    { id: 's3', shape: 'decision', text: 'Is N > 0?' }, { id: 's4', shape: 'io', text: 'Print “Positive”' },
    { id: 's5', shape: 'io', text: 'Print “Not positive”' }, { id: 's6', shape: 'start', text: 'Stop' },
  ],
  links: [
    { from: 's1', to: 's2', label: '' }, { from: 's2', to: 's3', label: '' }, { from: 's3', to: 's4', label: 'Yes' },
    { from: 's3', to: 's5', label: 'No' }, { from: 's4', to: 's6', label: '' }, { from: 's5', to: 's6', label: '' },
  ],
});
const EXAMPLE_BLOCK = () => ({
  mode: 'builder', dir: 'LR', code: '',
  steps: [
    { id: 'r', shape: 'process', text: 'R(s)' }, { id: 'sum', shape: 'circle', text: 'Σ' },
    { id: 'g', shape: 'process', text: 'G(s)' }, { id: 'c', shape: 'process', text: 'C(s)' }, { id: 'h', shape: 'process', text: 'H(s)' },
  ],
  links: [
    { from: 'r', to: 'sum', label: '+' }, { from: 'sum', to: 'g', label: 'E(s)' }, { from: 'g', to: 'c', label: '' },
    { from: 'c', to: 'h', label: '' }, { from: 'h', to: 'sum', label: '−' },
  ],
});
export const flowDefaults = EXAMPLE_FLOW;

let seq = 0;
export function FlowView({ data }) {
  const code = flowCode(data);
  const [state, setState] = useState({ svg: '', error: '' });
  useEffect(() => {
    let alive = true;
    getMermaid()
      .then(async (m) => {
        await m.parse(code);
        return m.render('mmd-' + Date.now().toString(36) + '-' + seq++, code);
      })
      .then(({ svg }) => alive && setState({ svg, error: '' }))
      .catch(() => alive && setState({ svg: '', error: 'The flowchart has a mistake. Check the steps and links.' }));
    return () => { alive = false; };
  }, [code]);
  if (state.error) return <div className="dg-error">{state.error}</div>;
  if (!state.svg) return <div className="dg-empty">Drawing…</div>;
  return <div className="flow-svg" dangerouslySetInnerHTML={{ __html: state.svg }} />;
}

export function FlowEditor({ value: d, onChange }) {
  const set = (k, x) => onChange({ ...d, [k]: x });
  const setStep = (i, ch) => set('steps', d.steps.map((s, k) => (k === i ? { ...s, ...ch } : s)));
  const setLink = (i, ch) => set('links', d.links.map((s, k) => (k === i ? { ...s, ...ch } : s)));
  const addStep = (shape) => {
    const id = 's' + Date.now().toString(36);
    const last = d.steps[d.steps.length - 1];
    onChange({ ...d, steps: [...d.steps, { id, shape, text: SHAPES[shape][0] }], links: last ? [...d.links, { from: last.id, to: id, label: '' }] : d.links });
  };
  const removeStep = (i) => {
    const id = d.steps[i].id;
    onChange({ ...d, steps: d.steps.filter((_, k) => k !== i), links: d.links.filter((l) => l.from !== id && l.to !== id) });
  };
  const name = (id) => { const s = d.steps.find((x) => x.id === id); return s ? s.text : id; };
  return (
    <div className="dg-form">
      <div className="row" style={{ gap: 8 }}>
        <span className="lbl">Start from</span>
        <button type="button" className="btn sm" onClick={() => onChange(EXAMPLE_FLOW())}>Flowchart example</button>
        <button type="button" className="btn sm" onClick={() => onChange(EXAMPLE_BLOCK())}>Feedback block diagram</button>
        <button type="button" className="btn sm" onClick={() => onChange({ ...d, mode: 'builder', steps: [], links: [] })}>Empty</button>
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="seg">
          <button type="button" className={d.mode !== 'code' ? 'on' : ''} onClick={() => set('mode', 'builder')}>Build with steps</button>
          <button type="button" className={d.mode === 'code' ? 'on' : ''} onClick={() => onChange({ ...d, mode: 'code', code: d.code || flowCode({ ...d, mode: 'builder' }) })}>Write as text</button>
        </div>
        {d.mode !== 'code' && (
          <select className="sel" style={{ width: 'auto' }} value={d.dir} onChange={(e) => set('dir', e.target.value)}>
            <option value="TD">Top to bottom</option><option value="LR">Left to right</option>
          </select>
        )}
      </div>

      {d.mode === 'code' ? (
        <div className="field">
          <textarea className="ta mono" rows={12} value={d.code} onChange={(e) => set('code', e.target.value)} />
          <span className="hint">Mermaid flowchart text, for example <code>A[Start] --&gt; B{'{'}Is N &gt; 0?{'}'}</code>. Switching back to steps keeps the steps you had before.</span>
        </div>
      ) : (
        <>
          <span className="lbl">Steps</span>
          {d.steps.map((s, i) => (
            <div className="row-edit" key={s.id}>
              <select className="sel" style={{ width: 'auto' }} value={s.shape} onChange={(e) => setStep(i, { shape: e.target.value })}>
                {Object.entries(SHAPES).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
              </select>
              <input className="inp" value={s.text} onChange={(e) => setStep(i, { text: e.target.value })} style={{ flex: 1, minWidth: 160 }} />
              <button type="button" className="part-x" aria-label="Remove step" onClick={() => removeStep(i)}>×</button>
            </div>
          ))}
          <div className="row" style={{ gap: 6 }}>
            {Object.entries(SHAPES).map(([k, [label]]) => <button key={k} type="button" className="btn sm" onClick={() => addStep(k)}>+ {label}</button>)}
          </div>
          <span className="lbl">Arrows</span>
          {d.links.map((l, i) => (
            <div className="row-edit" key={i}>
              <select className="sel" style={{ width: 'auto', maxWidth: 180 }} value={l.from} onChange={(e) => setLink(i, { from: e.target.value })}>
                {d.steps.map((s) => <option key={s.id} value={s.id}>{s.text}</option>)}
              </select>
              <span>→</span>
              <select className="sel" style={{ width: 'auto', maxWidth: 180 }} value={l.to} onChange={(e) => setLink(i, { to: e.target.value })}>
                {d.steps.map((s) => <option key={s.id} value={s.id}>{s.text}</option>)}
              </select>
              <label>label <input className="inp sm-inp" value={l.label} placeholder="Yes" onChange={(e) => setLink(i, { label: e.target.value })} /></label>
              <button type="button" className="part-x" aria-label={'Remove arrow from ' + name(l.from)} onClick={() => set('links', d.links.filter((_, k) => k !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="btn sm" disabled={d.steps.length < 2}
            onClick={() => set('links', [...d.links, { from: d.steps[0].id, to: d.steps[d.steps.length - 1].id, label: '' }])}>+ Arrow</button>
          <p className="hint">Adding a step joins it to the previous step automatically. Use arrows with labels such as Yes / No for decisions.</p>
        </>
      )}
    </div>
  );
}
