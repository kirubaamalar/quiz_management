import { useState } from 'react';
import { TOOLS } from '../data/tools';
import { cls } from '../lib/utils';

/** Formula toolbar. Buttons keep focus in the text box so the cursor position is not lost. */
export default function Toolbar({ onInsert }) {
  const [group, setGroup] = useState(0);
  const g = TOOLS[group];
  const keepFocus = (e) => e.preventDefault();

  return (
    <div className="toolbar" aria-label="Formula toolbar">
      <div className="tb-tabs" role="tablist">
        {TOOLS.map((t, i) => (
          <button key={t.group} type="button" role="tab" aria-selected={i === group}
            className={cls('tb-tab', i === group && 'on')} onMouseDown={keepFocus} onClick={() => setGroup(i)}>
            {t.group}
          </button>
        ))}
      </div>
      <div className="tb-keys">
        {g.items.map(([label, snippet]) => (
          <button key={label} type="button" className={cls('key', g.templates && 'key-tpl')}
            title={snippet.replace('#', '□')} onMouseDown={keepFocus} onClick={() => onInsert(snippet)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tb-help">Click in a formula box, then tap a symbol. If the cursor is in a words box, a new formula box is added for you.</div>
    </div>
  );
}
