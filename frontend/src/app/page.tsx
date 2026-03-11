"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { useCoupons } from "@/context/CouponsContext";
import { useTrending } from "@/context/TrendingContext";
import { useHomepage } from "@/context/HomepageContext";

const DEFAULT_HERO =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200";

function HeroSlider({ trending }: { trending: any }) {
  const images: string[] = (() => {
    const imgs = (trending.heroImages || []).filter(Boolean);
    if (imgs.length === 0 && trending.image) return [trending.image];
    if (imgs.length === 0) return [DEFAULT_HERO];
    return imgs;
  })();

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(next, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, next]);

  const resetTimer = (fn: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    fn();
    if (images.length > 1) timerRef.current = setInterval(next, 4000);
  };

  return (
    <div className="w-full h-full relative rounded-2xl sm:rounded-3xl overflow-hidden group">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Hero slide ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {images.length > 1 && (
        <>
          <button
            onClick={() => resetTimer(prev)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft size={18} className="text-gray-800" />
          </button>
          <button
            onClick={() => resetTimer(next)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight size={18} className="text-gray-800" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => resetTimer(() => setCurrent(i))}
                className={`transition-all rounded-full ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const { products, isLoading } = useProducts();
  const { coupons } = useCoupons();
  const { trending } = useTrending();
  const { categories, featuredIds, bestsellerIds } = useHomepage();

  const activeCoupons = coupons.filter((c) => c.status === "Active");
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);

  useEffect(() => {
    if (activeCoupons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCouponIndex((prev) => (prev + 1) % activeCoupons.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeCoupons.length]);

  const featured =
    featuredIds.length > 0
      ? featuredIds
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean)
      : products.slice(0, 4);

  const bestsellers =
    bestsellerIds.length > 0
      ? bestsellerIds
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean)
      : products.slice(products.length > 4 ? products.length - 4 : 0).reverse();

  if (isLoading || products.length === 0) {
    return (
      <div className="flex flex-col gap-24 pb-24 bg-[#FAFAFA] min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-mint-200 border-t-mint-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">
          Loading catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-12 pb-20 bg-[#FAFAFA] min-h-screen">
      {/* Coupon Ticker Banner */}
      {activeCoupons.length > 0 && (
        <div className="w-full bg-[#29bc89] text-white py-2.5 overflow-hidden">
          <style>{`
            @keyframes ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .ticker-track {
              display: flex;
              width: max-content;
              animation: ticker ${Math.max(activeCoupons.length * 8, 20)}s linear infinite;
            }
            .ticker-track:hover { animation-play-state: paused; }
          `}</style>
          <div className="ticker-track">
            {[...activeCoupons, ...activeCoupons].map((coupon, i) => (
              <span
                key={i}
                className="text-xs sm:text-sm font-bold flex items-center gap-2 px-6 sm:px-8 whitespace-nowrap"
              >
                ⚡ USE CODE:&nbsp;
                <span className="bg-white text-[#29bc89] px-2 py-0.5 rounded shadow-sm">
                  {coupon.code}
                </span>
                &nbsp;FOR{" "}
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`}{" "}
                OFF
                <span className="mx-3 text-white/40">•</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 sm:pt-10 md:pt-14">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 lg:gap-20">
          {/* Text */}
          <div className="flex-1 w-full max-w-2xl text-center md:text-left">
            <span className="inline-block py-1.5 px-3 rounded-full bg-[#E8F5F2] text-[#29bc89] text-[10px] font-bold uppercase mb-4 tracking-wide">
              New Collection 2026
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-[4.5rem] font-extrabold tracking-tight text-gray-900 mb-4 leading-[1.08]">
              Discover Your Unique Style With{" "}
              <span className="text-[#29bc89]">TeesforTeens</span>
            </h1>
            <p className="text-gray-500 mb-6 sm:mb-10 text-base sm:text-lg leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
              Shop trendy oversized t-shirts, streetwear styles, and couple
              collections designed for the modern generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 text-base font-bold text-white bg-[#29bc89] hover:bg-[#23a172] rounded-full transition-colors"
              >
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/shop?category=Oversized"
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 text-base font-bold text-[#29bc89] border-2 border-[#29bc89] hover:bg-[#E8F5F2] rounded-full transition-colors"
              >
                Oversized Collection
              </Link>
            </div>
            <div className="flex gap-6 sm:gap-12 mt-8 sm:mt-12 pt-6 sm:pt-10 justify-center md:justify-start">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  500+
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Happy Customers
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  50+
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Unique Designs
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  4.8★
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Avg Rating
                </p>
              </div>
            </div>
          </div>

          {/* Image — shows FIRST on mobile via flex-col-reverse */}
          <div className="w-full relative h-[300px] sm:h-[420px] lg:h-[540px] lg:flex-1">
            <HeroSlider trending={trending} />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 md:-bottom-6 md:-left-6 bg-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 whitespace-nowrap z-10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#E8F5F2] rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                {trending.emoji}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-gray-900">
                  {trending.name}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                  {trending.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Space to clear trending badge */}
      <div className="mt-6 sm:mt-2" />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base">
            Find your perfect fit
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.id || i}
              href={`/shop?category=${cat.query}`}
              className="group cursor-pointer block"
            >
              <div className="relative aspect-[4/5] sm:aspect-square bg-[#E8F5F2] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-9 h-9 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-lg shadow-sm z-10">
                  👕
                </div>
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 text-white text-left z-10 transition-transform duration-300 group-hover:-translate-y-1">
                  <h3 className="text-base sm:text-2xl font-extrabold mb-0.5 tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="font-medium text-white/80 text-xs sm:text-sm flex items-center gap-1">
                    Explore {cat.count} <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Picks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-2">
              Featured Picks
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Handpicked just for you
            </p>
          </div>
          <Link
            href="/shop"
            className="text-gray-900 font-bold flex items-center text-sm hover:underline whitespace-nowrap ml-4"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {featured.map((item: any, i) => (
            <ProductCard key={i} item={item} i={i} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      {activeCoupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Link
            href="/shop"
            className="block relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] shadow-sm transform transition-transform hover:scale-[1.01] hover:shadow-lg bg-[#29bc89]"
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentCouponIndex * 100}%)` }}
            >
              {activeCoupons.map((coupon, idx) => (
                <div
                  key={idx}
                  className="w-full flex-shrink-0 relative px-6 py-10 sm:px-8 sm:py-16 md:p-16 flex items-center min-h-[240px] sm:min-h-[300px]"
                >
                  <div className="relative z-10 max-w-xl">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-[11px] font-bold mb-4 tracking-wide">
                      Limited Time Offer
                    </span>
                    <h2 className="text-2xl sm:text-4xl md:text-[3.2rem] font-extrabold text-white mb-3 sm:mb-5 leading-[1.1] tracking-tight">
                      {coupon.discountType === "percentage"
                        ? `Flat ${coupon.discountValue}% Off`
                        : `Save ₹${coupon.discountValue}`}{" "}
                      on your order
                    </h2>
                    <p className="text-white/90 text-sm sm:text-[15px] mb-6 sm:mb-8 font-medium">
                      Use code{" "}
                      <strong className="text-[#29bc89] bg-white px-2 py-0.5 rounded shadow-sm">
                        {coupon.code}
                      </strong>{" "}
                      at checkout.{" "}
                      {coupon.minOrderValue > 0
                        ? `Min purchase ₹${coupon.minOrderValue}.`
                        : "Valid on all products."}
                    </p>
                    <span className="inline-flex justify-center items-center px-6 py-2.5 sm:px-8 sm:py-3 text-sm font-bold text-[#29bc89] bg-white rounded-full shadow-md hover:bg-gray-50">
                      Shop the Sale <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {activeCoupons.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {activeCoupons.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentCouponIndex ? "bg-white w-6" : "bg-white/50 w-2"}`}
                  />
                ))}
              </div>
            )}
          </Link>
        </section>
      )}

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-2">
              Best Sellers
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Our most loved tees
            </p>
          </div>
          <Link
            href="/shop"
            className="text-gray-900 font-bold flex items-center text-sm hover:underline whitespace-nowrap ml-4"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {bestsellers.map((item: any, i) => (
            <ProductCard key={i} item={item} i={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
