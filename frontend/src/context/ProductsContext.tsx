"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface Product {
  id: string;
  name: string;
  price: string | number;
  originalPrice: number;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  images: string[];
  status: string;
  colors: string[];
  sizes: string[];
  sizeStock?: Record<string, number>;
  colorStock?: Record<string, number>;
}

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, updatedProduct: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5001/api/products";

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

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      
      // Map MongoDB _id back to frontend 'id' and normalize arrays if missing
      // Helper to convert MongoDB Map objects to plain JS objects
      const toPlainObject = (mapOrObj: any): Record<string, number> => {
        if (!mapOrObj) return {};
        if (mapOrObj instanceof Object && typeof mapOrObj.toJSON === 'function') return mapOrObj.toJSON();
        if (typeof mapOrObj === 'object') return { ...mapOrObj };
        return {};
      };

      const normalizedProducts: Product[] = data.map((p: any) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice || 0,
        stock: p.stock,
        status: p.stock <= 0 ? "Out of Stock" : p.stock <= 10 ? "Low Stock" : "Active",
        rating: p.rating || 5,
        reviews: p.numReviews || 0,
        images: p.images && p.images.length > 0 ? p.images : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"],
        colors: p.colors || ["Black", "White", "Mint"],
        sizes: p.sizes || ["S", "M", "L", "XL"],
        sizeStock: toPlainObject(p.sizeStock),
        colorStock: toPlainObject(p.colorStock)
      }));
      
      setProducts(normalizedProducts);
    } catch (err: any) {
      setError(err.message);
      console.error("Products Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: any) => {
    try {
      // Build a schema matching the backend expectation
      const body = {
        name: productData.name,
        description: productData.description || "Default Description",
        price: Number(productData.price),
        originalPrice: Number(productData.originalPrice) || 0,
        category: productData.category,
        stock: Number(productData.stock),
        images: productData.images || [],
        sizes: productData.sizes || ["S", "M", "L", "XL"],
        colors: productData.colors || ["Black", "White", "Mint"],
        sizeStock: productData.sizeStock || {},
        colorStock: productData.colorStock || {}
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to create product");
      
      // Re-fetch global state to get new IDs cleanly
      await fetchProducts();
    } catch (err) {
      console.error("Add Product Error:", err);
    }
  };

  const updateProduct = async (id: string, updatedProduct: any) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedProduct)
      });
      if (!res.ok) throw new Error("Failed to update product");
      await fetchProducts();
    } catch (err) {
      console.error("Update Product Error:", err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Delete Product Error:", err);
    }
  };

  return (
    <ProductsContext.Provider value={{ products, isLoading, error, refreshProducts: fetchProducts, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
