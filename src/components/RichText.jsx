import { createElement, useState } from 'react';
import { createPortal } from 'react-dom';
import Tex from './Tex';
import FigureView from '../diagrams/FigureView';
import { splitImages } from '../lib/parts';
import { cls } from '../lib/utils';

/** One diagram or image. Click to view it full screen (unless it sits inside an answer option). */
function Figure({ fig, zoomable }) {
  const [open, setOpen] = useState(false);
  if (!fig) return <span className="fig fig-missing">Diagram missing</span>;
  return (
    <span className={cls('fig', 'fig-' + (fig.size || 'm'))}>
      <span className={cls('fig-body', zoomable && 'zoomable')} title={zoomable ? 'Click to enlarge' : undefined}
        onClick={zoomable ? (e) => { e.stopPropagation(); setOpen(true); } : undefined}>
        <FigureView fig={fig} />
      </span>
      {fig.caption && <span className="fig-cap">{fig.caption}</span>}
      {open && createPortal(
        <div className="lightbox" role="dialog" aria-label="Diagram" onClick={() => setOpen(false)}>
          <div className="lightbox-body"><FigureView fig={fig} /></div>
          {fig.caption && <span className="lightbox-cap">{fig.caption}</span>}
        </div>,
        document.body
      )}
    </span>
  );
}

/**
 * Shows saved question text: words, $formulas$ and [[img:ID]] diagrams.
 * `images` is the question's figures object: { ID: { type, data | src, size, caption } }.
 */
export default function RichText({ src, images, className = '', as = 'div', zoomable = true }) {
  const segs = splitImages(src);
  if (segs.length === 1 && segs[0].type === 'text') return <Tex src={src} className={className} as={as} />;
  return createElement(
    as,
    { className: cls('rich', className) },
    segs.map((s, i) =>
      s.type === 'text'
        ? <Tex key={i} as="span" className="rich-text" src={s.value} />
        : <Figure key={i} fig={images && images[s.id]} zoomable={zoomable} />
    )
  );
}
