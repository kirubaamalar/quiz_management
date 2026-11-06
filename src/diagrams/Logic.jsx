// Logic circuits drawn automatically from a Boolean expression.
// Saved data: { expr: "Y = AB + C'", truth: false }
import { DrawingView } from './Drawing';
import { TableView } from './Table';
import { layoutLogic, parseLogic, truthTable } from './boolean';
import { uid } from '../lib/utils';

export const logicDefaults = () => ({ expr: "Y = AB + C'", truth: false });

function build(expr) {
  try { return { els: layoutLogic(parseLogic(expr), uid) }; } catch (e) { return { error: e.message }; }
}

export function LogicView({ data }) {
  const r = build(data.expr);
  if (r.error) return <div className="dg-error">{r.error}</div>;
  let rows = null;
  if (data.truth) { try { rows = truthTable([], [data.expr]); } catch { rows = null; } }
  return (
    <div className="logic-view">
      <DrawingView data={{ elements: r.els }} />
      {rows && <TableView data={{ header: true, rows }} />}
    </div>
  );
}

const EXAMPLES = ["Y = AB + C'", 'Y = (A + B)(C + D)', 'Y = A ⊕ B', "F = A'B + AB'", 'Y = NOT (A AND B)', 'Q = (A NAND B) NOR C'];

export function LogicEditor({ value: d, onChange, onConvert }) {
  const r = build(d.expr);
  return (
    <div className="dg-form">
      <div className="field">
        <label htmlFor="lg-expr">Boolean expression</label>
        <input id="lg-expr" className="inp big-inp" value={d.expr} onChange={(e) => onChange({ ...d, expr: e.target.value })} placeholder="Y = AB + C'" />
        {r.error ? <span className="dg-error">{r.error}</span> : <span className="hint">The gate circuit is drawn automatically.</span>}
      </div>
      <div className="field"><span className="lbl">Examples</span>
        <div className="tpl-grid">{EXAMPLES.map((x) => <button key={x} type="button" className="tpl-btn mono" onClick={() => onChange({ ...d, expr: x })}>{x}</button>)}</div>
      </div>
      <table className="tbl key-tbl">
        <thead><tr><th>Type</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td><kbd>AB</kbd> or <kbd>A·B</kbd> or <kbd>A AND B</kbd></td><td>AND</td></tr>
          <tr><td><kbd>A + B</kbd> or <kbd>A OR B</kbd></td><td>OR</td></tr>
          <tr><td><kbd>A'</kbd> or <kbd>!A</kbd> or <kbd>NOT A</kbd></td><td>NOT</td></tr>
          <tr><td><kbd>A ⊕ B</kbd> or <kbd>A ^ B</kbd> or <kbd>A XOR B</kbd></td><td>XOR</td></tr>
          <tr><td><kbd>NAND</kbd> <kbd>NOR</kbd> <kbd>XNOR</kbd></td><td>written as words</td></tr>
        </tbody>
      </table>
      <label className="toggle"><input type="checkbox" checked={!!d.truth} onChange={(e) => onChange({ ...d, truth: e.target.checked })} />Also show the truth table</label>
      {!r.error && <button type="button" className="btn sm" onClick={() => onConvert('drawing', { elements: r.els })}>Customize in the drawing board</button>}
    </div>
  );
}
