import RichText from './RichText';
import { cls, LETTERS } from '../lib/utils';

/** Shows one question the way a student sees it. Used in the preview, the quiz and the review. */
export default function QuestionView({ q, order, selected, onSelect, reveal, numeric, onNumeric, placeholder, big }) {
  const ord = order || [0, 1, 2, 3];
  const diff = (q.difficulty || '').toLowerCase();

  return (
    <div>
      <div className="qv-meta">
        {q.subject && <span className="pill">{q.subject}</span>}
        {q.topic && <span className="pill ghost">{q.topic}</span>}
        {q.difficulty && <span className={'pill ' + diff}>{q.difficulty}</span>}
        <span className="pill ghost">{q.marks || 1} {Number(q.marks) === 1 ? 'mark' : 'marks'}</span>
      </div>

      <RichText src={q.text || (placeholder ? 'Your question appears here as students will see it.' : '')}
        images={q.images} className={cls('qv-text', big && 'big')} />

      {q.type === 'mcq' ? (
        <div className="opts" role="radiogroup" aria-label="Answer options">
          {ord.map((oi, pos) => {
            const isSel = selected === oi;
            const isCor = reveal && oi === q.correct;
            const isWrong = reveal && isSel && oi !== q.correct;
            return (
              <button key={oi} type="button" role="radio" aria-checked={isSel}
                className={cls('opt', isSel && !reveal && 'sel', isCor && 'cor', isWrong && 'wrong')}
                disabled={!onSelect} onClick={onSelect ? () => onSelect(oi) : undefined}>
                <span className="opt-letter">{LETTERS[pos]}</span>
                <RichText as="span" className="opt-text" images={q.images} zoomable={false}
                  src={q.options[oi] || (placeholder ? 'Option ' + LETTERS[pos] : '')} />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="num-ans">
          <input className="inp" inputMode="decimal" aria-label="Your answer"
            placeholder="Type a number or expression, e.g. 2*pi*50"
            value={numeric || ''} disabled={!onNumeric}
            onChange={(e) => onNumeric && onNumeric(e.target.value)} />
          {q.unit && <span className="unit">{q.unit}</span>}
        </div>
      )}
    </div>
  );
}
