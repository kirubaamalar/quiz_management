// The "Add diagram" window: a tab for every kind of diagram, live preview, caption and size.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import FigureView from './FigureView';
import { DIAGRAM_TYPES, TYPE_MAP, figData, figType } from './registry';
import { cls } from '../lib/utils';

const SIZES = [['s', 'Small'], ['m', 'Medium'], ['l', 'Large'], ['full', 'Full width']];

export default function DiagramStudio({ initial, compact, onSave, onClose }) {
  const startType = initial ? figType(initial) : 'circuit';
  const [tab, setTab] = useState(startType);
  const [byType, setByType] = useState(() => (initial ? { [startType]: figData(initial) } : {}));
  const [caption, setCaption] = useState(initial?.caption || '');
  const sizeFor = (key) => (compact ? 's' : TYPE_MAP[key].size || 'm');
  const [size, setSize] = useState(initial?.size || sizeFor(startType));
  const [sizeTouched, setSizeTouched] = useState(!!initial);
  const [error, setError] = useState('');

  const T = TYPE_MAP[tab];
  const data = byType[tab] ?? T.defaults();
  const setData = (d) => { setByType((m) => ({ ...m, [tab]: d })); setError(''); };
  const convert = (type, d) => { setByType((m) => ({ ...m, [type]: d })); setTab(type); if (!sizeTouched) setSize(sizeFor(type)); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const save = () => {
    if (tab === 'image') {
      if (!data.src) { setError('Choose an image first.'); return; }
      onSave({ type: 'image', src: data.src, size, caption: caption.trim() });
    } else if (tab === 'drawing' && !(data.elements || []).length) {
      setError('The drawing is empty. Add some symbols or shapes first.');
      return;
    } else {
      onSave({ type: tab, data, size, caption: caption.trim() });
    }
  };
  const preview = tab === 'image' ? { type: 'image', src: data.src } : { type: tab, data };

  return createPortal(
    <div className="scrim studio-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet dstudio" role="dialog" aria-modal="true" aria-label="Diagram studio">
        <header className="dstudio-head">
          <h3>{initial ? 'Edit diagram' : 'Add a diagram'}</h3>
          <button type="button" className="calc-x dstudio-x" aria-label="Close" onClick={onClose}>×</button>
        </header>
        <nav className="dstudio-tabs" role="tablist">
          {DIAGRAM_TYPES.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={t.key === tab} className={cls('dtab', t.key === tab && 'on')} onClick={() => setTab(t.key)}>
              <span className="dtab-icon" aria-hidden="true">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <p className="dstudio-about">{T.about}</p>
        <div className={cls('dstudio-body', T.wide && 'wide')}>
          <div className="dstudio-editor">
            <T.Editor value={data} onChange={setData} onConvert={convert} />
          </div>
          {!T.wide && (
            <div className="dstudio-preview">
              <span className="lbl">Preview</span>
              <div className={'fig fig-' + size + ' preview-fig'}><FigureView fig={preview} />{caption && <span className="fig-cap">{caption}</span>}</div>
            </div>
          )}
        </div>
        <footer className="dstudio-foot">
          <input className="inp" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional), e.g. Fig. 1 – Simply supported beam" />
          <div className="seg mini" role="group" aria-label="Size in the question">
            {SIZES.map(([k, l]) => <button key={k} type="button" className={cls(size === k && 'on')} onClick={() => { setSize(k); setSizeTouched(true); }}>{l}</button>)}
          </div>
          {error && <span className="dg-error">{error}</span>}
          <div className="row" style={{ gap: 8, marginLeft: 'auto' }}>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="button" className="btn primary" onClick={save}>{initial ? 'Update diagram' : 'Insert diagram'}</button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
