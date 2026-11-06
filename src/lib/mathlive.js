// MathLive = the visual formula editor staff type into (like MathQuill).
import { MathfieldElement } from 'mathlive';

MathfieldElement.fontsDirectory = '/mathlive/fonts'; // copied by scripts/copy-assets.js
MathfieldElement.soundsDirectory = null; // no key click sounds

/**
 * Inserts a toolbar snippet into a formula box.
 * '#' in the snippet marks where the cursor goes (or wraps the selected part).
 */
export function insertSnippet(mf, snippet) {
  const hasHole = snippet.includes('#');
  const latex = hasHole ? snippet.replace('#', mf.selectionIsCollapsed ? '#?' : '#0') : snippet;
  mf.focus();
  mf.insert(latex, {
    insertionMode: 'replaceSelection',
    selectionMode: hasHole ? 'placeholder' : 'after',
    format: 'latex',
  });
}
