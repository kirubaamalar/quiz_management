import { cls } from '../lib/utils';

export const VIEWS = { home: 'Overview', studio: 'Create question', bank: 'Question bank', quiz: 'Take quiz' };
const NEXT_THEME = { auto: 'light', light: 'dark', dark: 'auto' };

export default function Header({ view, quizInProgress, theme, setTheme }) {
  return (
    <header className="top">
      <div className="top-in">
        <a className="brand" href="#home"><span className="mark">∑</span>FormulaDesk</a>
        <nav className="nav">
          {Object.entries(VIEWS).map(([key, label]) => (
            <a key={key} href={'#' + key} className={cls(view === key && 'on')} aria-current={view === key ? 'page' : undefined}>
              {label}{key === 'quiz' && quizInProgress ? ' (in progress)' : ''}
            </a>
          ))}
        </nav>
        <button className="theme-btn" onClick={() => setTheme(NEXT_THEME[theme])} aria-label="Change theme">
          Theme: {theme}
        </button>
      </div>
    </header>
  );
}
