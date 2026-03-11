"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Category {
  id: string;
  name: string;
  query: string;
  count: string;
  image: string;
}

interface HomepageContextType {
  categories: Category[];
  featuredIds: string[];
  bestsellerIds: string[];
  setCategories: (cats: Category[]) => Promise<void>;
  setFeaturedIds: (ids: string[]) => Promise<void>;
  setBestsellerIds: (ids: string[]) => Promise<void>;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Oversized Tees", query: "Oversized", count: "120+", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600" },
  { id: "2", name: "Streetwear", query: "Streetwear", count: "85+", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600" },
  { id: "3", name: "Couple Match", query: "Couple", count: "40+", image: "https://images.unsplash.com/photo-1583391265517-35bbbad0120b?auto=format&fit=crop&q=80&w=600" },
  { id: "4", name: "Classic Fit", query: "Classic", count: "200+", image: "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&q=80&w=600" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const getAuthHeaders = () => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window === "undefined") return headers;
  const userStr = localStorage.getItem("teesforteens_user");
  if (userStr) {
    const token = JSON.parse(userStr).token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const saveToBackend = async (patch: object) => {
  try {
    await fetch(`${API_URL}/homepage`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(patch),
    });
  } catch (e) {
    console.error("Failed to save homepage settings", e);
  }
};

const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export function HomepageProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [bestsellerIds, setBestsellerIds] = useState<string[]>([]);

  // Fetch all settings from backend on mount — works for ALL users
  useEffect(() => {
    fetch(`${API_URL}/homepage`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (data.categories?.length) setCategories(data.categories);
        if (data.featuredIds) setFeaturedIds(data.featuredIds);
        if (data.bestsellerIds) setBestsellerIds(data.bestsellerIds);
      })
      .catch(() => {
        // Fallback to localStorage
        const cats = localStorage.getItem("tft_categories");
        const feat = localStorage.getItem("tft_featured");
        const best = localStorage.getItem("tft_bestsellers");
        if (cats) setCategories(JSON.parse(cats));
        if (feat) setFeaturedIds(JSON.parse(feat));
        if (best) setBestsellerIds(JSON.parse(best));
      });
  }, []);

  const saveCats = async (cats: Category[]) => {
    setCategories(cats);
    localStorage.setItem("tft_categories", JSON.stringify(cats));
    await saveToBackend({ categories: cats });
  };

  const saveFeatured = async (ids: string[]) => {
    setFeaturedIds(ids);
    localStorage.setItem("tft_featured", JSON.stringify(ids));
    await saveToBackend({ featuredIds: ids });
  };

  const saveBestsellers = async (ids: string[]) => {
    setBestsellerIds(ids);
    localStorage.setItem("tft_bestsellers", JSON.stringify(ids));
    await saveToBackend({ bestsellerIds: ids });
  };

  return (
    <HomepageContext.Provider value={{
      categories,
      featuredIds,
      bestsellerIds,
      setCategories: saveCats,
      setFeaturedIds: saveFeatured,
      setBestsellerIds: saveBestsellers,
    }}>
      {children}
    </HomepageContext.Provider>
  );
}

export function useHomepage() {
  const context = useContext(HomepageContext);
  if (!context) throw new Error("useHomepage must be used within HomepageProvider");
  return context;
}
