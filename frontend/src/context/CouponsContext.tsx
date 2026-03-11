"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  expiry: string;
  timesUsed: number;
  status: "Active" | "Expired";
}

interface CouponsContextType {
  coupons: Coupon[];
  isLoading: boolean;
  refreshCoupons: () => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, "id" | "timesUsed">) => Promise<void>;
  updateCoupon: (id: string, updatedCoupon: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  incrementUsage: (id: string) => Promise<void>;
}

const CouponsContext = createContext<CouponsContextType | undefined>(undefined);

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/coupons`;

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window === "undefined") return headers;
    const userStr = localStorage.getItem("teesforteens_user");
    if (userStr) {
      const token = JSON.parse(userStr).token;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      
      const normalized = data.map((c: any) => ({
        id: c._id,
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
        expiry: c.expiry ? new Date(c.expiry).toISOString().split('T')[0] : "", // Standardize YYYY-MM-DD
        timesUsed: c.timesUsed,
        status: c.status
      }));
      setCoupons(normalized);
    } catch (err) {
      console.error("Fetch Coupons Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const addCoupon = async (coupon: Omit<Coupon, "id" | "timesUsed">) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(coupon)
      });
      if (!res.ok) throw new Error("Failed to create coupon");
      await fetchCoupons();
    } catch (err) {
      console.error("Add Coupon Error:", err);
    }
  };

  const updateCoupon = async (id: string, updatedCoupon: Partial<Coupon>) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedCoupon)
      });
      if (!res.ok) throw new Error("Failed to update coupon");
      await fetchCoupons();
    } catch (err) {
      console.error("Update Coupon Error:", err);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete coupon");
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Delete Coupon Error:", err);
    }
  };

  const incrementUsage = async (codeOrId: string) => {
    try {
      const match = coupons.find(c => c.code === codeOrId || c.id === codeOrId);
      if (!match) return;
      
      const res = await fetch(`${API_URL}/${match.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ timesUsed: match.timesUsed + 1 })
      });
      if (!res.ok) throw new Error("Failed to increment coupon");
      // Intentionally avoiding a full await fetchCoupons() here for UI speed, relying on local state patch
      setCoupons(prev => prev.map(c => c.id === match.id ? { ...c, timesUsed: c.timesUsed + 1 } : c));
    } catch (err) {
      console.error("Increment Coupon Error", err);
    }
  };

  return (
    <CouponsContext.Provider value={{ coupons, isLoading, refreshCoupons: fetchCoupons, addCoupon, updateCoupon, deleteCoupon, incrementUsage }}>
      {children}
    </CouponsContext.Provider>
  );
}

export function useCoupons() {
  const context = useContext(CouponsContext);
  if (context === undefined) {
    throw new Error("useCoupons must be used within a CouponsProvider");
  }
  return context;
}
