"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  cartCount: number;
  cartTotal: number;
  clearCart: () => void;
  discountAmount: number;
  appliedCouponCode: string | null;
  applyDiscount: (amount: number, code: string) => void;
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("teesforteens_cart");
    const savedDiscountAmount = localStorage.getItem("teesforteens_discountAmount");
    const savedAppliedCouponCode = localStorage.getItem("teesforteens_appliedCouponCode");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from local storage", e);
      }
    }
    if (savedDiscountAmount) {
      try {
        setDiscountAmount(JSON.parse(savedDiscountAmount));
      } catch (e) {
        console.error("Failed to parse discount amount from local storage", e);
      }
    }
    if (savedAppliedCouponCode) {
      try {
        setAppliedCouponCode(JSON.parse(savedAppliedCouponCode));
      } catch (e) {
        console.error("Failed to parse applied coupon code from local storage", e);
      }
    }
  }, []);

  // Save to localStorage whenever cart or discount state changes
  useEffect(() => {
    localStorage.setItem("teesforteens_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("teesforteens_discountAmount", JSON.stringify(discountAmount));
    localStorage.setItem("teesforteens_appliedCouponCode", JSON.stringify(appliedCouponCode));
  }, [discountAmount, appliedCouponCode]);

  const addToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
      );
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setAppliedCouponCode(null);
  };

  const applyDiscount = (amount: number, code: string) => {
    setDiscountAmount(amount);
    setAppliedCouponCode(code);
  };

  const removeDiscount = () => {
    setDiscountAmount(0);
    setAppliedCouponCode(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeItem,
      cartCount,
      cartTotal,
      clearCart,
      discountAmount,
      appliedCouponCode,
      applyDiscount,
      removeDiscount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
