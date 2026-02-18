import { useState, useEffect, useRef } from 'react';
import { searchAddress, type NominatimResult } from '@/services/nominatim';

export function useAddressSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchAddress(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const clearResults = () => {
    setResults([]);
    setQuery('');
  };

  return { query, setQuery, results, isSearching, clearResults };
}
