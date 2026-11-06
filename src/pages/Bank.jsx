import { useState } from 'react';
import RichText from '../components/RichText';
import { fmt } from '../lib/calc';
import { uid, LETTERS } from '../lib/utils';
import { DIFFICULTIES } from '../data/constants';

export default function Bank({ bank, setBank, onEdit, toast }) {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [modal, setModal] = useState(null); // 'import' | 'export' | null
  const [importText, setImportText] = useState('');

  const subjects = Array.from(new Set(bank.map((q) => q.subject))).sort();
  const list = bank.filter((q) =>
    (subject === 'All' || q.subject === subject) &&
    (difficulty === 'All' || q.difficulty === difficulty) &&
    (!search || (q.text + ' ' + q.topic + ' ' + q.subject).toLowerCase().includes(search.toLowerCase()))
  );

  const remove = (q) => {
    if (window.confirm('Delete this question? This can’t be undone.')) {
      setBank((b) => b.filter((x) => x.id !== q.id));
      toast('Question deleted');
    }
  };
  const duplicate = (q) => {
    setBank((b) => [{ ...q, id: uid(), createdAt: Date.now() }, ...b]);
    toast('Question duplicated');
  };
  const doImport = () => {
    try {
      const data = JSON.parse(importText);
      const arr = Array.isArray(data) ? data : data.questions;
      if (!Array.isArray(arr)) throw new Error('not a list');
      const clean = arr.filter((q) => q && q.text && (q.type === 'mcq' || q.type === 'numeric')).map((q) => ({ ...q, id: uid() }));
      setBank((b) => [...clean, ...b]);
      toast('Imported ' + clean.length + ' questions');
      setModal(null);
      setImportText('');
    } catch {
      toast('That isn’t valid question JSON');
    }
  };

  const exportText = JSON.stringify(bank, null, 2);
  const copy = async () => {
    try { await navigator.clipboard.writeText(exportText); toast('Copied to clipboard'); }
    catch { document.getElementById('exp')?.select(); toast('Press Ctrl+C to copy'); }
  };
  const download = () => {
    const blob = new Blob([exportText], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'formuladesk-questions.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const uploadFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setImportText);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Question bank</h1>
          <p>{bank.length} questions saved in this browser. Export them to move to another computer.</p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setModal('import')}>Import</button>
          <button className="btn" onClick={() => setModal('export')}>Export</button>
          <a className="btn primary" href="#studio">New question</a>
        </div>
      </div>

      <div className="filters">
        <input className="inp" type="search" aria-label="Search" placeholder="Search questions, topics, subjects" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="sel" aria-label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="All">All subjects</option>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="sel" aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="All">All difficulties</option>
          {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="sheet empty">
          <p>{bank.length ? 'No questions match these filters.' : 'The bank is empty.'}</p>
          <a className="btn primary" href="#studio">Create a question</a>
        </div>
      ) : (
        <div className="qlist">
          {list.map((q) => (
            <article key={q.id} className="sheet qcard">
              <div>
                <div className="qv-meta">
                  <span className="pill">{q.subject}</span>
                  {q.topic && <span className="pill ghost">{q.topic}</span>}
                  <span className={'pill ' + (q.difficulty || '').toLowerCase()}>{q.difficulty}</span>
                  <span className="pill ghost">{q.type === 'mcq' ? '4 options' : 'Numerical'}</span>
                  <span className="pill ghost">{q.marks} {Number(q.marks) === 1 ? 'mark' : 'marks'}</span>
                </div>
                <RichText src={q.text} images={q.images} className="qv-text" />
                <div className="qcard-ans">
                  <span>Answer:</span>
                  {q.type === 'mcq' ? (
                    <span className="row" style={{ gap: 8 }}><b>{LETTERS[q.correct]}</b><RichText as="span" src={q.options[q.correct]} images={q.images} /></span>
                  ) : (
                    <span><b style={{ color: 'var(--ok)' }}>{fmt(q.answer)} {q.unit}</b> (±{q.tolerance}%)</span>
                  )}
                </div>
              </div>
              <div className="qcard-actions">
                <button className="btn sm" onClick={() => onEdit(q)}>Edit</button>
                <button className="btn sm" onClick={() => duplicate(q)}>Duplicate</button>
                <button className="btn sm danger" onClick={() => remove(q)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="sheet pad modal" role="dialog" aria-modal="true">
            {modal === 'export' ? (
              <div>
                <h3>Export questions</h3>
                <p className="hint">Download the file or copy the text, then use Import on another computer.</p>
                <textarea id="exp" className="ta" rows={14} readOnly value={exportText} />
                <div className="row" style={{ marginTop: 14 }}>
                  <button className="btn primary" onClick={download}>Download file</button>
                  <button className="btn" onClick={copy}>Copy JSON</button>
                  <button className="btn" onClick={() => setModal(null)}>Close</button>
                </div>
              </div>
            ) : (
              <div>
                <h3>Import questions</h3>
                <p className="hint">Choose an exported file or paste the JSON. Imported questions are added to the bank.</p>
                <input type="file" accept=".json,application/json" onChange={uploadFile} style={{ marginBottom: 10 }} />
                <textarea className="ta" rows={12} value={importText} onChange={(e) => setImportText(e.target.value)}
                  placeholder='[{"subject":"Electrical","type":"mcq", ...}]' />
                <div className="row" style={{ marginTop: 14 }}>
                  <button className="btn primary" disabled={!importText.trim()} onClick={doImport}>Import questions</button>
                  <button className="btn" onClick={() => setModal(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
