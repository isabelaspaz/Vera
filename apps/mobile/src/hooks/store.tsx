import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Analysis, LabelImage } from '@vera/shared';
type Store = {
  analysis: Analysis | null; setAnalysis: (analysis: Analysis | null) => void; reset: () => void;
  pendingImage: LabelImage | null; setPendingImage: (image: LabelImage | null) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [pendingImage, setPendingImage] = useState<LabelImage | null>(null);
  const reset = () => { setAnalysis(null); setPendingImage(null); };
  return <Context.Provider value={{ analysis, setAnalysis, pendingImage, setPendingImage, reset }}>{children}</Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error('Store ausente.'); return value; }
