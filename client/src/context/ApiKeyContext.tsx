import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

export type Provider = "OpenAI" | "Gemini" | "Anthropic";

type Ctx = {
  provider: Provider;
  apiKey: string | null;
  saveApiKey: (provider: Provider, key: string) => void;
  getApiKey: () => string | null;
};

const PROVIDER_KEY = "kinex.provider";
const API_KEY_KEY = "kinex.apiKey";

// Module-level snapshot of the current state, kept in sync by the Provider.
let currentProvider: Provider = (localStorage.getItem(PROVIDER_KEY) as Provider) || "OpenAI";
let currentApiKey: string | null = localStorage.getItem(API_KEY_KEY);

export function getCurrentApiKey() {
  return { provider: currentProvider, apiKey: currentApiKey } as { provider: Provider; apiKey: string | null };
}

export const ApiKeyContext = createContext<Ctx | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<Provider>(currentProvider);
  const [apiKey, setApiKey] = useState<string | null>(currentApiKey);

  useEffect(() => {
    // Sync module-level snapshot whenever state changes
    currentProvider = provider;
    currentApiKey = apiKey;
  }, [provider, apiKey]);

  useEffect(() => {
    // On mount, ensure state aligns with localStorage
    const p = (localStorage.getItem(PROVIDER_KEY) as Provider) || provider;
    const k = localStorage.getItem(API_KEY_KEY);
    setProvider(p);
    setApiKey(k);
  }, []);

  const saveApiKey = useCallback((p: Provider, key: string) => {
    setProvider(p);
    setApiKey(key);
    localStorage.setItem(PROVIDER_KEY, p);
    localStorage.setItem(API_KEY_KEY, key);
  }, []);

  const getApiKey = useCallback(() => apiKey, [apiKey]);

  const value = useMemo<Ctx>(() => ({ provider, apiKey, saveApiKey, getApiKey }), [provider, apiKey, saveApiKey, getApiKey]);

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey() {
  const ctx = React.useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKey must be used within ApiKeyProvider");
  return ctx;
}
