"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCoupons } from "@/context/CouponsContext";
import { useOrders, Order } from "@/context/OrdersContext";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const { cartItems, clearCart, discountAmount, appliedCouponCode } = useCart();
  const { coupons } = useCoupons();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window === "undefined") return headers;
    const userStr = localStorage.getItem("teesforteens_user");
    if (userStr) {
      const token = JSON.parse(userStr).token;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // Auto-fill from saved profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        const ds = data.defaultShipping;
        if (ds?.address) {
          setHasSavedAddress(true);
          setFormData({
            email: user?.email || data.email || "",
            firstName: ds.firstName || "",
            lastName: ds.lastName || "",
            phone: ds.phone || data.phone || "",
            address: ds.address || "",
            city: ds.city || "",
            state: ds.state || "",
            pincode: ds.pincode || "",
            country: "India",
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            email: user?.email || data.email || "",
            phone: data.phone || "",
          }));
        }
      } catch (e) {}
    };
    if (user) fetchProfile();
    else setFormData((prev) => ({ ...prev, email: user?.email || "" }));
  }, [user]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // We removed the isolated discount fetching since CartContext now manages it natively.
  // The global state syncs `discountAmount` and `appliedCouponCode`.
  const appliedCoupon = coupons.find((c) => c.code === appliedCouponCode);

  const shipping = subtotal > 999 ? 0 : 99;
  const taxableAmount = subtotal - discountAmount;
  const tax = Math.round((taxableAmount > 0 ? taxableAmount : 0) * 0.05);
  const total = taxableAmount + shipping + tax;

  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      router.push("/cart");
    }
  }, [cartItems, orderComplete, router]);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Always save phone to profile if user is logged in
    if (user && formData.phone) {
      try {
        const profileBody: any = { phone: formData.phone };
        // Also save full shipping address if checkbox ticked
        if (saveAsDefault) {
          profileBody.defaultShipping = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          };
        }
        await fetch(`${API_URL}/users/profile`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(profileBody),
        });
        const userStr = localStorage.getItem("teesforteens_user");
        if (userStr) {
          const parsed = JSON.parse(userStr);
          localStorage.setItem(
            "teesforteens_user",
            JSON.stringify({ ...parsed, phone: formData.phone }),
          );
        }
      } catch (e) {
        console.error("Failed to save profile", e);
      }
    }

    if (paymentMethod === "COD") {
      // Fake delay for COD since we haven't wired up backend Orders yet
      setTimeout(async () => {
        // Push this directly into the global orders view
        const numItems = cartItems.reduce(
          (acc, item) => acc + item.quantity,
          0,
        );
        const newOrder = {
          id: `TF${Math.floor(Math.random() * 80000) + 10000}`,
          displayId: "",
          customer:
            user?.name ||
            (formData.firstName
              ? `${formData.firstName} ${formData.lastName}`
              : "Guest User"),
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          total: `₹${total}`,
          items: numItems,
          status: "Pending",
          payment: "Pending",
          paymentMethod: "COD",
          subtotal: String(subtotal),
          tax: String(tax),
          shipping: shipping === 0 ? "Free" : String(shipping),
          discount: String(Math.round(discountAmount)),
          couponCode: appliedCouponCode,
          orderedItems: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            image:
              item.image ||
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=100",
          })),
          shippingDetails: {
            name:
              `${formData.firstName} ${formData.lastName}`.trim() ||
              user?.name ||
              "Guest User",
            email: formData.email || user?.email || "guest@example.com",
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: formData.country,
            fullAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}, ${formData.country}`,
          },
        };

        try {
          await addOrder(newOrder);
          setIsSubmitting(false);
          setOrderComplete(true);
          clearCart();
        } catch (err) {
          setIsSubmitting(false);
          alert("Failed to place order. Please try again.");
        }
      }, 1500);
      return;
    }

    try {
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsSubmitting(false);
        return;
      }

      const url =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

      // We will skip `Authorization: Bearer` headers because we are migrating gradually.
      // Need to adjust the backend `paymentRoutes` to temporarily skip `protect` if testing without full login.
      // But for now, assume this runs and hits the backend.
      const orderRes = await fetch(`${url}/payment/razorpay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemsPrice: total }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok)
        throw new Error(orderData.message || "Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "placeholder_test_key",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TeesforTeens",
        description: "Official Store Purchase",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${url}/payment/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              setOrderComplete(true);

              const numItems = cartItems.reduce(
                (acc, item) => acc + item.quantity,
                0,
              );
              const newOrder = {
                id: `TF${Math.floor(Math.random() * 80000) + 10000}`,
                displayId: "",
                customer:
                  user?.name ||
                  (formData.firstName
                    ? `${formData.firstName} ${formData.lastName}`
                    : "Guest User"),
                date: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                total: `₹${total}`,
                items: numItems,
                status: "Pending",
                payment: "Paid",
                paymentMethod: paymentMethod,
                subtotal: String(subtotal),
                tax: String(tax),
                shipping: shipping === 0 ? "Free" : String(shipping),
                discount: String(Math.round(discountAmount)),
                couponCode: appliedCouponCode,
                orderedItems: cartItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  color: item.color,
                  size: item.size,
                  image:
                    item.image ||
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=100",
                })),
                shippingDetails: {
                  name:
                    `${formData.firstName} ${formData.lastName}`.trim() ||
                    user?.name ||
                    "Guest User",
                  email: formData.email || user?.email || "guest@example.com",
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  country: formData.country,
                  fullAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}, ${formData.country}`,
                },
              };

              try {
                await addOrder(newOrder);
                setOrderComplete(true);
                clearCart();
              } catch (err) {
                alert("Payment complete but failed to save order to database.");
              }
            } else {
              alert(verifyData.message || "Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            alert("Verification error.");
          }
        },
        prefill: {
          name:
            `${formData.firstName} ${formData.lastName}`.trim() ||
            user?.name ||
            "",
          email: formData.email || user?.email || "",
          contact: formData.phone?.replace(/\D/g, "").slice(-10) || "",
        },
        theme: {
          color: "#29bc89",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error(error);
      alert("Something went wrong handling payment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-24 h-24 bg-mint-100 text-mint-600 rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-mint-50">
          <Check className="w-12 h-12" strokeWidth={3} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Thank you for shopping with us. Your order #TF
          {Math.floor(Math.random() * 10000) + 10000} has been placed
          successfully. We've sent a confirmation email to you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/profile"
            className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold shadow-lg hover:bg-black transition-colors hover-lift order-1 sm:order-none"
          >
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="px-8 py-4 bg-mint-600 text-white rounded-full font-bold shadow-lg hover:bg-mint-500 transition-colors hover-lift"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="px-8 py-4 bg-gray-100 text-gray-800 rounded-full font-bold shadow-sm hover:bg-gray-200 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-mint-600 mb-6 transition-colors group"
        >
          <svg
            className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Side: Form */}
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
              Checkout
            </h1>

            <form id="checkout-form" onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors"
                      placeholder="Rahul"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors"
                      placeholder="Sharma"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Shipping Address
                </h2>

                {hasSavedAddress && (
                  <div className="mb-4 p-3 bg-mint-50 border border-mint-200 rounded-xl flex items-center gap-3 text-sm">
                    <span className="text-mint-600 text-lg">✓</span>
                    <p className="text-mint-800 font-medium">
                      Pre-filled from your saved default address. You can edit
                      below.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors"
                      placeholder="123 Main St, Apt 4B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors"
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors"
                      placeholder="400001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 transition-colors text-gray-700"
                    >
                      <option>India</option>
                    </select>
                  </div>
                </div>

                {/* Save as Default */}
                {user && (
                  <label className="mt-4 flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${saveAsDefault ? "bg-mint-600 border-mint-600" : "border-gray-300 bg-white group-hover:border-mint-400"}`}
                      >
                        {saveAsDefault && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      Save as my default shipping address
                    </span>
                  </label>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === "UPI" ? "border-mint-600 bg-mint-50 ring-1 ring-mint-600" : "border-gray-200 hover:border-mint-300 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-mint-600 focus:ring-mint-500"
                    />
                    <Smartphone
                      className={`w-6 h-6 ml-4 ${paymentMethod === "UPI" ? "text-mint-600" : "text-gray-400"}`}
                    />
                    <span className="ml-3 font-bold text-gray-900">
                      UPI (GPay, PhonePe, Paytm)
                    </span>
                  </label>

                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === "Card" ? "border-mint-600 bg-mint-50 ring-1 ring-mint-600" : "border-gray-200 hover:border-mint-300 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="Card"
                      checked={paymentMethod === "Card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-mint-600 focus:ring-mint-500"
                    />
                    <CreditCard
                      className={`w-6 h-6 ml-4 ${paymentMethod === "Card" ? "text-mint-600" : "text-gray-400"}`}
                    />
                    <span className="ml-3 font-bold text-gray-900">
                      Debit / Credit Card (Stripe)
                    </span>
                  </label>

                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === "COD" ? "border-mint-600 bg-mint-50 ring-1 ring-mint-600" : "border-gray-200 hover:border-mint-300 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-mint-600 focus:ring-mint-500"
                    />
                    <Banknote
                      className={`w-6 h-6 ml-4 ${paymentMethod === "COD" ? "text-mint-600" : "text-gray-400"}`}
                    />
                    <div className="ml-3">
                      <span className="block font-bold text-gray-900">
                        Cash on Delivery
                      </span>
                      <span className="block text-sm text-gray-500">
                        Pay when your order arrives
                      </span>
                    </div>
                  </label>
                </div>

                {/* Dynamic Payment Details (e.g. Card Input fields if Card is selected) */}
                {paymentMethod === "Card" && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <p className="text-sm text-gray-500 mb-4">
                      Securely processed by Stripe.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Card Number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="CVC"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Side: Order Summary */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 sticky top-24 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Dynamic Items Summary */}
              <div className="max-h-60 overflow-y-auto mb-6 pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
                  >
                    <div className="relative">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=100"
                        }
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md bg-gray-100 border border-gray-200"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.color} / {item.size}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-gray-600 pb-6 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex justify-between items-center group"
                >
                  <div className="flex items-center gap-2">
                    <span>Subtotal</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-300 ${showBreakdown ? "rotate-180" : ""}`}
                    />
                  </div>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </button>

                <div
                  className={`space-y-4 overflow-hidden transition-all duration-300 ${showBreakdown ? "max-h-48 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0 pointer-events-none"}`}
                >
                  {appliedCoupon && (
                    <div className="flex justify-between text-mint-600 font-bold border-t border-b border-gray-100 py-2 my-2">
                      <div className="flex flex-col text-left">
                        <span>Discount</span>
                        <span className="text-xs text-mint-600/70 font-medium">
                          Applied: {appliedCoupon.code}
                        </span>
                      </div>
                      <span>-₹{Math.round(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold text-green-600">
                      {shipping === 0 ? "Free" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-bold text-gray-900">₹{tax}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Total</h3>
                </div>
                <span className="text-3xl font-extrabold text-mint-600">
                  ₹{total}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-mint-600 hover:bg-mint-500 text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover-lift shadow-mint-500/30 shadow-lg disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${total}`
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4 text-mint-600" />
                100% Secure Checkout process
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
