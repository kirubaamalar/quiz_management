import { useEffect, useState } from 'react';
import { load, save } from '../lib/storage';

/** useState that is saved to localStorage automatically. */
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = load(key, undefined);
    return stored !== undefined ? stored : typeof initial === 'function' ? initial() : initial;
  });
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue];
}
