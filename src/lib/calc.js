import { evaluate, format } from 'mathjs';

function toNum(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  if (v.isUnit) return v.value; // e.g. "10 kohm * 100 uF" -> SI value
  if (v.isFraction || v.isBigNumber) return Number(v.valueOf());
  if (v.isComplex) return Math.abs(v.im) < 1e-12 ? v.re : null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Evaluates "2*pi*sqrt(4)" etc. Returns a number or null if invalid. */
export function safeEval(expr, scope) {
  if (expr == null || String(expr).trim() === '') return null;
  try {
    const n = toNum(evaluate(String(expr), scope || {}));
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export const fmt = (n) => (n == null ? '–' : format(n, { precision: 8 }));

/** Marks one quiz item. MCQ: compare index. Numeric: within tolerance %. */
export function gradeItem(item, ans) {
  const q = item.q;
  if (ans === undefined || ans === null || ans === '') return { answered: false, correct: false };
  if (q.type === 'mcq') return { answered: true, correct: ans === q.correct };
  const u = safeEval(ans);
  if (u == null) return { answered: true, correct: false, value: null };
  const a = Number(q.answer);
  const tol = Math.max((Math.abs(a) * (Number(q.tolerance) || 0)) / 100, 1e-9);
  return { answered: true, correct: Math.abs(u - a) <= tol, value: u };
}
