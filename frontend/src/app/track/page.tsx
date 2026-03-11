"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Search, Mail, MapPin } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mockResult, setMockResult] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;
    
    setIsSearching(true);
    // Simulate network request
    setTimeout(() => {
      setIsSearching(false);
      setMockResult(true);
    }, 1500);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-[70vh] py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-mint-600 mb-6 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-mint-100 text-mint-600 rounded-full mb-6">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-500">
            Enter your Order ID and Email Address below to track the real-time status of your package.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          {!mockResult ? (
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <label htmlFor="orderId" className="block text-sm font-bold text-gray-900 mb-2">Order ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500 text-gray-900 placeholder-gray-400 font-medium"
                    placeholder="e.g. TF10482"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500 text-gray-900 placeholder-gray-400 font-medium"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-4 bg-mint-600 hover:bg-mint-500 text-white font-bold rounded-xl transition-all shadow-md shadow-mint-500/20 disabled:opacity-70 flex justify-center items-center"
              >
                {isSearching ? "Searching..." : "Track My Package"}
              </button>
            </form>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-1">Order {orderId}</h3>
                  <p className="text-gray-500 font-medium text-sm">Shipped via BlueDart</p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 font-bold text-sm rounded-lg">
                  In Transit
                </div>
              </div>

              {/* Minimal Tracking Timeline */}
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-mint-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-mint-200">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-gray-900">Out for Delivery</div>
                      <time className="text-xs font-medium text-mint-600">Today, 08:32 AM</time>
                    </div>
                    <div className="text-sm text-gray-600">Your package is out for delivery in Mumbai, MH.</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-300 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm bg-white border border-gray-100">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-gray-900">Arrived at Hub</div>
                      <time className="text-xs font-medium text-gray-500">Yesterday, 14:15 PM</time>
                    </div>
                    <div className="text-sm text-gray-500">Package arrived at sort facility in Mumbai, MH.</div>
                  </div>
                </div>

              </div>
              
              <button
                onClick={() => { setMockResult(false); setOrderId(""); setEmail(""); }}
                className="mt-10 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors border border-gray-200"
              >
                Track Another Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
