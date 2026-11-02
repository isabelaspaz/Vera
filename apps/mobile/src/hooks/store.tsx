import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Analysis } from '@vera/shared';
type Store = {
  mode: 'demo' | 'real'; setMode: (mode: 'demo' | 'real') => void;
  analysis: Analysis | null; setAnalysis: (analysis: Analysis | null) => void; reset: () => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [mode, changeMode] = useState<'demo' | 'real'>('demo');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const reset = () => setAnalysis(null);
  return <Context.Provider value={{ mode, setMode: value => { reset(); changeMode(value); }, analysis, setAnalysis, reset }}>{children}</Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error('Store ausente.'); return value; }
