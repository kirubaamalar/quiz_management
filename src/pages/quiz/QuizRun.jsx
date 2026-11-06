import { useEffect, useRef, useState } from 'react';
import QuestionView from '../../components/QuestionView';
import Calculator from '../../components/Calculator';
import { safeEval, fmt } from '../../lib/calc';
import { cls, mmss } from '../../lib/utils';

export default function QuizRun({ session, setSession, onSubmit }) {
  const [now, setNow] = useState(Date.now());
  const [showCalc, setShowCalc] = useState(false);
  const submitted = useRef(false);
  const { items, current, answers, flags } = session;
  const item = items[current];
  const remaining = session.endsAt ? (session.endsAt - now) / 1000 : null;

  const submit = () => {
    if (submitted.current) return;
    submitted.current = true;
    onSubmit();
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (remaining != null && remaining <= 0) submit(); // time up: auto-submit
  }, [remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAnswered = (i) => answers[i] !== undefined && answers[i] !== '';
  const answeredCount = items.filter((_, i) => isAnswered(i)).length;
  const setAnswer = (v) => setSession((s) => ({ ...s, answers: { ...s.answers, [s.current]: v } }));
  const goTo = (i) => setSession((s) => ({ ...s, current: Math.max(0, Math.min(items.length - 1, i)) }));
  const toggleFlag = () => setSession((s) => ({ ...s, flags: { ...s.flags, [s.current]: !s.flags[s.current] } }));
  const clearAnswer = () => setSession((s) => { const a = { ...s.answers }; delete a[s.current]; return { ...s, answers: a }; });
  const trySubmit = () => {
    const left = items.length - answeredCount;
    if (left === 0 || window.confirm(left + (left === 1 ? ' question is' : ' questions are') + ' unanswered. Submit anyway?')) submit();
  };

  const isNumeric = item.q.type === 'numeric';
  const typedValue = isNumeric && answers[current] ? safeEval(answers[current]) : null;

  return (
    <div>
      <div className="runbar">
        <div className="progress" aria-label={answeredCount + ' of ' + items.length + ' answered'}>
          <i style={{ width: (answeredCount / items.length) * 100 + '%' }} />
        </div>
        <span className="hint">{answeredCount}/{items.length} answered</span>
        {remaining != null && <span className={cls('timer', remaining < 60 && 'low')} aria-live="polite">{mmss(remaining)}</span>}
      </div>

      <div className="run">
        <div className="sheet pad">
          <div className="qnum"><b>{current + 1}</b>of {items.length}</div>
          <QuestionView q={item.q} order={item.order} big
            selected={!isNumeric ? answers[current] : undefined} onSelect={!isNumeric ? setAnswer : null}
            numeric={isNumeric ? answers[current] : ''} onNumeric={isNumeric ? setAnswer : null} />
          {isNumeric && answers[current] && (
            <div className="calc-out">
              {typedValue == null
                ? <span style={{ color: 'var(--bad)' }}>This isn’t a valid number or expression yet.</span>
                : <>Will be marked as <b>{fmt(typedValue)}</b> {item.q.unit}</>}
            </div>
          )}
          <div className="run-actions">
            <div className="row">
              <button className="btn" disabled={current === 0} onClick={() => goTo(current - 1)}>Previous</button>
              <button className="btn" aria-pressed={!!flags[current]} onClick={toggleFlag}>{flags[current] ? 'Remove review flag' : 'Flag for review'}</button>
              {answers[current] !== undefined && <button className="btn" onClick={clearAnswer}>Clear answer</button>}
            </div>
            {current < items.length - 1
              ? <button className="btn primary" onClick={() => goTo(current + 1)}>Next question</button>
              : <button className="btn amber" onClick={trySubmit}>Submit quiz</button>}
          </div>
        </div>

        <aside className="sheet pad">
          <h2 className="sec" style={{ fontSize: 19 }}>Questions</h2>
          <div className="navgrid">
            {items.map((_, i) => (
              <button key={i} aria-label={'Question ' + (i + 1)} onClick={() => goTo(i)}
                className={cls('navcell', isAnswered(i) && 'ans', i === current && 'cur', flags[i] && 'flag')}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="legend">
            <span><i style={{ background: 'var(--steel-soft)', borderColor: 'var(--steel)' }} />Answered</span>
            <span><i style={{ background: 'var(--flag)', borderColor: 'var(--flag)', borderRadius: '50%' }} />Flagged</span>
          </div>
          <button className="btn amber" style={{ width: '100%', marginTop: 18 }} onClick={trySubmit}>Submit quiz</button>
        </aside>
      </div>

      {showCalc
        ? <Calculator onClose={() => setShowCalc(false)} />
        : <button className="btn primary lg calc-fab" onClick={() => setShowCalc(true)}>Calculator</button>}
    </div>
  );
}
