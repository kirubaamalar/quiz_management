// Everything is saved in the browser (localStorage). No backend needed.
export const BANK_KEY = 'formuladesk.bank.v1';
export const ATTEMPTS_KEY = 'formuladesk.attempts.v1';
export const THEME_KEY = 'formuladesk.theme';

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}
