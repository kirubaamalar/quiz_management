// Tables: data tables, given values, and truth tables (generated from a Boolean expression).
// Saved data: { rows: [[...]], header: true, inputs: 'A, B', exprs: "Y = AB + C'" }
import { useState } from 'react';
import Tex from '../components/Tex';
import { truthTable } from './boolean';

export const tableDefaults = () => ({
  header: true, inputs: 'A, B, C', exprs: "Y = AB + C'",
  rows: [['Quantity', 'Symbol', 'Value'], ['Resistance', '$R$', '10 Ω'], ['Capacitance', '$C$', '100 μF'], ['Supply voltage', '$V_s$', '12 V']],
});

export function TableView({ data }) {
  const rows = data.rows || [];
  if (!rows.length) return <div className="dg-empty">Empty table</div>;
  const [head, ...body] = data.header !== false ? rows : [null, ...rows];
  return (
    <div className="dtable-wrap">
      <table className="dtable">
        {head && <thead><tr>{head.map((c, i) => <th key={i}><Tex as="span" src={c} /></th>)}</tr></thead>}
        <tbody>{body.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k}><Tex as="span" src={c} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function TableEditor({ value: d, onChange }) {
  const rows = d.rows;
  const cols = Math.max(1, ...rows.map((r) => r.length));
  const set = (k, x) => onChange({ ...d, [k]: x });
  const setCell = (i, k, val) => set('rows', rows.map((r, a) => (a === i ? Array.from({ length: cols }, (_, b) => (b === k ? val : r[b] ?? '')) : r)));
  const addRow = () => set('rows', [...rows, Array(cols).fill('')]);
  const addCol = () => set('rows', rows.map((r) => [...r, '']));
  const delRow = (i) => set('rows', rows.filter((_, a) => a !== i));
  const delCol = (k) => cols > 1 && set('rows', rows.map((r) => r.filter((_, b) => b !== k)));
  const [truthErr, setTruthErr] = useState('');
  const makeTruth = () => {
    try {
      const inputs = d.inputs.split(/[\s,]+/).filter(Boolean);
      const exprs = d.exprs.split('\n').map((s) => s.trim()).filter(Boolean);
      onChange({ ...d, header: true, rows: truthTable(inputs, exprs) });
      setTruthErr('');
    } catch (e) { setTruthErr(e.message); }
  };
  return (
    <div className="dg-form">
      <div className="truth-box">
        <span className="lbl">Truth table generator</span>
        <div className="form-grid">
          <div className="field"><label>Inputs</label><input className="inp" value={d.inputs} placeholder="A, B, C" onChange={(e) => set('inputs', e.target.value)} /></div>
          <div className="field" style={{ gridColumn: 'span 2' }}><label>Outputs (one per line)</label>
            <textarea className="ta-text" rows={2} value={d.exprs} placeholder={"Y = AB + C'\nZ = A ⊕ B"} onChange={(e) => set('exprs', e.target.value)} /></div>
        </div>
        <button type="button" className="btn sm" onClick={makeTruth}>Fill the table</button>
        {truthErr && <span className="dg-error">{truthErr}</span>}
        <p className="hint">AB means A AND B, + means OR, ' after a letter means NOT, ⊕ or ^ means XOR.</p>
      </div>

      <span className="lbl">Table</span>
      <div className="grid-edit-wrap">
        <table className="grid-edit">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === 0 && d.header !== false ? 'head' : ''}>
                {Array.from({ length: cols }, (_, k) => (
                  <td key={k}><input value={r[k] ?? ''} onChange={(e) => setCell(i, k, e.target.value)} aria-label={`Row ${i + 1} column ${k + 1}`} /></td>
                ))}
                <td><button type="button" className="part-x" aria-label="Delete row" onClick={() => delRow(i)}>×</button></td>
              </tr>
            ))}
            <tr>{Array.from({ length: cols }, (_, k) => (
              <td key={k}><button type="button" className="btn sm" style={{ width: '100%' }} onClick={() => delCol(k)} disabled={cols === 1}>Delete column</button></td>
            ))}<td /></tr>
          </tbody>
        </table>
      </div>
      <div className="row" style={{ gap: 6 }}>
        <button type="button" className="btn sm" onClick={addRow}>+ Row</button>
        <button type="button" className="btn sm" onClick={addCol}>+ Column</button>
        <label className="toggle"><input type="checkbox" checked={d.header !== false} onChange={(e) => set('header', e.target.checked)} />First row is a heading</label>
      </div>
      <p className="hint">For a symbol in a cell, wrap it in $ signs, for example $V_s$ or $\theta$.</p>
    </div>
  );
}
