import { useEffect, useState } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Studio from './pages/Studio';
import Bank from './pages/Bank';
import Quiz from './pages/quiz/Quiz';
import useHashView from './hooks/useHashView';
import useLocalStorage from './hooks/useLocalStorage';
import useStoredState from './hooks/useStoredState';
import { BANK_KEY, ATTEMPTS_KEY, THEME_KEY } from './lib/storage';
import { SEED } from './data/seedQuestions';

export default function App() {
  const [view, go] = useHashView();
  const [toast, setToast] = useState('');
  // Questions (with diagrams) live in IndexedDB; small settings stay in localStorage.
  const [bank, setBank, bankReady] = useStoredState(BANK_KEY, SEED,
    () => setToast('Couldn’t save: browser storage is full. Remove some large diagrams.'));
  const [attempts, setAttempts] = useLocalStorage(ATTEMPTS_KEY, []);
  const [theme, setTheme] = useLocalStorage(THEME_KEY, 'auto');
  const [editing, setEditing] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <Header view={view} quizInProgress={session && !session.done} theme={theme} setTheme={setTheme} />
      <main>
        {!bankReady && <div className="loading">Loading questions…</div>}
        {bankReady && view === 'home' && <Home bank={bank} attempts={attempts} />}
        {bankReady && view === 'studio' && (
          <Studio key={editing ? editing.id : 'new'} bank={bank} setBank={setBank}
            editing={editing} setEditing={setEditing} toast={setToast} go={go} />
        )}
        {bankReady && view === 'bank' && (
          <Bank bank={bank} setBank={setBank} toast={setToast} onEdit={(q) => { setEditing(q); go('studio'); }} />
        )}
        {bankReady && view === 'quiz' && (
          <Quiz bank={bank} session={session} setSession={setSession}
            onFinished={(a) => setAttempts((p) => [a, ...p].slice(0, 50))} />
        )}
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
