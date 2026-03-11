"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, MoreVertical, X, AlertTriangle, Package } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";

export default function AdminProductsPage() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Oversized",
    price: "",
    originalPrice: "",
    stock: "",
    status: "Active",
    images: [] as string[],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Mint"],
    sizeStock: { "S": 0, "M": 0, "L": 0, "XL": 0 } as Record<string, number>,
    colorStock: { "Black": 0, "White": 0, "Mint": 0 } as Record<string, number>
  });

  const [newSizeInput, setNewSizeInput] = useState("");
  const [newColorInput, setNewColorInput] = useState("");

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "All Status" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({ 
          ...prev, 
          images: [...prev.images, reader.result as string] 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setNewProduct(prev => {
      const newImages = [...prev.images];
      if (direction === 'left' && index > 0) {
        // Swap with previous
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      } else if (direction === 'right' && index < newImages.length - 1) {
        // Swap with next
        [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      }
      return { ...prev, images: newImages };
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    
    if (editingId) {
      // Edit existing product
      updateProduct(editingId, {
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price.startsWith('₹') ? newProduct.price.replace('₹', '') : newProduct.price,
        originalPrice: Number(newProduct.originalPrice) || 0,
        stock: parseInt(newProduct.stock.toString()) || 0,
        status: parseInt(newProduct.stock.toString()) <= 0 ? "Out of Stock" : parseInt(newProduct.stock.toString()) <= 10 ? "Low Stock" : "Active",
        images: newProduct.images.length > 0 ? newProduct.images : undefined, // Only patch if exists
        sizeStock: newProduct.sizeStock,
        colorStock: newProduct.colorStock
      });
    } else {
      // Add new product
      const productToAdd = {
        id: Math.random().toString(36).substr(2, 9),
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price.replace('₹', ''),
        originalPrice: Number(newProduct.originalPrice) || 0,
        stock: parseInt(newProduct.stock.toString()) || 0,
        status: parseInt(newProduct.stock.toString()) <= 0 ? "Out of Stock" : parseInt(newProduct.stock.toString()) <= 10 ? "Low Stock" : "Active",
        rating: 5,
        reviews: 0,
        images: newProduct.images.length > 0 ? newProduct.images : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"],
        colors: newProduct.colors,
        sizes: newProduct.sizes,
        sizeStock: newProduct.sizeStock,
        colorStock: newProduct.colorStock
      };
      addProduct(productToAdd);
    }

    setNewProduct({ 
      name: "", category: "Oversized", price: "", originalPrice: "", stock: "", status: "Active", images: [],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Mint"],
      sizeStock: { "S": 0, "M": 0, "L": 0, "XL": 0 },
      colorStock: { "Black": 0, "White": 0, "Mint": 0 }
    });
    setEditingId(null);
    setIsAddModalOpen(false);
  };

  const handleEditInit = (product: any) => {
    setEditingId(product.id);
    const sizes = product.sizes || ["S", "M", "L", "XL"];
    const colors = product.colors || ["Black", "White", "Mint"];
    // Ensure every size/color has a stock entry (default 0) to avoid uncontrolled input errors
    const sizeStock: Record<string, number> = {};
    sizes.forEach((s: string) => { sizeStock[s] = product.sizeStock?.[s] ?? 0; });
    const colorStock: Record<string, number> = {};
    colors.forEach((c: string) => { colorStock[c] = product.colorStock?.[c] ?? 0; });
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString().replace('₹', ''),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : "",
      stock: product.stock.toString(),
      status: product.status,
      images: product.images || [],
      sizes,
      colors,
      sizeStock,
      colorStock
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  // We deleted the fetchAdminProducts useEffect because we are using ProductsContext globally

  const LOW_STOCK_THRESHOLD = 10;
  const lowStockProducts = products.filter((p: any) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
  const outOfStockProducts = products.filter((p: any) => p.stock <= 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">Manage your store catalog and inventory.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewProduct({ 
              name: "", category: "Oversized", price: "", originalPrice: "", stock: "", status: "Active", images: [],
              sizes: ["S", "M", "L", "XL"],
              colors: ["Black", "White", "Mint"],
              sizeStock: { "S": 0, "M": 0, "L": 0, "XL": 0 },
              colorStock: { "Black": 0, "White": 0, "Mint": 0 }
            });
            setIsAddModalOpen(true);
          }}
          className="bg-mint-600 hover:bg-mint-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors hover-lift"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Stock Alert Banners */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="space-y-3">
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-800">Low Stock Alert</h3>
                <p className="text-sm text-amber-700 mt-0.5">
                  <span className="font-bold">{lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''}</span> running low (≤{LOW_STOCK_THRESHOLD} units):
                  <span className="ml-1 font-medium">
                    {lowStockProducts.map((p: any) => `${p.name} (${p.stock})`).join(' · ')}
                  </span>
                </p>
              </div>
            </div>
          )}
          {outOfStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Package className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800">Out of Stock</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  <span className="font-bold">{outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's' : ''}</span> completely out of stock:
                  <span className="ml-1 font-medium">
                    {outOfStockProducts.map((p: any) => p.name).join(' · ')}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-mint-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Syncing with MongoDB Server...</p>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none text-sm transition-colors text-black"
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-mint-500 focus:outline-none"
            >
              <option>All Categories</option>
              <option>Oversized</option>
              <option>Streetwear</option>
              <option>Couple</option>
              <option>T-Shirts</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-mint-500 focus:outline-none"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Out of Stock</option>
              <option>Low Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src={product.images?.[0] || `https://images.unsplash.com/photo-${1500000000000 + String(product.id).charCodeAt(0) * 500}?auto=format&fit=crop&q=80&w=100`} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>₹{product.price}</span>
                      {product.originalPrice > Number(product.price) && Number(product.price) > 0 && (
                        <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-[60px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          {product.stock <= 0 ? (
                            <Package size={13} className="text-red-500" />
                          ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                            <AlertTriangle size={13} className="text-amber-500" />
                          ) : null}
                          <span className={`text-sm font-bold ${
                            product.stock <= 0 ? 'text-red-600' :
                            product.stock <= LOW_STOCK_THRESHOLD ? 'text-amber-600' :
                            'text-gray-900'
                          }`}>
                            {product.stock}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${
                              product.stock <= 0 ? 'bg-red-400 w-0' :
                              product.stock <= LOW_STOCK_THRESHOLD ? 'bg-amber-400' :
                              'bg-emerald-400'
                            }`}
                            style={{ width: product.stock <= 0 ? '0%' : `${Math.min(100, (product.stock / 50) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      product.status === 'Active' ? 'bg-green-100 text-green-700' :
                      product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditInit(product)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Showing {filteredProducts.length > 0 ? 1 : 0} to {filteredProducts.length} of {filteredProducts.length} entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-mint-600 bg-mint-50 text-mint-700 rounded font-medium">1</button>
            <button className="px-3 py-1 border border-gray-200 hover:bg-gray-50 rounded">2</button>
            <button className="px-3 py-1 border border-gray-200 hover:bg-gray-50 rounded">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded">Next</button>
          </div>
        </div>
      </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl z-10 p-6 m-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none text-black"
                  placeholder="Vintage Drop-Shoulder Tee"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Images</label>
                
                {/* Images Preview Grid */}
                {newProduct.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 mb-3 snap-x">
                    {newProduct.images.map((img, idx) => (
                      <div key={idx} className="relative group shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 snap-center">
                        <img src={img} alt={`Product photo ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                          <button 
                            onClick={() => removeImage(idx)} 
                            className="self-end bg-white/90 hover:bg-red-50 hover:text-red-500 text-gray-700 rounded-full p-1 transition-colors"
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                          
                          <div className="flex justify-between gap-1">
                            <button 
                              onClick={() => moveImage(idx, 'left')} 
                              disabled={idx === 0}
                              className="bg-white/90 hover:bg-mint-50 text-gray-700 disabled:opacity-50 disabled:hover:bg-white/90 rounded p-1 transition-colors"
                              title="Move Left"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                            {idx === 0 && <span className="text-[10px] font-bold text-white bg-mint-600 px-1.5 py-0.5 rounded shadow-sm">Main</span>}
                            <button 
                              onClick={() => moveImage(idx, 'right')} 
                              disabled={idx === newProduct.images.length - 1}
                              className="bg-white/90 hover:bg-mint-50 text-gray-700 disabled:opacity-50 disabled:hover:bg-white/90 rounded p-1 transition-colors"
                              title="Move Right"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-mint-50 file:text-mint-700 hover:file:bg-mint-100 transition-colors cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-1 pl-2">Upload multiple images one by one. First image is the main display.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                >
                  <option>Oversized</option>
                  <option>Streetwear</option>
                  <option>T-Shirts</option>
                  <option>Couple</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                    placeholder="999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Original Price / MRP (₹)</label>
                  <input 
                    type="number" 
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                    placeholder="1499"
                  />
                </div>
              </div>
              {/* Live Discount Preview */}
              {(() => {
                const sp = Number(newProduct.price);
                const op = Number(newProduct.originalPrice);
                if (op > sp && sp > 0) {
                  const pct = Math.round((1 - sp / op) * 100);
                  return (
                    <div className="flex items-center gap-2 px-1 -mt-1">
                      <span className="bg-[#FF6B6B] text-white text-[10px] font-bold px-2 py-[3px] rounded-full">-{pct}%</span>
                      <span className="text-xs text-gray-500">Customers will see <span className="font-bold text-gray-900">₹{sp}</span> <span className="line-through">₹{op}</span></span>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Level</label>
                  <input 
                    type="number" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Variant Inventories</label>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs text-mint-600 font-bold uppercase mb-2 block tracking-wider">Stock by Size</span>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {newProduct.sizes.map(size => (
                        <div key={size} className="flex items-center gap-2 group relative">
                          <label className="text-xs font-bold text-gray-500 w-4">{size}</label>
                          <input 
                            type="number"
                            min="0"
                            value={newProduct.sizeStock[size]}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, sizeStock: { ...prev.sizeStock, [size]: parseInt(e.target.value) || 0 } }))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-mint-500 outline-none"
                          />
                          <button 
                            onClick={() => {
                              setNewProduct(prev => {
                                const newSizes = prev.sizes.filter(s => s !== size);
                                const newSizeStock = { ...prev.sizeStock };
                                delete newSizeStock[size];
                                return { ...prev, sizes: newSizes, sizeStock: newSizeStock };
                              });
                            }}
                            className="absolute -right-6 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm border border-gray-100"
                            title="Remove Size"
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Add Custom Size Button */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newSizeInput} 
                        onChange={(e) => setNewSizeInput(e.target.value.toUpperCase())}
                        placeholder="New Size (e.g. XXL)" 
                        className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (newSizeInput && !newProduct.sizes.includes(newSizeInput)) {
                            setNewProduct(prev => ({
                              ...prev,
                              sizes: [...prev.sizes, newSizeInput],
                              sizeStock: { ...prev.sizeStock, [newSizeInput]: 0 }
                            }));
                            setNewSizeInput("");
                          }
                        }}
                        className="bg-mint-50 text-mint-700 p-1.5 rounded-lg border border-mint-200 hover:bg-mint-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-mint-600 font-bold uppercase mb-2 block tracking-wider">Stock by Color</span>
                    <div className="space-y-2 mb-3">
                      {newProduct.colors.map(color => (
                        <div key={color} className="flex items-center gap-2 group relative pr-4">
                          <label className="text-xs font-bold text-gray-500 w-10 text-right truncate">{color}</label>
                          <input 
                            type="number"
                            min="0"
                            value={newProduct.colorStock[color]}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, colorStock: { ...prev.colorStock, [color]: parseInt(e.target.value) || 0 } }))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-mint-500 outline-none"
                          />
                          <button 
                            onClick={() => {
                              setNewProduct(prev => {
                                const newColors = prev.colors.filter(c => c !== color);
                                const newColorStock = { ...prev.colorStock };
                                delete newColorStock[color];
                                return { ...prev, colors: newColors, colorStock: newColorStock };
                              });
                            }}
                            className="absolute right-0 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm border border-gray-100"
                            title="Remove Color"
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Add Custom Color Button */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newColorInput} 
                        onChange={(e) => setNewColorInput(e.target.value)}
                        placeholder="New Color (e.g. Red)" 
                        className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (newColorInput && !newProduct.colors.includes(newColorInput)) {
                            setNewProduct(prev => ({
                              ...prev,
                              colors: [...prev.colors, newColorInput],
                              colorStock: { ...prev.colorStock, [newColorInput]: 0 }
                            }));
                            setNewColorInput("");
                          }
                        }}
                        className="bg-mint-50 text-mint-700 p-1.5 rounded-lg border border-mint-200 hover:bg-mint-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProduct}
                className="flex-1 px-4 py-2 bg-mint-600 text-white rounded-xl font-bold hover:bg-mint-500 transition-colors"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
