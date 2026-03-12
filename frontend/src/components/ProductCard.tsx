"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingBag, Heart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export function ProductCard({ item, i }: { item: any; i?: number }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const isWished = isInWishlist(item.id || item.name);

  const price = Number(item.price) || 0;
  const originalPrice = Number(item.originalPrice) || 0;
  const hasDiscount = originalPrice > price && price > 0;
  const discountPercent = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;

  const stock = Number(item.stock) || 0;
  const isLimitedStock = stock > 0 && stock <= 10;
  const isOutOfStock = stock === 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: item.id || item.name,
      name: item.name,
      price: parseInt(item.price),
      quantity: 1,
      size: "L",
      color: "Default",
      image: item.images?.[0] || "",
    });
    router.push("/checkout");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: item.id || item.name,
      name: item.name,
      price: parseInt(item.price),
      quantity: 1,
      size: "L",
      color: "Default",
      image: item.images?.[0] || "",
    });
  };

  return (
    <Link
      href={`/product/${item.id || item.name.toLowerCase().replace(/\s+/g, "-")}`}
      className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-2 sm:p-3 hover:shadow-md transition-shadow group flex flex-col relative"
    >
      <div className="relative aspect-square bg-[#EAEAEA] rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-4">
        <img
          src={item.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"}
          alt={item.name}
          className={`w-full h-full object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-[#FF6B6B] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-[2px] sm:px-2 sm:py-[3px] rounded-full">
              -{discountPercent}%
            </span>
          )}
          {item.bestseller && (
            <span className="bg-[#29bc89] text-white text-[9px] sm:text-[10px] uppercase tracking-wide font-extrabold px-1.5 py-[2px] sm:px-2 sm:py-[3px] rounded-full">
              Best
            </span>
          )}
          {isLimitedStock && (
            <span className="hidden sm:flex bg-[#FF9500] text-white text-[10px] font-bold px-2 py-[3px] rounded-full items-center gap-1">
              ⚡ {stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-[2px] sm:px-2 sm:py-[3px] rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-gray-400 hover:text-[#FF6B6B] p-1.5 sm:p-2 rounded-full shadow-sm transition-colors z-20"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isWished) {
              removeFromWishlist(item.id || item.name);
            } else {
              addToWishlist({
                id: item.id || item.name,
                name: item.name,
                price: parseInt(item.price) || 0,
                category: item.category || "Uncategorized",
                rating: item.rating ? parseFloat(item.rating) : 0,
                reviews: item.reviews ? parseInt(item.reviews) : 0,
                image: item.image || "",
              });
            }
          }}
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isWished ? "fill-[#FF6B6B] text-[#FF6B6B]" : ""}`} strokeWidth={isWished ? 0 : 2.5} />
        </button>

        {/* Add to Cart — always visible on mobile, hover on desktop */}
        {!isOutOfStock && (
          <button
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-[#29bc89] text-white p-2 sm:p-2.5 rounded-full shadow-sm z-20 sm:opacity-0 sm:translate-y-4 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
          </button>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="px-0.5 sm:px-1 flex-1 flex flex-col">
        <h3 className="text-[13px] sm:text-[15px] font-extrabold text-gray-900 mb-0.5 leading-tight tracking-tight line-clamp-2">
          {item.name}
        </h3>
        <p className="text-[11px] sm:text-xs text-gray-400 font-medium mb-1.5 sm:mb-3 truncate">
          {item.category}
        </p>

        <div className="mt-auto">
          <div className="flex items-center gap-1 mb-1 sm:mb-2">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[#29bc89] text-[#29bc89]" />
            <span className="text-[12px] sm:text-[13px] font-bold text-gray-900">{item.rating}</span>
            <span className="text-[11px] sm:text-[13px] text-gray-400 hidden sm:inline">({item.reviews})</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className={`text-[15px] sm:text-[17px] font-black ${isOutOfStock ? "text-gray-400" : "text-gray-900"}`}>
              ₹{price}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm font-bold text-gray-400 line-through">₹{originalPrice}</span>
            )}
          </div>
        </div>
        {!isOutOfStock && (
          <button
            onClick={handleBuyNow}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #1a3d2b, #29bc89)" }}
          >
            <Zap className="h-3 w-3" fill="white" />
            Buy Now
          </button>
        )}
      </div>
    </Link>
  );
}
