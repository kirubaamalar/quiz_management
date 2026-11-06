import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import MathInput from './MathInput';
import { parseParts, serializeParts } from '../lib/parts';
import { fileToImage, isImageFile, dataUrlKB } from '../lib/images';
import DiagramStudio from '../diagrams/DiagramStudio';
import FigureView from '../diagrams/FigureView';
import { DIAGRAM_TYPES, figType } from '../diagrams/registry';
import { cls, uid } from '../lib/utils';

const newPart = (kind, extra = {}) => ({ id: uid(), kind, value: '', display: false, ...extra });
const SIZES = [['s', 'Small'], ['m', 'Medium'], ['l', 'Large'], ['full', 'Full width']];

const TYPE_NAMES = Object.fromEntries(DIAGRAM_TYPES.map((t) => [t.key, t.icon + ' ' + t.label]));

/** Editing controls for one diagram in the editor. */
function FigurePart({ fig, onChange, onEdit, compact }) {
  if (!fig) return <div className="img-part">Diagram missing. <button type="button" className="btn sm" onClick={onEdit}>Choose a new one</button></div>;
  const type = figType(fig);
  return (
    <div className={cls('img-part', compact && 'compact')}>
      <button type="button" className="fig-thumb" onClick={onEdit} title="Edit this diagram"><FigureView fig={fig} /></button>
      <div className="img-tools">
        {!compact && (
          <input className="inp" value={fig.caption || ''} placeholder="Caption (optional), e.g. Fig. 1 – RC circuit"
            onChange={(e) => onChange({ caption: e.target.value })} />
        )}
        <div className="row" style={{ gap: 8 }}>
          <div className="seg mini" role="group" aria-label="Diagram size">
            {SIZES.map(([k, label]) => (
              <button key={k} type="button" className={cls((fig.size || 'm') === k && 'on')} onClick={() => onChange({ size: k })}>{label}</button>
            ))}
          </div>
          <button type="button" className="btn sm" onClick={onEdit}>Edit</button>
          <span className="hint">{TYPE_NAMES[type]}{type === 'image' && fig.src ? ' · ' + dataUrlKB(fig.src) + ' KB' : ''}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Editor made of parts: Words boxes, Formula boxes and Diagrams.
 * Staff never see the saved text format; it is built automatically.
 */
const FormulaComposer = forwardRef(function FormulaComposer(
  { label, value, onChange, onWordsFocus, onMathFocus, active, compact, wordsPlaceholder = 'Type words here',
    images = {}, onAddImage, onImageChange, onError },
  ref
) {
  const [parts, setParts] = useState(() => {
    const p = parseParts(value);
    return p.length ? p : [newPart('text')];
  });
  const [focusId, setFocusId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const lastIdx = useRef(parts.length - 1);
  const partsRef = useRef(parts); // always the newest parts, even between renders
  partsRef.current = parts;
  const [studio, setStudio] = useState(null); // { at: part index or null, editId: figure id or null }

  const commit = (next) => {
    partsRef.current = next;
    setParts(next);
    onChange(serializeParts(next));
  };
  const patch = (i, changes) => commit(partsRef.current.map((p, k) => (k === i ? { ...p, ...changes } : p)));
  const patchById = (id, changes) => commit(partsRef.current.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  const replaceAt = (i, part) => commit(partsRef.current.map((p, k) => (k === i ? part : p)));
  const insertAfter = (i, part, focus = true) => {
    const cur = partsRef.current;
    const at = Math.min(i, cur.length - 1);
    lastIdx.current = at + 1;
    if (focus) setFocusId(part.id);
    commit([...cur.slice(0, at + 1), part, ...cur.slice(at + 1)]);
  };
  const remove = (i) => {
    const cur = partsRef.current;
    if (cur.length === 1) return commit([newPart('text')]);
    commit(cur.filter((_, k) => k !== i));
  };

  // ---- diagrams ----
  const addFiles = async (files, targetIdx) => {
    const list = files.filter(isImageFile);
    if (!list.length) { onError && onError('Choose an image file: PNG, JPG, WebP or SVG.'); return; }
    for (const file of list) {
      try {
        const img = await fileToImage(file);
        if (compact) img.size = 's'; // answer options: small by default
        const id = onAddImage(img);
        const part = newPart('image', { value: id });
        const cur = partsRef.current;
        const i = targetIdx != null ? targetIdx : Math.min(lastIdx.current, cur.length - 1);
        const target = cur[i];
        // Replace the chosen part, or an empty words box; otherwise add after it.
        if (targetIdx != null || (target && target.kind === 'text' && !target.value.trim())) replaceAt(i, part);
        else insertAfter(i, part, false);
        targetIdx = null;
      } catch (err) {
        onError && onError(err.message);
      }
    }
  };
  const onPaste = (e) => {
    const files = Array.from(e.clipboardData?.files || []).filter(isImageFile);
    if (files.length) { e.preventDefault(); addFiles(files, null); }
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer?.files || []), null);
  };

  // Lets the toolbar add a formula box when the cursor is in a words box.
  useImperativeHandle(ref, () => ({
    addFormula(snippet) {
      const cur = partsRef.current;
      const i = Math.min(lastIdx.current, cur.length - 1);
      const target = cur[i];
      const part = newPart('math', { initialInsert: snippet });
      if (target && target.kind === 'text' && !target.value.trim()) { setFocusId(part.id); replaceAt(i, part); }
      else insertAfter(i, part);
    },
  }));

  const openStudio = (at, editId = null) => setStudio({ at, editId });
  const saveFigure = (fig) => {
    const st = studio;
    setStudio(null);
    if (st.editId) { onImageChange(st.editId, fig, true); return; }
    const id = onAddImage(fig);
    const part = newPart('image', { value: id });
    const cur = partsRef.current;
    const i = st.at != null ? st.at : Math.min(lastIdx.current, cur.length - 1);
    const target = cur[i];
    if (st.at != null || (target && target.kind === 'text' && !target.value.trim())) replaceAt(i, part);
    else insertAfter(i, part, false);
  };

  const setKind = (i, p, kind) => {
    if (p.kind === kind) return;
    if (kind === 'image') return openStudio(i);
    setFocusId(p.id);
    patch(i, { kind, value: '' });
  };

  return (
    <div className={cls('composer', active && 'active', compact && 'compact', dragging && 'drag')}
      onPaste={onPaste}
      onDragOver={(e) => { if (Array.from(e.dataTransfer?.types || []).includes('Files')) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}>
      {label && <span className="lbl">{label}</span>}

      <div className="parts">
        {parts.map((p, i) => (
          <div key={p.id} className={cls('part', p.kind)}>
            <div className="seg mini" role="group" aria-label="Box type">
              <button type="button" title="Words" className={cls(p.kind === 'text' && 'on')} onClick={() => setKind(i, p, 'text')}>Aa</button>
              <button type="button" title="Formula" className={cls(p.kind === 'math' && 'on')} onClick={() => setKind(i, p, 'math')}>∑</button>
              <button type="button" title="Diagram" className={cls(p.kind === 'image' && 'on')} onClick={() => setKind(i, p, 'image')}>◫</button>
            </div>

            {p.kind === 'text' && (
              <textarea className="ta-text" rows={compact ? 1 : 2} value={p.value} placeholder={wordsPlaceholder}
                autoFocus={focusId === p.id}
                onFocus={() => { lastIdx.current = i; onWordsFocus && onWordsFocus(); }}
                onChange={(e) => patch(i, { value: e.target.value })} />
            )}
            {p.kind === 'math' && (
              <MathInput key={p.id + p.kind} value={p.value} placeholder="Type a formula"
                autoFocus={focusId === p.id} initialInsert={p.initialInsert}
                onFocus={(el) => { lastIdx.current = i; onMathFocus && onMathFocus(el); }}
                onChange={(v) => patchById(p.id, { value: v })} />
            )}
            {p.kind === 'image' && (
              <FigurePart fig={images[p.value]} compact={compact}
                onChange={(changes) => onImageChange(p.value, changes)}
                onEdit={() => (images[p.value] ? openStudio(i, p.value) : openStudio(i))} />
            )}

            <div className="part-extra">
              {p.kind === 'math' && !compact && (
                <label className="own-line" title="Show this formula centred on its own line">
                  <input type="checkbox" checked={!!p.display} onChange={(e) => patch(i, { display: e.target.checked })} />
                  Own line
                </label>
              )}
              {(parts.length > 1 || p.value) && (
                <button type="button" className="part-x" aria-label="Remove this box" onClick={() => remove(i)}>×</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {studio && (
        <DiagramStudio initial={studio.editId ? images[studio.editId] : null} compact={compact}
          onSave={saveFigure} onClose={() => setStudio(null)} />
      )}

      {!compact && (
        <div className="part-add">
          <button type="button" className="btn sm" onClick={() => insertAfter(parts.length - 1, newPart('text'))}>+ Words</button>
          <button type="button" className="btn sm" onClick={() => insertAfter(parts.length - 1, newPart('math'))}>+ Formula</button>
          <button type="button" className="btn sm" onClick={() => { lastIdx.current = partsRef.current.length - 1; openStudio(null); }}>+ Diagram</button>
          <span className="hint drop-hint">or paste (Ctrl+V) / drop an image here</span>
        </div>
      )}
    </div>
  );
});

export default FormulaComposer;
