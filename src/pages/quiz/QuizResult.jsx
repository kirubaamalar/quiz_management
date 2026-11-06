import { useState } from 'react';
import QuestionView from '../../components/QuestionView';
import ScoreRing from '../../components/ScoreRing';
import RichText from '../../components/RichText';
import { fmt } from '../../lib/calc';
import { cls, mmss } from '../../lib/utils';

export default function QuizResult({ session, onRetake, onNew }) {
  const res = session.result;
  const [filter, setFilter] = useState('all');
  const shown = session.items
    .map((it, i) => ({ it, i, g: res.grades[i] }))
    .filter((x) => filter === 'all' || !x.g.correct);
  const heading = res.pct >= 75 ? 'Well done' : res.pct >= 40 ? 'Good effort' : 'Keep practising';

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{heading}{session.name ? ', ' + session.name : ''}</h1>
          <p>Finished in {mmss(res.duration)}. Review the working below.</p>
        </div>
        <div className="row">
          <button className="btn" onClick={onRetake}>Retake same questions</button>
          <button className="btn primary" onClick={onNew}>New quiz</button>
        </div>
      </div>

      <div className="sheet pad result-hero">
        <ScoreRing pct={res.pct} />
        <div>
          <div className="summary-big">{res.score}<span style={{ fontSize: '.45em', color: 'var(--ink-3)' }}> / {res.total} marks</span></div>
          <div className="rcounts">
            <div className="rc ok"><b>{res.correct}</b>correct</div>
            <div className="rc bad"><b>{res.wrong}</b>incorrect</div>
            <div className="rc skip"><b>{res.skipped}</b>skipped</div>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 22, justifyContent: 'space-between' }}>
        <h2 className="sec" style={{ margin: 0 }}>Answer review</h2>
        <div className="seg">
          <button className={cls(filter === 'all' && 'on')} onClick={() => setFilter('all')}>All</button>
          <button className={cls(filter === 'wrong' && 'on')} onClick={() => setFilter('wrong')}>Needs work</button>
        </div>
      </div>

      <div className="review">
        {shown.map(({ it, i, g }) => {
          const status = g.correct ? 'ok' : g.answered ? 'bad' : 'skip';
          const color = g.correct ? 'var(--ok)' : g.answered ? 'var(--bad)' : 'var(--ink-3)';
          return (
            <article key={i} className={cls('sheet', 'rv', status)}>
              <div className="rv-head">
                <span>Question {i + 1}</span>
                <span style={{ color }}>{g.correct ? '+' + (it.q.marks || 1) + ' correct' : g.answered ? 'Incorrect' : 'Not answered'}</span>
              </div>
              <QuestionView q={it.q} order={it.order} reveal
                selected={it.q.type === 'mcq' ? session.answers[i] : undefined}
                numeric={it.q.type === 'numeric' ? session.answers[i] || '' : ''} />
              {it.q.type === 'numeric' && (
                <div className="calc-out">
                  Your value: <b style={{ color: g.correct ? 'var(--ok)' : 'var(--bad)' }}>{g.answered ? fmt(g.value) : '–'}</b>
                  {'  '}Correct: <b>{fmt(it.q.answer)} {it.q.unit}</b> (±{it.q.tolerance}%)
                </div>
              )}
              {it.q.explanation && (
                <div className="explain"><span className="lbl">Explanation</span><RichText src={it.q.explanation} images={it.q.images} /></div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
