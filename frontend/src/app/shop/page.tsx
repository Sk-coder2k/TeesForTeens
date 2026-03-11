"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown, Check, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";

// Mock Data
const PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: `Urban Style Tee ${i + 1}`,
  price: 799 + (i * 50),
  category: i % 3 === 0 ? "Oversized" : i % 3 === 1 ? "Streetwear" : "Couple",
  rating: 4 + Math.random(),
  reviews: Math.floor(Math.random() * 100) + 10,
  image: `https://images.unsplash.com/photo-${1500000000000 + i * 500}?auto=format&fit=crop&q=80&w=600`,
  colors: ["Black", "White", "Mint"],
  sizes: ["S", "M", "L", "XL"]
}));

const CATEGORIES = ["All", "T-Shirts", "Classic", "Oversized", "Couple", "Streetwear"];
const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Mint", hex: "#a7f3d0" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Red", hex: "#ef4444" }
];

import { MOCK_PRODUCTS } from "@/lib/mockData";

function ShopContent() {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get('category') || 'All';
  const defaultSearchQuery = searchParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(2500);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const { products: productsDb, isLoading } = useProducts();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
    else setActiveCategory('All');
    
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    else setSearchQuery('');
  }, [searchParams]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setPriceRange(2500);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const suggestedCategories = CATEGORIES.filter(cat => 
    cat !== "All" && searchQuery && cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simple simulated filter filtering logic based on items
  const filteredProducts = productsDb.filter(item => {
    if (activeCategory !== "All" && item.category !== activeCategory) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesCategory = item.category.toLowerCase().includes(q);
      if (!matchesName && !matchesCategory) return false;
    }
    
    // Price filter
    if (Number(item.price) > priceRange) return false;
    
    // Size filter (mock sizes if not present)
    const itemSizes = ["S", "M", "L", "XL"]; 
    if (selectedSizes.length > 0 && !selectedSizes.some(size => itemSizes.includes(size))) return false;
    
    // Color filter (mock colors if not present, assigning basic colors based on name roughly)
    const itemColors = item.name.includes("White") ? ["White"] : 
                       item.name.includes("Black") ? ["Black"] : 
                       item.name.includes("Mint") ? ["Mint"] :
                       item.name.includes("Navy") ? ["Navy"] : ["Black", "White", "Mint"];
    if (selectedColors.length > 0 && !selectedColors.some(color => itemColors.includes(color))) return false;

    return true;
  });

  // Show skeleton if fetching from MongoDB
  if (isLoading) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-mint-600 mb-6 transition-colors group">
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <div className="mb-10 text-left">
            <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mt-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-3xl bg-white shadow-sm overflow-hidden animate-pulse border border-gray-100">
                <div className="aspect-[4/5] bg-gray-100"></div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14">
        
        {/* Header */}
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-mint-600 mb-6 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <div className="mb-10 text-left">
          <h1 className="text-[2.5rem] font-extrabold text-gray-900 tracking-tight mb-2">
            {activeCategory === "All" ? "Shop All" : `${activeCategory} Collection`}
          </h1>
          <p className="text-gray-500 font-medium">{filteredProducts.length} products found</p>
        </div>

        {/* Search & Utility Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[1.2rem] focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-transparent text-[15px] font-medium placeholder-gray-400 shadow-sm"
            />
            
            {/* Category Suggestions Dropdown */}
            {searchQuery && isSearchFocused && suggestedCategories.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-2 top-full left-0 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Suggested Categories</div>
                {suggestedCategories.map(cat => (
                  <button
                    key={cat}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                    onClick={() => {
                      setActiveCategory(cat);
                      setSearchQuery("");
                      setIsSearchFocused(false);
                    }}
                  >
                    <span className="font-bold text-gray-700 group-hover:text-mint-600">{cat}</span>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-mint-500">Jump to category <ChevronDown className="inline w-3 h-3 -rotate-90 ml-1" /></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3.5 border rounded-[1.2rem] font-bold transition-colors shadow-sm ${
              showFilters || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange < 2500
                ? 'bg-mint-50 border-mint-200 text-mint-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {(selectedSizes.length > 0 || selectedColors.length > 0 || priceRange < 2500) && (
              <span className="ml-1 w-2 h-2 rounded-full bg-mint-500"></span>
            )}
          </button>
        </div>

        {/* Slide-down Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 lg:p-8 mb-8 shadow-sm animate-in slide-in-from-top-4 fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
              <button onClick={clearFilters} className="text-sm font-bold text-mint-600 hover:text-mint-700">
                Reset All
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {/* Category */}
              <div>
                <h4 className="text-sm font-bold tracking-wider text-gray-900 uppercase mb-4">Category</h4>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-left text-sm font-medium transition-colors ${
                        activeCategory === cat 
                          ? 'text-mint-600 font-bold flex items-center' 
                          : 'text-gray-600 hover:text-mint-600'
                      }`}
                    >
                      {activeCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-mint-500 mr-2"></span>}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-bold tracking-wider text-gray-900 uppercase mb-4">Max Price: ₹{priceRange}</h4>
                <input 
                  type="range" 
                  min="0" 
                  max="2500" 
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mint-600"
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500 font-medium">
                  <span>₹0</span>
                  <span>₹2500</span>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-sm font-bold tracking-wider text-gray-900 uppercase mb-4">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button 
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-10 h-10 rounded-xl border font-bold flex items-center justify-center transition-all ${
                        selectedSizes.includes(size) 
                          ? 'border-mint-600 bg-mint-50 text-mint-700' 
                          : 'border-gray-200 text-gray-600 hover:border-mint-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="text-sm font-bold tracking-wider text-gray-900 uppercase mb-4">Color</h4>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button 
                      key={color.name}
                      title={color.name}
                      onClick={() => toggleColor(color.name)}
                      className="relative w-10 h-10 rounded-full border border-gray-300 shadow-sm transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColors.includes(color.name) && (
                        <Check className={`w-5 h-5 ${color.name === 'White' ? 'text-black' : 'text-white'}`} strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Category Chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                activeCategory === cat 
                  ? 'bg-mint-500 text-white' 
                  : 'bg-[#E8F5F2] text-gray-700 hover:bg-mint-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product, i) => (
             <ProductCard key={i} item={product} />
          ))}
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
