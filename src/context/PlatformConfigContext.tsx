import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { fetchPlatformConfig, savePlatformConfig, resetPlatformConfig, type PlatformConfig } from '@/api/platformConfigApi';

// ─── Context shape ────────────────────────────────────────────────────────────

interface PlatformConfigContextValue {
  config: PlatformConfig | null;
  isLoading: boolean;
  error: string | null;
  /** Admin: persist a full config update */
  updateConfig: (next: PlatformConfig) => Promise<void>;
  /** Admin: reset to factory defaults */
  resetToDefaults: () => Promise<void>;
  /** Manually refresh from server */
  refresh: () => Promise<void>;
}

const PlatformConfigContext = createContext<PlatformConfigContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const CACHE_KEY = 'platform_config_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function readCache(): PlatformConfig | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw) as { data: PlatformConfig; timestamp: number };
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(config: PlatformConfig) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: config, timestamp: Date.now() }));
  } catch {
    // sessionStorage may be unavailable in some environments
  }
}

function clearCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // noop
  }
}

export function PlatformConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PlatformConfig | null>(readCache);
  const [isLoading, setIsLoading] = useState<boolean>(!config);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (skipCache = false) => {
    if (!skipCache) {
      const cached = readCache();
      if (cached) {
        setConfig(cached);
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPlatformConfig();
      writeCache(data);
      setConfig(data);
    } catch {
      setError('Could not load platform configuration');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateConfig = useCallback(async (next: PlatformConfig) => {
    const saved = await savePlatformConfig(next);
    clearCache();
    writeCache(saved);
    setConfig(saved);
  }, []);

  const resetToDefaults = useCallback(async () => {
    const fresh = await resetPlatformConfig();
    clearCache();
    writeCache(fresh);
    setConfig(fresh);
  }, []);

  const refresh = useCallback(() => load(true), [load]);

  return (
    <PlatformConfigContext.Provider value={{ config, isLoading, error, updateConfig, resetToDefaults, refresh }}>
      {children}
    </PlatformConfigContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function usePlatformConfig() {
  const ctx = useContext(PlatformConfigContext);
  if (!ctx) throw new Error('usePlatformConfig must be used inside <PlatformConfigProvider>');
  return ctx;
}
