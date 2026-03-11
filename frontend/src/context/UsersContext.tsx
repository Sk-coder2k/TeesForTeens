"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  orders: number;
}

interface UsersContextType {
  users: UserProfile[];
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/users`;

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

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // NOTE: Passing the Admin JWT token here to access this route securely.
      const res = await fetch(API_URL, { headers: getAuthHeaders() });
      if (!res.ok) {
        if (res.status === 401) return setUsers([]);
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      
      const normalizedUsers = data.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.isAdmin ? "Admin" : "Customer",
        joined: new Date(u.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        orders: 0 // Would require aggregation or lookup in backend for real numbers
      }));
      setUsers(normalizedUsers);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error("Delete User Error:", err);
    }
  };

  return (
    <UsersContext.Provider value={{ users, isLoading, refreshUsers: fetchUsers, deleteUser }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useDataUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useDataUsers must be used within a UsersProvider");
  }
  return context;
}
