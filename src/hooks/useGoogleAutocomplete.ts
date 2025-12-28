import { useState, useEffect, useCallback } from 'react';
import { getAutocompleteService } from '../lib/google';

export function useGoogleAutocomplete() {
  const [service, setService] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAutocompleteService().then(s => setService(s));
  }, []);

  const getPredictions = useCallback(async (input: string) => {
    if (!input || input.length < 3 || !service) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "gh" },
        types: ["(regions)"],
      },
      (results: any, status: any) => {
        setLoading(false);
        if (status === "OK" && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      }
    );
  }, [service]);

  return { predictions, getPredictions, loading, setPredictions };
}
