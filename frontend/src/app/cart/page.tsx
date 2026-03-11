"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ArrowRight, ArrowLeft, Shield } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useCoupons, Coupon } from "@/context/CouponsContext";

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, discountAmount, applyDiscount, removeDiscount, appliedCouponCode } = useCart();
  const { coupons } = useCoupons();

  const [couponCode, setCouponCode] = useState(appliedCouponCode || "");
  const [couponError, setCouponError] = useState("");

  // We map the string identifier back to the actual Coupon element so the UI can draw the card
  const appliedCoupon = coupons.find(c => c.code === appliedCouponCode);

  const handleApplyCoupon = () => {
    setCouponError("");
    const found = coupons.find(c => c.code === couponCode.trim().toUpperCase());
    
    if (!found) {
      setCouponError("Invalid coupon code.");
      return;
    }
    if (found.status === "Expired") {
      setCouponError("This coupon has expired.");
      return;
    }
    
    const currentSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (found.minOrderValue > 0 && currentSubtotal < found.minOrderValue) {
      setCouponError(`This coupon requires a minimum order of ₹${found.minOrderValue}.`);
      return;
    }
    
    let amountToDiscount = 0;
    if (found.discountType === "percentage") {
      amountToDiscount = (currentSubtotal * found.discountValue) / 100;
    } else {
      amountToDiscount = found.discountValue;
    }
    if (amountToDiscount > currentSubtotal) amountToDiscount = currentSubtotal;

    applyDiscount(amountToDiscount, found.code);
  };

  const clearCoupon = () => {
    removeDiscount();
    setCouponCode("");
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Dynamic watcher: If users delete enough cart items to fall back under the minimum order threshold
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrderValue > 0 && subtotal < appliedCoupon.minOrderValue) {
      removeDiscount();
      setCouponError(`The ₹${appliedCoupon.minOrderValue} minimum for code ${appliedCoupon.code} is no longer met.`);
    } else if (appliedCoupon) {
       // Also dynamically recalculate the percentage since the subtotal value shifts on quantity updates
       let amountToDiscount = 0;
       if (appliedCoupon.discountType === "percentage") {
         amountToDiscount = (subtotal * appliedCoupon.discountValue) / 100;
       } else {
         amountToDiscount = appliedCoupon.discountValue;
       }
       if (amountToDiscount > subtotal) amountToDiscount = subtotal;
       
       if (amountToDiscount !== discountAmount) {
         applyDiscount(amountToDiscount, appliedCoupon.code);
       }
    }
  }, [subtotal, appliedCoupon, removeDiscount, applyDiscount, discountAmount]);

  const shipping = subtotal > 999 ? 0 : 99;
  const taxableAmount = subtotal - discountAmount;
  const tax = Math.round((taxableAmount > 0 ? taxableAmount : 0) * 0.05); // 5% mock tax
  const total = taxableAmount + shipping + tax;

  return (
    <div className="bg-white min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-mint-600 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              href="/shop" 
              className="inline-flex justify-center items-center px-8 py-4 text-white bg-mint-600 hover:bg-mint-500 rounded-full font-bold transition-all hover-lift shadow-lg"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Cart Items */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header built for desktop visibility */}
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                      
                      {/* Product Mobile & Desktop */}
                      <div className="col-span-6 flex gap-4 w-full">
                        <div className="w-20 h-24 sm:w-24 sm:h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden hover-lift">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 hover:text-mint-600 transition-colors line-clamp-2 mb-1">
                            <Link href={`/product/${item.id}`}>{item.name}</Link>
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">Color: {item.color} | Size: {item.size}</p>
                          <p className="font-bold text-gray-900 sm:hidden">₹{item.price}</p>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-3 flex justify-between sm:justify-center items-center w-full sm:w-auto mt-4 sm:mt-0">
                        <span className="sm:hidden text-sm font-medium text-gray-500">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg h-10 bg-white">
                          <button 
                            className="px-3 text-lg font-medium hover:text-mint-600 text-gray-600"
                            onClick={() => updateQuantity(item.id, -1)}
                          >-</button>
                          <span className="w-8 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                          <button 
                            className="px-3 text-lg font-medium hover:text-mint-600 text-gray-600"
                            onClick={() => updateQuantity(item.id, 1)}
                          >+</button>
                        </div>
                      </div>

                      {/* Price Desktop only */}
                      <div className="hidden sm:block col-span-2 text-right text-lg font-bold text-gray-900">
                        ₹{item.price * item.quantity}
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1 flex justify-end w-full sm:w-auto mt-2 sm:mt-0">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <Link href="/shop" className="text-mint-600 hover:text-mint-700 font-bold flex items-center group">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Continue Shopping
                </Link>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Secure Checkout Guaranteed
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 text-gray-600 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{subtotal}</span>
                  </div>
                  
                  {/* Coupon Input Area */}
                  <div className="pt-2 pb-2">
                    {!appliedCoupon ? (
                      <div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Promo Code" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none text-sm uppercase"
                          />
                          <button 
                            onClick={handleApplyCoupon}
                            className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg text-sm hover:bg-gray-800 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-mint-50 border border-mint-200 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-mint-700 font-bold text-sm">{appliedCoupon.code}</span>
                          <span className="text-mint-600/80 text-xs">
                            ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`} OFF)
                          </span>
                        </div>
                        <button onClick={clearCoupon} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                      </div>
                    )}
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-mint-600 font-bold">
                      <span>Discount</span>
                      <span>-₹{Math.round(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold text-gray-900">{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-bold text-gray-900">₹{tax}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Total</h3>
                    <p className="text-xs text-gray-500 mt-1">Including VAT</p>
                  </div>
                  <span className="text-3xl font-extrabold text-mint-600">₹{total}</span>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full bg-mint-600 hover:bg-mint-500 text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover-lift shadow-mint-500/30 shadow-lg"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

                <div className="mt-6 flex gap-2 justify-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  {/* Mock payment icons using divs for layout styling purposes */}
                  <div className="w-10 h-6 bg-blue-900 rounded flex justify-center text-[10px] text-white font-bold items-center leading-none">VISA</div>
                  <div className="w-10 h-6 bg-red-600 rounded flex justify-center text-[10px] text-white font-bold items-center leading-none">MC</div>
                  <div className="w-10 h-6 bg-sky-500 rounded flex justify-center text-[10px] text-white font-bold items-center leading-none">UPI</div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
