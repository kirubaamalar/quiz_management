import { useState } from 'react';
import { cls, shuffle, uid } from '../../lib/utils';
import { DIFFICULTIES } from '../../data/constants';

export default function QuizSetup({ bank, onStart }) {
  const subjects = Array.from(new Set(bank.map((q) => q.subject))).sort();
  const [name, setName] = useState('');
  const [picked, setPicked] = useState([]);
  const [difficulty, setDifficulty] = useState('Any');
  const [count, setCount] = useState(5);
  const [minutes, setMinutes] = useState(10);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);

  const pool = bank.filter((q) =>
    (picked.length === 0 || picked.includes(q.subject)) && (difficulty === 'Any' || q.difficulty === difficulty)
  );
  const n = Math.min(count, pool.length);
  const toggle = (s) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const start = () => {
    const chosen = (shuffleQuestions ? shuffle(pool) : pool).slice(0, n);
    onStart({
      id: uid(),
      name: name.trim(),
      startedAt: Date.now(),
      endsAt: minutes ? Date.now() + minutes * 60000 : null,
      current: 0,
      answers: {},
      flags: {},
      done: false,
      items: chosen.map((q) => ({
        q,
        order: q.type === 'mcq' ? (shuffleOptions ? shuffle([0, 1, 2, 3]) : [0, 1, 2, 3]) : null,
      })),
    });
  };

  if (bank.length === 0) {
    return (
      <div className="sheet empty">
        <p>There are no questions to quiz on yet.</p>
        <a className="btn primary" href="#studio">Create a question</a>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div><h1>Take a quiz</h1><p>Pick subjects and settings. Answers are marked as soon as you submit.</p></div>
      </div>
      <div className="setup">
        <div className="sheet pad" style={{ display: 'grid', gap: 22 }}>
          <div className="field">
            <label htmlFor="sname">Your name</label>
            <input id="sname" className="inp" value={name} placeholder="e.g. Priya R, 2nd year ECE" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <span className="lbl">Subjects</span>
            <span className="hint">Leave all unselected to include every subject.</span>
            <div className="chips" style={{ marginTop: 6 }}>
              {subjects.map((s) => (
                <button key={s} type="button" className={cls('chip', picked.includes(s) && 'on')} aria-pressed={picked.includes(s)} onClick={() => toggle(s)}>
                  {s} <b>{bank.filter((q) => q.subject === s).length}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="lbl">Difficulty</span>
            <div className="seg">
              {['Any', ...DIFFICULTIES].map((d) => (
                <button key={d} type="button" className={cls(difficulty === d && 'on')} onClick={() => setDifficulty(d)}>{d}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="cnt">Number of questions</label>
            <div className="range-row">
              <input id="cnt" type="range" min="1" max={Math.max(1, pool.length)} value={n} disabled={!pool.length} onChange={(e) => setCount(+e.target.value)} />
              <span className="range-val">{n}</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="min">Time limit (minutes, 0 for no limit)</label>
            <div className="range-row">
              <input id="min" type="range" min="0" max="120" step="5" value={minutes} onChange={(e) => setMinutes(+e.target.value)} />
              <span className="range-val">{minutes}</span>
            </div>
          </div>
          <div className="row" style={{ gap: 22 }}>
            <label className="toggle"><input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} />Shuffle questions</label>
            <label className="toggle"><input type="checkbox" checked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} />Shuffle options</label>
          </div>
        </div>

        <div className="sheet pad">
          <h2 className="sec">This quiz</h2>
          <div className="summary-big">{n}</div>
          <p style={{ marginTop: 6, color: 'var(--ink-2)' }}>
            {n === 1 ? 'question' : 'questions'} from {pool.length} available{minutes ? ', ' + minutes + ' minutes' : ', no time limit'}.
          </p>
          <p className="hint">A scientific calculator is available during the quiz. Numerical answers accept expressions like <code>sqrt(2*9.81*5)</code>.</p>
          <button className="btn primary lg" style={{ width: '100%', marginTop: 12 }} disabled={!n} onClick={start}>
            {n ? 'Start quiz' : 'No questions match'}
          </button>
        </div>
      </div>
    </div>
  );
}
