"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

interface PosterColor {
  /** Dominant RGB of the active poster, e.g. "120,200,120". Null until extracted. */
  rgb: string | null;
  setRgb: (rgb: string | null) => void;
}

const PosterColorContext = createContext<PosterColor | null>(null);

export function PosterColorProvider({ children }: { children: ReactNode }) {
  const [rgb, setRgb] = useState<string | null>(null);
  const value = useMemo(() => ({ rgb, setRgb }), [rgb]);
  return (
    <PosterColorContext.Provider value={value}>
      {children}
    </PosterColorContext.Provider>
  );
}

export function usePosterColor(): PosterColor {
  const ctx = useContext(PosterColorContext);
  if (!ctx) {
    // Safe fallback when used outside the provider
    return { rgb: null, setRgb: () => {} };
  }
  return ctx;
}
