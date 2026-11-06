/** Typing shortcuts for formula boxes (MathLive). */
const SHORTCUTS = [
  ['/', 'Fraction. Type / first for an empty fraction, then ↓ to go to the bottom'],
  ['^', 'Power: x^2 gives x²'],
  ['_', 'Subscript: V_0 gives V₀'],
  ['+-', '±'],
  ['sqrt', '√ square root'],
  ['pi  theta  alpha  omega  Delta  Omega', 'Greek letters π θ α ω Δ Ω'],
  ['xx', '× multiply'],
  ['<=   >=   !=', '≤  ≥  ≠'],
  ['->', '→'],
  ['infty', '∞'],
  ['int   sum   lim', '∫  ∑  lim, with boxes for the limits'],
  ['sin  cos  tan  log  ln', 'Written upright automatically'],
  ['→  ←  ↑  ↓  Tab', 'Move between boxes, for example out of a power or to the bottom of a fraction'],
  ['⌨ icon in the box', 'On-screen math keyboard'],
];

export default function ShortcutHelp() {
  return (
    <details className="kbd-help">
      <summary>Typing shortcuts for formula boxes</summary>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Type</th><th>You get</th></tr></thead>
          <tbody>
            {SHORTCUTS.map(([keys, result]) => (
              <tr key={keys}><td><kbd>{keys}</kbd></td><td>{result}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
