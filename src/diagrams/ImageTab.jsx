// Image upload (backup option). Images are shrunk and compressed before saving.
import { useRef, useState } from 'react';
import { fileToImage, isImageFile, dataUrlKB } from '../lib/images';

export function ImageEditor({ value, onChange }) {
  const ref = useRef(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const take = async (file) => {
    if (!file) return;
    if (!isImageFile(file)) { setErr('Choose an image file: PNG, JPG, WebP or SVG.'); return; }
    setBusy(true); setErr('');
    try {
      const before = Math.round(file.size / 1024);
      const img = await fileToImage(file);
      onChange({ src: img.src, before });
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="dg-form">
      <div className={'drop-zone' + (drag ? ' on' : '')}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files?.[0]); }}
        onPaste={(e) => take(Array.from(e.clipboardData?.files || [])[0])} tabIndex={0}>
        <p><b>Drop an image here</b>, paste it (Ctrl+V), or</p>
        <button type="button" className="btn primary" onClick={() => ref.current?.click()}>{busy ? 'Compressing…' : 'Choose an image'}</button>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {err && <span className="dg-error">{err}</span>}
      {value.src && (
        <p className="hint">
          Saved size: <b>{dataUrlKB(value.src)} KB</b>
          {value.before ? <> (original {value.before} KB, {Math.max(0, Math.round(100 - (dataUrlKB(value.src) / value.before) * 100))}% smaller)</> : null}
        </p>
      )}
      <p className="hint">Use an image only when the other tools can’t draw it, such as photos of equipment or scanned sketches. Drawn diagrams are about 100 times smaller and stay sharp at any size.</p>
    </div>
  );
}

export function ImageView({ data }) {
  return data.src ? <img src={data.src} alt="" className="fig-img" /> : <div className="dg-empty">No image chosen</div>;
}
