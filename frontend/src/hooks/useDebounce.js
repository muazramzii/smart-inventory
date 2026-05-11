// src/hooks/useDebounce.js
// ----------------------------------------------------------------------------
// Returns the input value, but only after it's been stable for `delay` ms.
// Used for the search box: prevents an API call on every keystroke.
//
// Usage:
//   const [search, setSearch] = useState('');
//   const debouncedSearch = useDebounce(search, 300);
//   useEffect(() => { fetch(debouncedSearch) }, [debouncedSearch]);
// ----------------------------------------------------------------------------

import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
