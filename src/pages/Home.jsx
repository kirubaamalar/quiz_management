import { useMemo, useState } from 'react';
import Tex from '../components/Tex';
import { TOOLS } from '../data/tools';

const SHOWCASE = TOOLS.find((t) => t.templates).items.slice().reverse();

export default function Home({ bank, attempts }) {
  const [i, setI] = useState(0);
  const [name, latex] = SHOWCASE[i % SHOWCASE.length];

  const subjects = useMemo(() => {
    const m = {};
    bank.forEach((q) => { m[q.subject] = (m[q.subject] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [bank]);
  const best = attempts.length ? Math.max(...attempts.map((a) => a.pct)) : null;

  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <h1>Engineering questions, written the way they look on paper.</h1>
          <p>Staff build questions with real formulas using a tap-to-insert toolbar, check them in a live student preview, and run timed quizzes with instant marking and worked explanations.</p>
          <div className="row">
            <a className="btn primary lg" href="#studio">Create a question</a>
            <a className="btn lg" href="#quiz">Start a quiz</a>
          </div>
        </div>
        <div className="board">
          <div className="board-formula"><Tex src={'$$' + latex + '$$'} /></div>
          <div className="board-foot">
            <span className="board-name">{name}</span>
            <button className="btn sm amber" onClick={() => setI(i + 1)}>Show another formula</button>
          </div>
          <div className="board-latex" aria-label="Stored as">{latex}</div>
        </div>
      </section>

      <section className="stats">
        <div className="sheet stat"><b>{bank.length}</b><span>questions in the bank</span></div>
        <div className="sheet stat"><b>{subjects.length}</b><span>subjects covered</span></div>
        <div className="sheet stat"><b>{attempts.length}</b><span>quizzes taken</span></div>
        <div className="sheet stat"><b>{best == null ? '–' : best + '%'}</b><span>best score</span></div>
      </section>

      <section className="grid2">
        <div className="sheet pad">
          <h2 className="sec">Questions by subject</h2>
          {subjects.length ? (
            <div className="chips">
              {subjects.map(([s, n]) => <span key={s} className="chip">{s} <b>{n}</b></span>)}
            </div>
          ) : (
            <div className="empty"><p>No questions yet.</p><a className="btn primary" href="#studio">Create the first one</a></div>
          )}
        </div>
        <div className="sheet pad">
          <h2 className="sec">Recent quiz results</h2>
          {attempts.length ? (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Student</th><th>Date</th><th>Questions</th><th>Score</th></tr></thead>
                <tbody>
                  {attempts.slice(0, 6).map((a) => (
                    <tr key={a.id}>
                      <td>{a.name || 'Student'}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>{a.count}</td>
                      <td><b>{a.score}/{a.total}</b> ({a.pct}%)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty"><p>Results show up here after the first quiz.</p><a className="btn" href="#quiz">Take a quiz</a></div>
          )}
        </div>
      </section>
    </div>
  );
}
