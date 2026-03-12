"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Heart, Menu, X, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, LogOut, Package } from "lucide-react";

export default function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const CATEGORIES = ["All", "T-Shirts", "Classic", "Oversized", "Couple", "Streetwear"];

  const suggestedCategories = CATEGORIES.filter(cat =>
    cat !== "All" && searchQuery && cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img src="/logo.svg" alt="TeesforTeens" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Main Nav Links (Center) */}
          <div className="hidden md:flex items-center justify-center space-x-3 lg:space-x-6 xl:space-x-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-gray-500 hover:text-gray-900 text-xs xl:text-sm font-bold transition-colors whitespace-nowrap">Home</Link>
            <Link href="/shop" className="text-gray-500 hover:text-gray-900 text-xs xl:text-sm font-bold transition-colors whitespace-nowrap">Shop</Link>
            <Link href="/shop?category=Oversized" className="text-gray-500 hover:text-gray-900 text-xs xl:text-sm font-bold transition-colors whitespace-nowrap">Oversized</Link>
            <Link href="/shop?category=Streetwear" className="text-gray-500 hover:text-gray-900 text-xs xl:text-sm font-bold transition-colors whitespace-nowrap">Streetwear</Link>
            <Link href="/shop?category=Couple" className="text-gray-500 hover:text-gray-900 text-xs xl:text-sm font-bold transition-colors whitespace-nowrap">Couple Tees</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Search className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
            </button>
            <Link href="/wishlist" className="text-gray-600 hover:text-gray-900 transition-colors relative">
              <Heart className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-[#FF6B6B] rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-gray-900 transition-colors relative">
              <ShoppingCart className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-[#FF6B6B] rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 md:px-3 lg:px-4 py-2 text-sm font-bold text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
                >
                  {user?.image ? (
                    <img src={user.image} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-6 h-6 bg-mint-500 text-white rounded-full flex items-center justify-center text-xs">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="hidden xl:inline max-w-[100px] truncate">{user?.name}</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1 text-sm">
                      <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 font-bold transition-colors"
                    >
                      <Package className="w-4 h-4" /> Order History
                    </Link>

                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-mint-600 font-bold transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { setIsProfileMenuOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600 font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex items-center justify-center px-5 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-800 bg-white hover:bg-gray-50 transition-colors">
                Sign In
              </Link>
            )}

            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-500 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-down Search Bar */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 shadow-lg animate-in slide-in-from-top-2 duration-200 z-40">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, styles, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-mint-500 focus:bg-white transition-all text-[15px] font-medium placeholder-gray-400"
              />
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {searchQuery && isSearchFocused && suggestedCategories.length > 0 && (
            <div className="max-w-3xl mx-auto mt-2 relative">
              <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-lg py-2 top-0 left-0">
                <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Suggested Categories</div>
                {suggestedCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                    onClick={() => {
                      router.push(`/shop?category=${encodeURIComponent(cat)}`);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      setIsSearchFocused(false);
                    }}
                  >
                    <span className="font-bold text-gray-700 group-hover:text-mint-600">{cat}</span>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-mint-500">Jump to category <ArrowRight className="inline w-3 h-3 ml-1" /></span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Sidebar Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <span className="font-extrabold text-[1.4rem] tracking-tight text-[#29bc89]">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className="px-4 py-4 text-lg font-bold text-gray-900 hover:bg-[#E8F5F2] hover:text-mint-600 rounded-2xl flex justify-between items-center transition-colors">
                Home <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/shop" className="px-4 py-4 text-lg font-bold text-gray-900 hover:bg-[#E8F5F2] hover:text-mint-600 rounded-2xl flex justify-between items-center transition-colors">
                Shop All <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/shop?category=Oversized" className="px-4 py-4 text-lg font-bold text-gray-900 hover:bg-[#E8F5F2] hover:text-mint-600 rounded-2xl flex justify-between items-center transition-colors">
                Oversized <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/shop?category=Streetwear" className="px-4 py-4 text-lg font-bold text-gray-900 hover:bg-[#E8F5F2] hover:text-mint-600 rounded-2xl flex justify-between items-center transition-colors">
                Streetwear <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/shop?category=Couple" className="px-4 py-4 text-lg font-bold text-gray-900 hover:bg-[#E8F5F2] hover:text-mint-600 rounded-2xl flex justify-between items-center transition-colors">
                Couple Tees <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl mb-2 text-left">
                    {user?.image ? (
                      <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 bg-mint-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex justify-between items-center px-5 py-4 border border-gray-200 rounded-xl text-base font-bold text-gray-800 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Package className="w-5 h-5 text-mint-600" /> Order History</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  {user?.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex justify-between items-center px-5 py-4 border border-[#29bc89] rounded-xl text-base font-bold text-[#29bc89] bg-[#E8F5F2] hover:bg-[#d1f0e8] transition-colors"
                    >
                      <span className="flex items-center gap-2">⚙️ Admin Panel</span>
                      <ArrowRight className="w-4 h-4 text-[#29bc89]" />
                    </Link>
                  )}

                  <button
                    onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                    className="w-full justify-center items-center px-5 py-4 border border-red-200 rounded-xl text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full inline-flex justify-center items-center px-5 py-4 border border-gray-200 rounded-xl text-base font-bold text-gray-800 bg-white hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
