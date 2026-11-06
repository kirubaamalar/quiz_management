import { uid } from './utils';

/**
 * A question is stored as one string: words plus formulas in $...$ (inline) or $$...$$ (own line).
 * In the editor it is split into "parts" so staff never see the $ signs or LaTeX codes.
 * Diagrams are stored as [[img:ID]] tokens; the pictures themselves live in question.images[ID].
 *   "Find $x^2$ when"  <->  [{kind:'text', value:'Find'}, {kind:'math', value:'x^2'}, {kind:'text', value:'when'}]
 */
export function parseParts(str = '') {
  const out = [];
  let buf = '';
  const pushText = () => {
    const t = buf.trim();
    if (t) out.push({ id: uid(), kind: 'text', value: t });
    buf = '';
  };

  let i = 0;
  while (i < str.length) {
    const c = str[i];
    if (c === '[' && str.startsWith('[[img:', i)) { // diagram token: [[img:ID]]
      const end = str.indexOf(']]', i);
      if (end > 0) {
        pushText();
        out.push({ id: uid(), kind: 'image', value: str.slice(i + 6, end) });
        i = end + 2;
        continue;
      }
    }
    if (c === '\\' && str[i + 1] === '$') { buf += '$'; i += 2; continue; } // escaped dollar in words
    if (c !== '$') { buf += c; i++; continue; }

    const display = str[i + 1] === '$';
    let j = i + (display ? 2 : 1);
    let latex = '';
    let closed = false;
    while (j < str.length) {
      const d = str[j];
      if (d === '\\') { latex += d + (str[j + 1] || ''); j += 2; continue; }
      if (d === '$') {
        if (!display) { closed = true; j += 1; break; }
        if (str[j + 1] === '$') { closed = true; j += 2; break; }
      }
      latex += d;
      j++;
    }
    if (!closed) { buf += str.slice(i); break; } // unfinished formula: keep as words
    pushText();
    // \displaystyle is added automatically when saving; hide it from the editor.
    out.push({ id: uid(), kind: 'math', value: latex.trim().replace(/^\\displaystyle\s*/, ''), display });
    i = j;
  }
  pushText();
  return out;
}

/** MathLive writes a few of its own commands; convert them to standard LaTeX for display. */
export function toStandardLatex(latex) {
  return latex
    .replace(/\\placeholder(\[[^\]]*\])?\{[^}]*\}/g, '{}')
    .replace(/\\mleft/g, '\\left')
    .replace(/\\mright/g, '\\right')
    .replace(/\\exponentialE/g, 'e')
    .replace(/\\imaginaryI/g, 'i')
    .replace(/\\imaginaryJ/g, 'j')
    .replace(/\\differentialD/g, 'd')
    .replace(/\\degree/g, '^{\\circ}');
}

const join = (a, b) => (!a ? b : /\s$/.test(a) ? a + b : a + ' ' + b);

export function serializeParts(parts) {
  let s = '';
  for (const p of parts) {
    const v = p.kind === 'math' ? toStandardLatex((p.value || '').trim()) : (p.value || '').trim();
    if (!v) continue;
    if (p.kind === 'image') s = s.replace(/\s+$/, '') + (s ? '\n' : '') + '[[img:' + v + ']]\n';
    else if (p.kind === 'text') s = join(s, v.replace(/\$/g, '\\$'));
    else if (p.display) s = s.replace(/\s+$/, '') + (s ? '\n' : '') + '$$' + v + '$$\n';
    else s = join(s, '$\\displaystyle ' + v + '$'); // full-size fractions inside sentences
  }
  return s.trim();
}

const IMG_TOKEN = /\[\[img:([A-Za-z0-9_-]+)\]\]/g;

/** Splits saved text into text and diagram segments for display. */
export function splitImages(str = '') {
  const segs = [];
  let last = 0;
  for (const m of str.matchAll(IMG_TOKEN)) {
    const before = str.slice(last, m.index).trim();
    if (before) segs.push({ type: 'text', value: before });
    segs.push({ type: 'img', id: m[1] });
    last = m.index + m[0].length;
  }
  const rest = str.slice(last).trim();
  if (rest || !segs.length) segs.push({ type: 'text', value: rest });
  return segs;
}

/** IDs of all diagrams used in the given strings. */
export function usedImageIds(...strings) {
  const ids = new Set();
  for (const s of strings) for (const m of String(s || '').matchAll(IMG_TOKEN)) ids.add(m[1]);
  return ids;
}
