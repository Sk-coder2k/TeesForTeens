"use client";

import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { useState } from 'react';

const INSTAGRAM_URL = "https://www.instagram.com/tees.forteens?igsh=YXlybzBpMm5nNWQ1&utm_source=qr";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/contact/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("You're subscribed! Check your inbox 🎉");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <footer className="bg-mint-50 text-gray-900 pt-10 pb-6 sm:pt-16 sm:pb-8 border-t border-mint-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tighter text-mint-800">TeesforTeens.</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Shop trendy oversized t-shirts, streetwear styles, and couple collections designed for the modern generation.
            </p>
            <div className="flex space-x-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mint-600 hover:text-mint-900 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/shop" className="hover:text-mint-800 transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=Oversized" className="hover:text-mint-800 transition-colors">Oversized Tees</Link></li>
              <li><Link href="/shop?category=Streetwear" className="hover:text-mint-800 transition-colors">Streetwear</Link></li>
              <li><Link href="/shop?category=Couple" className="hover:text-mint-800 transition-colors">Couple T-Shirts</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/faq" className="hover:text-mint-800 transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-mint-800 transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/contact" className="hover:text-mint-800 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Newsletter</h4>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>

            {status === "success" ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                {message}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-2 bg-white border border-mint-200 rounded-l-md focus:outline-none focus:ring-1 focus:ring-mint-500 text-sm text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-4 py-2 bg-mint-600 hover:bg-mint-500 text-white text-sm font-medium rounded-r-md transition-colors disabled:opacity-60 whitespace-nowrap"
                  >
                    {status === "loading" ? "..." : "Subscribe"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="text-xs text-red-500 font-medium">{message}</p>
                )}
              </form>
            )}
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-mint-200 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} TeesforTeens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
