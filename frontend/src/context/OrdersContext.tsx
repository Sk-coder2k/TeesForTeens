"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Order {
  id: string;
  displayId: string;
  customer: string;
  date: string;
  total: string;
  items: number;
  status: string;
  payment: string;
  paymentMethod?: string;
  orderedItems?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    color: string;
    size: string;
    image: string;
  }[];
  
  // Detailed specifics saved at Checkout
  subtotal?: string;
  shipping?: string;
  tax?: string;
  discount?: string;
  couponCode?: string | null;
  shippingDetails?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

interface OrdersContextType {
  orders: Order[];
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, newStatus: string) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = "http://localhost:5001/api/orders";

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window === "undefined") return headers;
    const userStr = localStorage.getItem("teesforteens_user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      const token = parsedUser.token || (parsedUser.email === "admin@teesforteens.com" ? "mock-admin-token-123" : null);
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL, { headers: getAuthHeaders() });
      if (!res.ok) {
        if (res.status === 401) {
          console.warn("Unauthorized to fetch all orders (Admin only route)");
          setOrders([]);
          return;
        }
        throw new Error("Failed to fetch orders from server");
      }
      const data = await res.json();
      
      const normalizedOrders = data.map((o: any) => ({
        id: o._id,
        displayId: o.displayId || o._id.slice(-8).toUpperCase(),
        customer: o.user ? o.user.name : "Guest Customer",
        date: new Date(o.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        total: `₹${o.totalPrice}`,
        items: o.orderItems?.length || 0,
        status: o.isDelivered ? "Delivered" : o.orderStatus || "Pending", // Use actual MongoDB enum
        payment: o.isPaid ? "Paid" : "Pending",
        paymentMethod: o.paymentMethod || "COD",
        orderedItems: o.orderItems ? o.orderItems.map((item: any) => ({
          ...item,
          quantity: item.qty || 1,
          id: item.product
        })) : [],
        subtotal: o.itemsPrice?.toString() || "0",
        shipping: o.shippingPrice === 0 ? "Free" : o.shippingPrice?.toString() || "0",
        tax: o.taxPrice?.toString() || "0",
        discount: "0",
        couponCode: null,
        shippingDetails: {
          name: o.user?.name || "Guest Customer",
          email: o.user?.email || o.shippingAddress?.email || "N/A",
          phone: o.shippingAddress?.phoneNumber || "N/A",
          address: o.shippingAddress?.address || "",
          city: o.shippingAddress?.city || "",
          pincode: o.shippingAddress?.postalCode || "",
          fullAddress: o.shippingAddress
            ? `${o.shippingAddress.address}, ${o.shippingAddress.city}, ${o.shippingAddress.postalCode}`
            : "N/A",
        }
      }));
      setOrders(normalizedOrders);
    } catch (err) {
      console.error("Orders Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (orderData: any) => {
    try {
      // Map the frontend structure into the backend mongoose structure
      const payload = {
        orderItems: orderData.orderedItems.map((item: any) => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          size: item.size,
          color: item.color,
          product: item.id // Assuming the frontend item.id maps directly to the Mongo ObjectId
        })),
        shippingAddress: {
          address: orderData.shippingDetails.address || "",
          city: orderData.shippingDetails.city || "",
          postalCode: orderData.shippingDetails.pincode || "",
          phoneNumber: orderData.shippingDetails.phone || "",
        },
        paymentMethod: orderData.paymentMethod || (orderData.payment === "Paid" ? "Card" : "COD"),
        itemsPrice: Number(orderData.subtotal),
        taxPrice: Number(orderData.tax),
        shippingPrice: orderData.shipping === "Free" ? 0 : Number(orderData.shipping),
        totalPrice: Number(orderData.total.replace('₹', '')),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create order on backend");
      }
      
      await fetchOrders();
    } catch (err) {
      console.error("Add Order Error:", err);
      // Fallback to local push if the backend fails (e.g. invalid ObjectId)
      setOrders((prev) => [orderData, ...prev]);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status in backend");
      await fetchOrders();
    } catch (err) {
      console.error("Update Status Error:", err);
    }
  };

  return (
    <OrdersContext.Provider value={{ orders, isLoading, refreshOrders: fetchOrders, addOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
