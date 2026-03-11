"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTrending } from "@/context/TrendingContext";
import { useHomepage } from "@/context/HomepageContext";
import { useProducts } from "@/context/ProductsContext";

const EMOJI_OPTIONS = ["🔥", "⚡", "✨", "🆕", "💥", "👑", "🎯", "🌟"];

export default function HomepageManager() {
  const { trending, updateTrending } = useTrending();
  const {
    categories,
    setCategories,
    featuredIds,
    setFeaturedIds,
    bestsellerIds,
    setBestsellerIds,
  } = useHomepage();
  const { products } = useProducts();

  const [trendingForm, setTrendingForm] = useState({
    name: trending.name,
    subtitle: trending.subtitle,
    emoji: trending.emoji,
    image: trending.image || "",
    heroImages: (trending.heroImages || []) as string[],
  });
  const [newHeroUrl, setNewHeroUrl] = useState("");
  const [trendingSaved, setTrendingSaved] = useState(false);

  // Sync form when trending loads from localStorage (timing fix)
  useEffect(() => {
    setTrendingForm({
      name: trending.name,
      subtitle: trending.subtitle,
      emoji: trending.emoji,
      image: trending.image || "",
      heroImages: trending.heroImages || [],
    });
  }, [trending]);

  // Compress image before storing to avoid localStorage quota errors
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = (h * MAX) / w; w = MAX; }
        if (h > MAX) { w = (w * MAX) / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = url;
    });
  };
  const [newCat, setNewCat] = useState({
    name: "",
    query: "",
    count: "",
    image: "",
  });
  const [catSaved, setCatSaved] = useState(false);
  const [sectionSaved, setSectionSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "trending" | "categories" | "featured" | "bestsellers"
  >("trending");

  const handleTrendingSave = async () => {
    await updateTrending(trendingForm);
    setTrendingSaved(true);
    setTimeout(() => setTrendingSaved(false), 2500);
  };

  const handleAddCategory = () => {
    if (!newCat.name || !newCat.query) return;
    setCategories([...categories, { ...newCat, id: Date.now().toString() }]);
    setNewCat({ name: "", query: "", count: "", image: "" });
    setCatSaved(true);
    setTimeout(() => setCatSaved(false), 2000);
  };

  const handleDeleteCategory = (id: string) =>
    setCategories(categories.filter((c) => c.id !== id));

  const toggleFeatured = (id: string) => {
    if (featuredIds.includes(id))
      setFeaturedIds(featuredIds.filter((f) => f !== id));
    else if (featuredIds.length < 4) setFeaturedIds([...featuredIds, id]);
  };

  const toggleBestseller = (id: string) => {
    if (bestsellerIds.includes(id))
      setBestsellerIds(bestsellerIds.filter((b) => b !== id));
    else if (bestsellerIds.length < 4) setBestsellerIds([...bestsellerIds, id]);
  };

  const handleSaveSection = () => {
    setSectionSaved(true);
    setTimeout(() => setSectionSaved(false), 2000);
  };

  const tabs = [
    { key: "trending", label: "🔥 Trending Badge" },
    { key: "categories", label: "🗂 Categories" },
    { key: "featured", label: "⭐ Featured Picks" },
    { key: "bestsellers", label: "🏆 Best Sellers" },
  ];

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#29bc89]";
  const gridInputClass =
    "border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#29bc89]";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Homepage Manager</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all homepage sections from here
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex gap-1 p-4 border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-[#29bc89] text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "trending" && (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    value={trendingForm.name}
                    onChange={(e) =>
                      setTrendingForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Trending Now"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={trendingForm.subtitle}
                    onChange={(e) =>
                      setTrendingForm((p) => ({
                        ...p,
                        subtitle: e.target.value,
                      }))
                    }
                    placeholder="e.g. Oversized Mint Tee"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Hero Slides
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      1 image = fixed, 2+ images = auto slideshow
                    </span>
                  </label>

                  {/* Existing images */}
                  {trendingForm.heroImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {trendingForm.heroImages.map((img: string, idx: number) => (
                        <div key={idx} className="relative h-28 rounded-xl overflow-hidden border border-gray-200 group">
                          <img src={img} alt={`slide ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">Slide {idx + 1}</span>
                            <button
                              onClick={() => setTrendingForm(p => ({ ...p, heroImages: p.heroImages.filter((_: string, i: number) => i !== idx) }))}
                              className="text-white bg-red-500 hover:bg-red-600 text-xs font-bold px-2 py-1 rounded-full"
                            >✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new image */}
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#29bc89] hover:bg-[#E8F5F2] transition-all">
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-xs font-bold text-gray-500">Upload image to add slide</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const compressed = await compressImage(file);
                          setTrendingForm((p) => ({
                            ...p,
                            heroImages: [...p.heroImages, compressed],
                          }));
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-400 text-center">— or paste an image URL —</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHeroUrl}
                        onChange={e => setNewHeroUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className={inputClass + " flex-1"}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newHeroUrl.trim()) return;
                          setTrendingForm(p => ({ ...p, heroImages: [...p.heroImages, newHeroUrl.trim()] }));
                          setNewHeroUrl("");
                        }}
                        className="px-4 py-2 bg-[#29bc89] text-white text-sm font-bold rounded-lg hover:bg-[#23a172] transition-colors whitespace-nowrap"
                      >
                        Add Slide
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Emoji (shown when no image)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() =>
                          setTrendingForm((p) => ({ ...p, emoji }))
                        }
                        className={`w-10 h-10 text-xl rounded-xl border-2 transition-all ${trendingForm.emoji === emoji ? "border-[#29bc89] bg-[#E8F5F2] scale-110" : "border-gray-200"}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleTrendingSave}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${trendingSaved ? "bg-green-500 text-white" : "bg-[#29bc89] hover:bg-[#23a172] text-white"}`}
                >
                  {trendingSaved ? "✅ Saved!" : "Save Changes"}
                </button>
              </div>
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Live Preview
                </p>
                <div className="bg-white p-4 pr-6 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-100">
                  <div className="w-12 h-12 bg-[#E8F5F2] rounded-full flex items-center justify-center text-xl overflow-hidden">
                    {trendingForm.image ? (
                      <img
                        src={trendingForm.image}
                        alt="p"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      trendingForm.emoji
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">
                      {trendingForm.name || "Badge Title"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trendingForm.subtitle || "Product Name"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          👕
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        /{cat.query} • {cat.count} items
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-4">
                  ➕ Add New Category
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Hoodies)"
                    value={newCat.name}
                    onChange={(e) =>
                      setNewCat((p) => ({ ...p, name: e.target.value }))
                    }
                    className={gridInputClass}
                  />
                  <input
                    type="text"
                    placeholder="Filter Query (e.g. Hoodies)"
                    value={newCat.query}
                    onChange={(e) =>
                      setNewCat((p) => ({ ...p, query: e.target.value }))
                    }
                    className={gridInputClass}
                  />
                  <input
                    type="text"
                    placeholder="Item Count (e.g. 60+)"
                    value={newCat.count}
                    onChange={(e) =>
                      setNewCat((p) => ({ ...p, count: e.target.value }))
                    }
                    className={gridInputClass}
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={newCat.image}
                    onChange={(e) =>
                      setNewCat((p) => ({ ...p, image: e.target.value }))
                    }
                    className={gridInputClass}
                  />
                </div>
                <button
                  onClick={handleAddCategory}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${catSaved ? "bg-green-500 text-white" : "bg-[#29bc89] hover:bg-[#23a172] text-white"}`}
                >
                  {catSaved ? (
                    "✅ Category Added!"
                  ) : (
                    <>
                      <Plus size={16} /> Add Category
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "featured" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Select up to <strong>4 products</strong> for Featured Picks. (
                {featuredIds.length}/4 selected)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {products.map((product) => {
                  const isSelected = featuredIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleFeatured(product.id)}
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? "border-[#29bc89] bg-[#E8F5F2]" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={product.images?.[0] || ""}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          ₹{product.price} • {product.category}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold ${isSelected ? "bg-[#29bc89] border-[#29bc89] text-white" : "border-gray-300"}`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleSaveSection}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${sectionSaved ? "bg-green-500 text-white" : "bg-[#29bc89] hover:bg-[#23a172] text-white"}`}
              >
                {sectionSaved ? "✅ Saved!" : "Save Featured Picks"}
              </button>
            </div>
          )}

          {activeTab === "bestsellers" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Select up to <strong>4 products</strong> for Best Sellers. (
                {bestsellerIds.length}/4 selected)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {products.map((product) => {
                  const isSelected = bestsellerIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleBestseller(product.id)}
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? "border-[#29bc89] bg-[#E8F5F2]" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={product.images?.[0] || ""}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          ₹{product.price} • {product.category}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold ${isSelected ? "bg-[#29bc89] border-[#29bc89] text-white" : "border-gray-300"}`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleSaveSection}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${sectionSaved ? "bg-green-500 text-white" : "bg-[#29bc89] hover:bg-[#23a172] text-white"}`}
              >
                {sectionSaved ? "✅ Saved!" : "Save Best Sellers"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
