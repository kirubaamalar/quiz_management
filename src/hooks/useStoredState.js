import { useCallback, useEffect, useRef, useState } from 'react';
import { idbGet, idbSet } from '../lib/db';
import { load } from '../lib/storage';

/**
 * Like useState, but saved in IndexedDB. Returns [value, setValue, ready].
 * Data saved by older versions (localStorage) is moved over automatically.
 */
export default function useStoredState(key, initial, onSaveError) {
  const [state, setState] = useState({ ready: false, value: undefined });
  const errorRef = useRef(onSaveError);
  errorRef.current = onSaveError;

  useEffect(() => {
    let alive = true;
    (async () => {
      let value;
      try { value = await idbGet(key); } catch { /* IndexedDB unavailable */ }
      if (value === undefined) {
        const old = load(key, undefined);
        value = old !== undefined ? old : typeof initial === 'function' ? initial() : initial;
      }
      if (alive) setState({ ready: true, value });
    })();
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!state.ready) return;
    idbSet(key, state.value)
      .then(() => { try { localStorage.removeItem(key); } catch { /* ignore */ } })
      .catch((err) => errorRef.current && errorRef.current(err));
  }, [key, state]);

  const setValue = useCallback(
    (update) => setState((s) => ({ ...s, value: typeof update === 'function' ? update(s.value) : update })),
    []
  );
  return [state.value, setValue, state.ready];
}
