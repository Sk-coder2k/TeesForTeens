"use client";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { CouponsProvider } from "@/context/CouponsContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { UsersProvider } from "@/context/UsersContext";
import { TrendingProvider } from "@/context/TrendingContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HomepageProvider } from "@/context/HomepageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder"}
    >
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <ProductsProvider>
              <CouponsProvider>
                <OrdersProvider>
                  <UsersProvider>
                    <CartProvider>
                      <HomepageProvider>
                        <TrendingProvider>{children}</TrendingProvider>
                      </HomepageProvider>
                    </CartProvider>
                  </UsersProvider>
                </OrdersProvider>
              </CouponsProvider>
            </ProductsProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}
