import { useRef, useState } from 'react';
import Toolbar from '../components/Toolbar';
import FormulaComposer from '../components/FormulaComposer';
import ShortcutHelp from '../components/ShortcutHelp';
import QuestionView from '../components/QuestionView';
import RichText from '../components/RichText';
import { insertSnippet } from '../lib/mathlive';
import { usedImageIds } from '../lib/parts';
import { safeEval, fmt } from '../lib/calc';
import { cls, uid, LETTERS } from '../lib/utils';
import { SUBJECTS, DIFFICULTIES } from '../data/constants';

const blankForm = (keep = {}) => ({
  subject: keep.subject || 'Engineering Mathematics',
  topic: keep.topic || '',
  difficulty: keep.difficulty || 'Medium',
  marks: keep.marks || 1,
  type: keep.type || 'mcq',
  text: '',
  options: ['', '', '', ''],
  correct: 0,
  answerExpr: '',
  tolerance: keep.tolerance != null ? keep.tolerance : 1,
  unit: '',
  explanation: '',
  images: {}, // diagrams: { id: { src, size, caption } }
});

const fromQuestion = (q) => ({
  ...blankForm(),
  ...q,
  options: (q.options || ['', '', '', '']).slice(),
  images: { ...(q.images || {}) },
  answerExpr: q.answerExpr != null ? q.answerExpr : q.answer != null ? String(q.answer) : '',
});

export default function Studio({ bank, setBank, editing, setEditing, toast, go }) {
  const [f, setF] = useState(() => (editing ? fromQuestion(editing) : blankForm()));
  const [active, setActive] = useState('text'); // which field the toolbar works on
  const [errors, setErrors] = useState([]);
  const [formKey, setFormKey] = useState(0); // bump to reload the editors after clearing
  const composers = useRef({}); // editor components by field key
  const activeMath = useRef(null); // the formula box that has the cursor (if any)

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setField = (k, v) =>
    setF((p) => {
      if (k.startsWith('opt')) {
        const o = p.options.slice();
        o[+k.slice(3)] = v;
        return { ...p, options: o };
      }
      return { ...p, [k]: v };
    });
  const resetForm = (next) => { setF(next); setFormKey((n) => n + 1); activeMath.current = null; };

  // Toolbar button pressed: put the symbol in the formula box with the cursor,
  // or add a new formula box if the cursor is in a words box.
  const insert = (snippet) => {
    const mf = activeMath.current;
    if (mf && mf.isConnected) insertSnippet(mf, snippet);
    else composers.current[active || 'text']?.addFormula(snippet);
  };

  // Diagrams are kept in f.images; the text only holds a [[img:id]] marker.
  const addImage = (img) => {
    const id = uid();
    setF((p) => ({ ...p, images: { ...p.images, [id]: img } }));
    return id;
  };
  // replace = true swaps in a whole new diagram (after editing it in the Diagram Studio)
  const changeImage = (id, changes, replace = false) =>
    setF((p) => ({ ...p, images: { ...p.images, [id]: replace ? changes : { ...p.images[id], ...changes } } }));

  // Props shared by every editor on the page.
  const editorProps = (key) => ({
    images: f.images,
    onAddImage: addImage,
    onImageChange: changeImage,
    onError: toast,
    ref: (c) => { composers.current[key] = c; },
    active: active === key,
    onWordsFocus: () => { setActive(key); activeMath.current = null; },
    onMathFocus: (el) => { setActive(key); activeMath.current = el; },
  });

  const computed = f.type === 'numeric' ? safeEval(f.answerExpr) : null;

  const validate = () => {
    const errs = [];
    if (!f.subject.trim()) errs.push('Add a subject.');
    if (!f.text.trim()) errs.push('Write the question text.');
    if (f.type === 'mcq') f.options.forEach((o, i) => { if (!o.trim()) errs.push('Fill in option ' + LETTERS[i] + '.'); });
    if (f.type === 'numeric' && computed == null) errs.push('Enter a correct answer as a number or expression, such as 1/(2*pi*sqrt(10e-3*1e-6)).');
    return errs;
  };

  const doSave = (another) => {
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;

    const q = {
      id: editing ? editing.id : uid(),
      createdAt: editing ? editing.createdAt : Date.now(),
      updatedAt: Date.now(),
      subject: f.subject.trim(),
      topic: f.topic.trim(),
      difficulty: f.difficulty,
      marks: Number(f.marks) || 1,
      type: f.type,
      text: f.text,
      explanation: f.explanation,
    };
    // Keep only the diagrams that are still used.
    const used = usedImageIds(f.text, f.explanation, ...(f.type === 'mcq' ? f.options : []));
    q.images = Object.fromEntries(Object.entries(f.images).filter(([id]) => used.has(id)));
    if (f.type === 'mcq') {
      q.options = f.options.slice();
      q.correct = f.correct;
    } else {
      q.answer = computed;
      q.answerExpr = f.answerExpr;
      q.tolerance = Number(f.tolerance) || 0;
      q.unit = f.unit.trim();
    }

    setBank((b) => (editing ? b.map((x) => (x.id === q.id ? q : x)) : [q, ...b]));
    toast(editing ? 'Question updated' : 'Question saved');

    if (editing && !another) { setEditing(null); go('bank'); return; }
    resetForm(blankForm(f));
    setEditing(null);
    setActive('text');
  };

  const subjectOptions = Array.from(new Set([...SUBJECTS, ...bank.map((q) => q.subject)]));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{editing ? 'Edit question' : 'Create question'}</h1>
          <p>Build each question from words (Aa), formulas (∑) and diagrams (◫). Formulas format as you type: x^2, sqrt, pi, +-. Diagrams open the Diagram Studio: circuits, beams, trusses, graphs, tables, flowcharts, logic gates and more.</p>
        </div>
        {editing && <button className="btn" onClick={() => { setEditing(null); resetForm(blankForm()); }}>Cancel editing</button>}
      </div>

      <div className="studio">
        <div className="sheet pad">
          {/* Question details */}
          <div className="meta-grid">
            <div className="field">
              <label htmlFor="subj">Subject</label>
              <input id="subj" className="inp" list="subjects" value={f.subject} onChange={(e) => set('subject', e.target.value)} />
              <datalist id="subjects">{subjectOptions.map((s) => <option key={s} value={s} />)}</datalist>
            </div>
            <div className="field">
              <label htmlFor="topic">Topic</label>
              <input id="topic" className="inp" value={f.topic} placeholder="e.g. Laplace transforms" onChange={(e) => set('topic', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="marks">Marks</label>
              <input id="marks" className="inp" type="number" min="1" max="20" value={f.marks} onChange={(e) => set('marks', e.target.value)} />
            </div>
          </div>

          <div className="row" style={{ marginTop: 14, gap: 18 }}>
            <div className="field">
              <span className="lbl">Difficulty</span>
              <div className="seg">
                {DIFFICULTIES.map((d) => (
                  <button key={d} type="button" className={cls(f.difficulty === d && 'on')} onClick={() => set('difficulty', d)}>{d}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="lbl">Answer type</span>
              <div className="seg">
                <button type="button" className={cls(f.type === 'mcq' && 'on')} onClick={() => set('type', 'mcq')}>4 options</button>
                <button type="button" className={cls(f.type === 'numeric' && 'on')} onClick={() => set('type', 'numeric')}>Numerical answer</button>
              </div>
            </div>
          </div>

          <Toolbar onInsert={insert} />
          <ShortcutHelp />

          <FormulaComposer key={formKey + '-text'} {...editorProps('text')} label="Question"
            value={f.text} onChange={(v) => setField('text', v)} wordsPlaceholder="e.g. Find the roots of" />

          <div className="divider" />

          {f.type === 'mcq' ? (
            <div>
              <span className="lbl">Options</span>
              <p className="hint" style={{ margin: '2px 0 12px' }}>Tap a letter to mark the correct answer. Use Aa for words, ∑ for a formula, ◫ for a diagram.</p>
              <div style={{ display: 'grid', gap: 12 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="opt-edit">
                    <button type="button" className={cls('correct-pick', f.correct === i && 'on')} aria-pressed={f.correct === i}
                      aria-label={'Mark option ' + LETTERS[i] + ' as correct'} onClick={() => set('correct', i)}>
                      {LETTERS[i]}
                    </button>
                    <FormulaComposer key={formKey + '-opt' + i} {...editorProps('opt' + i)} compact
                      value={f.options[i]} onChange={(v) => setField('opt' + i, v)} wordsPlaceholder={'Option ' + LETTERS[i]} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="meta-grid">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="ans">Correct answer</label>
                <input id="ans" className="inp" value={f.answerExpr} placeholder="Number or expression, e.g. 1/(2*pi*sqrt(10e-3*1e-6))"
                  onChange={(e) => set('answerExpr', e.target.value)} />
                <div className={cls('calc-out', f.answerExpr && computed == null && 'err')}>
                  {!f.answerExpr ? 'You can use pi, e, sqrt, sin, cos, log, ^ and scientific notation like 4.7e-6.'
                    : computed == null ? <b>Can’t calculate this yet. Check brackets and function names.</b>
                    : <>Calculated value: <b>{fmt(computed)}</b> {f.unit}</>}
                </div>
              </div>
              <div className="field">
                <label htmlFor="tol">Allowed error (%)</label>
                <input id="tol" className="inp" type="number" min="0" step="0.1" value={f.tolerance} onChange={(e) => set('tolerance', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="unit">Unit shown to students</label>
                <input id="unit" className="inp" value={f.unit} placeholder="e.g. Hz, m/s, %" onChange={(e) => set('unit', e.target.value)} />
              </div>
            </div>
          )}

          <div className="divider" />

          <FormulaComposer key={formKey + '-explanation'} {...editorProps('explanation')} label="Explanation (shown after the quiz)"
            value={f.explanation} onChange={(v) => setField('explanation', v)} wordsPlaceholder="Show the working so students can learn from mistakes." />

          {errors.length > 0 && (
            <div className="err-list" role="alert">
              <b>Fix these before saving:</b>
              <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          )}

          <div className="row" style={{ marginTop: 20 }}>
            <button className="btn primary lg" onClick={() => doSave(false)}>{editing ? 'Save changes' : 'Save question'}</button>
            {!editing && <button className="btn lg" onClick={() => doSave(true)}>Save and add another</button>}
            <button className="btn" onClick={() => { resetForm(blankForm(f)); setErrors([]); }}>Clear</button>
          </div>
        </div>

        {/* Live preview */}
        <aside className="preview-col">
          <div className="sheet pad">
            <h2 className="sec">Student preview</h2>
            <QuestionView q={f} placeholder
              selected={f.type === 'mcq' ? f.correct : undefined}
              onSelect={f.type === 'mcq' ? (i) => set('correct', i) : null}
              numeric={computed != null ? fmt(computed) : ''} />
            {f.explanation && (
              <div className="explain"><span className="lbl">Explanation</span><RichText src={f.explanation} images={f.images} /></div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
