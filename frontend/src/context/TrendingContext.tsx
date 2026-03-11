"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TrendingProduct {
  name: string;
  subtitle: string;
  emoji: string;
  image?: string;
  heroImages?: string[];
}

interface TrendingContextType {
  trending: TrendingProduct;
  updateTrending: (data: TrendingProduct) => Promise<void>;
}

const DEFAULT_TRENDING: TrendingProduct = {
  name: "Trending Now",
  subtitle: "Oversized Mint Tee",
  emoji: "🔥",
  heroImages: [],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const TrendingContext = createContext<TrendingContextType | undefined>(undefined);

export function TrendingProvider({ children }: { children: ReactNode }) {
  const [trending, setTrending] = useState<TrendingProduct>(DEFAULT_TRENDING);

  useEffect(() => {
    fetch(`${API_URL}/homepage`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.trending) setTrending(data.trending); })
      .catch(() => {
        const stored = localStorage.getItem("teesforteens_trending");
        if (stored) setTrending(JSON.parse(stored));
      });
  }, []);

  const updateTrending = async (data: TrendingProduct) => {
    setTrending(data);
    try { localStorage.setItem("teesforteens_trending", JSON.stringify(data)); } catch (e) {}
    const userStr = localStorage.getItem("teesforteens_user");
    const token = userStr ? JSON.parse(userStr).token : null;
    if (token) {
      try {
        await fetch(`${API_URL}/homepage`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ trending: data }),
        });
      } catch (e) { console.error("Failed to save trending", e); }
    }
  };

  return (
    <TrendingContext.Provider value={{ trending, updateTrending }}>
      {children}
    </TrendingContext.Provider>
  );
}

export function useTrending() {
  const context = useContext(TrendingContext);
  if (context === undefined) throw new Error("useTrending must be used within a TrendingProvider");
  return context;
}
