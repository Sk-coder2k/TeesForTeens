"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useProducts } from "@/context/ProductsContext";
import { ProductCard } from "@/components/ProductCard";
import { HeartCrack } from "lucide-react";

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();
  const { products } = useProducts();

  // Always use FRESH product data from catalog — fixes stale stock/image issue
  const freshWishlistItems = wishlistItems.map((wishItem) => {
    const fresh = products.find((p) => p.id === wishItem.id);
    return fresh || wishItem;
  });

  return (
    <div className="bg-[#FAFAFA] min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#29bc89] mb-6 transition-colors group"
        >
          <svg
            className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-[2.5rem] font-extrabold text-gray-900 tracking-tight mb-2">
            My Wishlist
          </h1>
          <p className="text-gray-500 font-medium">
            {wishlistItems.length} items saved
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <HeartCrack className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Save your favorite items here to grab them later before they sell
              out!
            </p>
            <Link
              href="/shop"
              className="inline-flex justify-center items-center px-8 py-3.5 text-base font-bold text-white bg-[#29bc89] hover:bg-[#23a172] rounded-full transition-colors"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {freshWishlistItems.map((item, i) => (
              <ProductCard key={item.id || i} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
