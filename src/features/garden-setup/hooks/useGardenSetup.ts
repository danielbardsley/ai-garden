import { useCallback, useEffect, useState } from 'react';

import { GardenSetup, SaveGardenSetupInput } from '../models/GardenSetup';
import { gardenSetupRepository } from '../repositories/GardenSetupRepository';

export type GardenSetupState = {
  setup: GardenSetup | null;
  loading: boolean;
  error?: Error;
  reload: () => void;
  saveSetup: (input: SaveGardenSetupInput) => Promise<GardenSetup>;
};

export function useGardenSetup(): GardenSetupState {
  const [setup, setSetup] = useState<GardenSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    gardenSetupRepository.getSetup()
      .then((value) => {
        if (!cancelled) setSetup(value);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  const saveSetup = useCallback(async (input: SaveGardenSetupInput) => {
    const saved = await gardenSetupRepository.saveSetup(input);
    setSetup(saved);
    return saved;
  }, []);

  return { setup, loading, error, reload, saveSetup };
}
