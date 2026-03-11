"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, Edit2, X } from "lucide-react";
import { useCoupons, Coupon } from "@/context/CouponsContext";

export default function AdminCouponsPage() {
  const { coupons, isLoading, addCoupon, updateCoupon, deleteCoupon } = useCoupons();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Coupon, "id" | "timesUsed">>({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    expiry: "",
    status: "Active"
  });

  const handleSubmit = () => {
    if (!formData.code || formData.discountValue <= 0 || !formData.expiry) return;

    if (editingId) {
      updateCoupon(editingId, formData);
    } else {
      addCoupon(formData);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      expiry: "",
      status: "Active"
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      expiry: coupon.expiry,
      status: coupon.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteCoupon(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Coupons</h1>
          <p className="text-gray-500 text-sm">Manage dynamic promotional rules.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ code: "", discountType: "percentage", discountValue: 0, minOrderValue: 0, expiry: "", status: "Active" });
            setIsModalOpen(true);
          }}
          className="bg-mint-600 hover:bg-mint-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors hover-lift"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-mint-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Fetching coupons from MongoDB...</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-mint-50 rounded-bl-[100%] flex items-start justify-end p-3">
              <Tag size={18} className="text-mint-600" />
            </div>
            
            <div className="flex justify-between items-start mb-4 pr-12">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight border-2 border-dashed border-gray-300 px-3 py-1 bg-gray-50 rounded select-all cursor-pointer">
                {coupon.code}
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-3xl font-black text-mint-600 mb-1">
                {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
              </p>
              <p className="text-sm text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                Valid until {coupon.expiry} {coupon.minOrderValue > 0 && `• Min ₹${coupon.minOrderValue}`}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  coupon.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {coupon.status}
                </span>
                <span className="text-xs text-gray-500 ml-2">{coupon.timesUsed} uses</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(coupon)}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(coupon.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl z-10 p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? "Edit Coupon" : "Create New Coupon"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none uppercase"
                  placeholder="e.g. SUMMER50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value as any})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Value</label>
                  <input 
                    type="number" 
                    value={formData.discountValue || ""}
                    onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Order Value (₹)</label>
                <input 
                  type="number" 
                  value={formData.minOrderValue || ""}
                  onChange={(e) => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                  placeholder="e.g. 999 (Leave 0 for no minimum)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Expiry Date</label>
                  <input 
                    type="date" 
                    value={formData.expiry}
                    onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-mint-600 text-white rounded-xl font-bold hover:bg-mint-500 transition-colors"
              >
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
