import QuizSetup from './QuizSetup';
import QuizRun from './QuizRun';
import QuizResult from './QuizResult';
import { gradeItem } from '../../lib/calc';
import { uid } from '../../lib/utils';

/** Quiz flow: setup -> run -> result. The session lives in App so it survives tab switches. */
export default function Quiz({ bank, session, setSession, onFinished }) {
  if (!session) {
    return <QuizSetup bank={bank} onStart={(s) => { setSession(s); window.scrollTo(0, 0); }} />;
  }

  if (session.done) {
    const retake = () =>
      setSession({
        ...session, id: uid(), done: false, result: null, answers: {}, flags: {}, current: 0, startedAt: Date.now(),
        endsAt: session.endsAt ? Date.now() + (session.endsAt - session.startedAt) : null,
      });
    return <QuizResult session={session} onRetake={retake} onNew={() => setSession(null)} />;
  }

  const submit = () => {
    const s = session;
    const grades = s.items.map((it, i) => gradeItem(it, s.answers[i]));
    const markOf = (it) => Number(it.q.marks) || 1;
    const total = s.items.reduce((t, it) => t + markOf(it), 0);
    const score = s.items.reduce((t, it, i) => t + (grades[i].correct ? markOf(it) : 0), 0);
    const pct = total ? Math.round((score / total) * 100) : 0;
    const result = {
      grades, total, score, pct,
      correct: grades.filter((g) => g.correct).length,
      wrong: grades.filter((g) => g.answered && !g.correct).length,
      skipped: grades.filter((g) => !g.answered).length,
      duration: (Date.now() - s.startedAt) / 1000,
    };
    setSession({ ...s, done: true, result });
    onFinished({ id: s.id, name: s.name, date: Date.now(), count: s.items.length, score, total, pct });
    window.scrollTo(0, 0);
  };

  return <QuizRun key={session.id} session={session} setSession={setSession} onSubmit={submit} />;
}
