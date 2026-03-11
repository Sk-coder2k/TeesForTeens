"use client";

import Link from "next/link";
import { User, Package, Settings, LogOut, ChevronRight, Eye, XCircle, Star, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window === "undefined") return headers;
  const userStr = localStorage.getItem("teesforteens_user");
  if (userStr) {
    const token = JSON.parse(userStr).token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const statusStyle = (status: string) => {
  switch (status) {
    case "Delivered": return "bg-green-100 text-green-700";
    case "Shipped": return "bg-blue-100 text-blue-700";
    case "Cancelled": return "bg-red-100 text-red-700";
    case "Confirmed": case "Packed": return "bg-purple-100 text-purple-700";
    default: return "bg-yellow-100 text-yellow-700";
  }
};

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"orders" | "info" | "settings">("orders");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 4;

  // Profile Info
  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "", address: "" });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");

  // Password
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Reviews
  const [reviewModal, setReviewModal] = useState<{ productId: string; orderId: string; productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [myReviews, setMyReviews] = useState<{ product: string; order: string }[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  // Load real user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
      });
    }
  }, [user]);

  // Fetch real orders for this user
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await fetch(`${API_URL}/users/myorders`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        const normalized = data.map((o: any) => ({
          id: o._id,
          displayId: o.displayId || o._id.slice(-8).toUpperCase(),
          date: new Date(o.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
          total: `₹${o.totalPrice}`,
          items: o.orderItems?.length || 0,
          status: o.orderStatus || "Pending",
          payment: o.isPaid ? "Paid" : "Pending",
          paymentMethod: o.paymentMethod || "COD",
          subtotal: o.itemsPrice?.toString() || "0",
          shipping: o.shippingPrice === 0 ? "Free" : o.shippingPrice?.toString() || "0",
          tax: o.taxPrice?.toString() || "0",
          discount: "0",
          couponCode: null,
          orderedItems: o.orderItems?.map((item: any) => ({
            id: item.product,
            name: item.name,
            price: item.price,
            quantity: item.qty || 1,
            color: item.color,
            size: item.size,
            image: item.image,
          })) || [],
          shippingDetails: {
            name: user?.name || "",
            email: user?.email || "",
            phone: o.shippingAddress?.phoneNumber || "",
            address: o.shippingAddress ? `${o.shippingAddress.address}, ${o.shippingAddress.city}, ${o.shippingAddress.postalCode}` : "",
          },
        }));
        setOrders(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (isAuthenticated) fetchMyOrders();
  }, [isAuthenticated]);

  // Fetch reviews
  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews/my`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setMyReviews(data.map((r: any) => ({ product: r.product, order: r.order })));
        }
      } catch (e) {}
    };
    if (isAuthenticated) fetchMyReviews();
  }, [isAuthenticated]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === id) setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoError("");
    setInfoSuccess("");
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: profileData.name, phone: profileData.phone, address: profileData.address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      // Update localStorage
      const userStr = localStorage.getItem("teesforteens_user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        localStorage.setItem("teesforteens_user", JSON.stringify({ ...parsed, name: data.name, phone: data.phone, address: data.address }));
      }
      setInfoSuccess("Profile updated successfully!");
      setIsEditingInfo(false);
      setTimeout(() => setInfoSuccess(""), 3000);
    } catch (err: any) {
      setInfoError(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_URL}/users/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal || !reviewTitle.trim() || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId: reviewModal.productId,
          orderId: reviewModal.orderId,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setMyReviews(prev => [...prev, { product: reviewModal.productId, order: reviewModal.orderId }]);
        setReviewModal(null);
        setReviewRating(5); setReviewTitle(""); setReviewComment("");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to submit review");
      }
    } catch (e) {
      alert("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-gray-50 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-mint-600 mb-6 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">My Account</h1>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar */}
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-mint-200 rounded-full flex items-center justify-center text-xl font-bold text-mint-800 uppercase">
                  {profileData.name?.charAt(0) || user?.name?.charAt(0) || "U"}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 truncate">{profileData.name || user?.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <nav className="p-2 space-y-1">
                <button onClick={() => { setActiveTab("orders"); setSelectedOrder(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === "orders" ? "bg-mint-50 text-mint-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Package className="w-5 h-5" /> Order History
                </button>
                <button onClick={() => setActiveTab("info")}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === "info" ? "bg-mint-50 text-mint-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <User className="w-5 h-5" /> Personal Info
                </button>
                <button onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === "settings" ? "bg-mint-50 text-mint-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Settings className="w-5 h-5" /> Account Settings
                </button>
                <button onClick={() => { logout(); router.push("/"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors mt-4">
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">

              {/* ORDERS TAB */}
              {activeTab === "orders" && !selectedOrder && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium mb-4">You haven't placed any orders yet.</p>
                      <Link href="/shop" className="text-mint-600 font-bold hover:underline">Start Shopping</Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {orders
                          .slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE)
                          .map(order => (
                          <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:border-mint-300 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-mint-50 rounded-lg flex items-center justify-center text-mint-600">
                                  <Package className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                                    {order.displayId}
                                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${statusStyle(order.status)}`}>{order.status}</span>
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">{order.date} • {order.items} item{order.items !== 1 ? "s" : ""} • {order.total}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {(order.status === "Processing" || order.status === "Pending") && (
                                  <button onClick={() => updateOrderStatus(order.id, "Cancelled")}
                                    className="flex items-center text-red-600 hover:text-red-700 font-medium text-sm gap-1 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
                                    <XCircle className="w-4 h-4" /> Cancel
                                  </button>
                                )}
                                <button onClick={() => setSelectedOrder(order)}
                                  className="flex items-center text-mint-600 hover:text-mint-700 font-medium text-sm gap-1 bg-mint-50 hover:bg-mint-100 px-4 py-2 rounded-lg transition-colors">
                                  <Eye className="w-4 h-4" /> View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {orders.length > ORDERS_PER_PAGE && (
                        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            ← Prev
                          </button>

                          {Array.from({ length: Math.ceil(orders.length / ORDERS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-9 h-9 text-sm font-bold rounded-lg transition-colors ${
                                currentPage === page
                                  ? "bg-mint-600 text-white shadow-sm"
                                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(orders.length / ORDERS_PER_PAGE), p + 1))}
                            disabled={currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE)}
                            className="px-3 py-2 text-sm font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ORDER DETAIL */}
              {activeTab === "orders" && selectedOrder && (
                <div className="animate-in fade-in duration-300">
                  <button onClick={() => setSelectedOrder(null)}
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Orders
                  </button>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900">Order {selectedOrder.displayId}</h2>
                      <p className="text-gray-500 text-sm mt-1">Placed on {selectedOrder.date}</p>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="mb-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Tracking Status</h3>
                    <div className="relative">
                      <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 hidden md:block rounded-full"></div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-0 relative z-10">
                        {["Pending","Confirmed","Packed","Shipped","Delivered"].map((stage, index) => {
                          const stages = ["Pending","Confirmed","Packed","Shipped","Delivered"];
                          const currentIndex = stages.indexOf(selectedOrder.status);
                          const isCompleted = index <= currentIndex;
                          const isCurrent = index === currentIndex;
                          return (
                            <div key={stage} className="flex md:flex-col items-center gap-4 md:gap-3 relative">
                              {index > 0 && isCompleted && (
                                <div className="absolute top-6 right-1/2 w-full h-1 bg-mint-500 hidden md:block z-0" />
                              )}
                              <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-500 shrink-0 ${isCompleted ? "bg-mint-500 text-white scale-110" : "bg-gray-100 text-gray-400"}`}>
                                <Package className={`w-5 h-5 ${isCurrent ? "animate-pulse" : ""}`} />
                              </div>
                              <div className="md:text-center">
                                <p className={`font-bold text-sm ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>{stage}</p>
                                {isCurrent && <p className="text-xs font-medium text-mint-600">Current Stage</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Items */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Items in this Order</h3>
                        {selectedOrder.orderedItems?.length > 0 ? (
                          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                            {selectedOrder.orderedItems.map((item: any, idx: number) => {
                              const reviewed = myReviews.some(r => r.product === item.id && r.order === selectedOrder.id);
                              return (
                                <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Size: {item.size} | Color: {item.color}</p>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-bold text-gray-900 text-sm">₹{item.price}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    {selectedOrder.status === "Delivered" && (
                                      reviewed ? (
                                        <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-green-600" /> Reviewed</span>
                                      ) : (
                                        <button onClick={() => { setReviewModal({ productId: item.id, orderId: selectedOrder.id, productName: item.name }); setReviewRating(5); setReviewHover(0); setReviewTitle(""); setReviewComment(""); }}
                                          className="text-xs text-mint-600 hover:text-mint-700 font-bold flex items-center gap-1 bg-mint-50 px-2 py-1 rounded-md">
                                          <Star className="w-3 h-3" /> Write Review
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Item details unavailable for this order.</p>
                        )}
                      </div>

                      {/* Payment */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Payment Details</h3>
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 grid grid-cols-2 gap-3 text-sm">
                          <div className="text-gray-500">Payment Method:</div>
                          <div className="font-medium text-right text-gray-900">{selectedOrder.paymentMethod}</div>
                          <div className="text-gray-500">Subtotal:</div>
                          <div className="font-medium text-right text-gray-900">₹{selectedOrder.subtotal}</div>
                          <div className="text-gray-500">Shipping:</div>
                          <div className="font-medium text-right text-green-600">{selectedOrder.shipping === "Free" || selectedOrder.shipping === "0" ? "Free" : `₹${selectedOrder.shipping}`}</div>
                          <div className="text-gray-500">Tax (5%):</div>
                          <div className="font-medium text-right text-gray-900">₹{selectedOrder.tax}</div>
                          <div className="col-span-2 border-t border-gray-200 my-1"></div>
                          <div className="text-gray-900 font-bold text-base">Total Paid:</div>
                          <div className="font-bold text-right text-base text-mint-600">{selectedOrder.total}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Shipping */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Shipping Details</h3>
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-sm">
                          <p className="font-bold text-gray-900 mb-1">{selectedOrder.shippingDetails?.name}</p>
                          <p className="text-gray-500 leading-relaxed mb-3">{selectedOrder.shippingDetails?.address}</p>
                          <p className="text-gray-500"><span className="font-medium text-gray-900">Phone:</span> {selectedOrder.shippingDetails?.phone}</p>
                          <p className="text-gray-500"><span className="font-medium text-gray-900">Email:</span> {selectedOrder.shippingDetails?.email}</p>
                        </div>
                      </div>

                      {(selectedOrder.status === "Processing" || selectedOrder.status === "Pending") && (
                        <div className="bg-red-50 rounded-xl p-5 border border-red-100 text-sm">
                          <p className="font-bold text-red-700 mb-2">Need to cancel?</p>
                          <p className="text-red-600/80 mb-4">You can cancel before it ships for a full refund.</p>
                          <button onClick={() => updateOrderStatus(selectedOrder.id, "Cancelled")}
                            className="w-full flex items-center justify-center text-white font-bold gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition-colors">
                            <XCircle className="w-5 h-5" /> Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PERSONAL INFO TAB */}
              {activeTab === "info" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <button onClick={() => { setIsEditingInfo(!isEditingInfo); setInfoError(""); setInfoSuccess(""); }}
                      className="text-sm font-bold text-mint-600 hover:text-mint-700">
                      {isEditingInfo ? "Cancel" : "Edit Details"}
                    </button>
                  </div>

                  {infoSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> {infoSuccess}
                    </div>
                  )}
                  {infoError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold">{infoError}</div>
                  )}

                  <form onSubmit={handleSaveInfo} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" disabled={!isEditingInfo} value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 disabled:bg-gray-50 disabled:text-gray-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" disabled value={profileData.email}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed" />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 text-sm font-medium">
                            +91
                          </span>
                          <input
                            type="tel"
                            disabled={!isEditingInfo}
                            value={profileData.phone.replace(/^\+91\s?/, "")}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setProfileData({ ...profileData, phone: digits ? `+91 ${digits}` : "" });
                            }}
                            placeholder={isEditingInfo ? "Enter 10-digit number" : "Not provided"}
                            maxLength={10}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-mint-500 focus:border-mint-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                          />
                        </div>
                        {isEditingInfo && (
                          <p className="text-xs text-gray-400 mt-1">Enter your 10-digit mobile number</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Address</label>
                        <textarea rows={3} disabled={!isEditingInfo} value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          placeholder="Street address, City, State, Pincode"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-mint-500 focus:border-mint-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none" />
                        <p className="text-xs text-gray-400 mt-1">This is auto-filled in checkout when you tick "Save as default"</p>
                      </div>
                    </div>
                    {isEditingInfo && (
                      <div className="pt-2 flex justify-end">
                        <button type="submit" disabled={savingInfo}
                          className="bg-mint-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-mint-700 transition-colors disabled:opacity-60">
                          {savingInfo ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-xl p-5">
                      <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>

                      {passwordSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> {passwordSuccess}
                        </div>
                      )}
                      {passwordError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold">{passwordError}</div>
                      )}

                      <form className="space-y-4" onSubmit={handleChangePassword}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input type="password" value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg focus:ring-mint-500 focus:bg-white" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input type="password" value={passwordData.new}
                              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                              className="w-full bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg focus:ring-mint-500 focus:bg-white" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input type="password" value={passwordData.confirm}
                              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                              className="w-full bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg focus:ring-mint-500 focus:bg-white" required />
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button type="submit" disabled={savingPassword || !passwordData.current || !passwordData.new}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-60">
                            {savingPassword ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="border border-red-100 bg-red-50 rounded-xl p-5">
                      <h3 className="font-bold text-red-700 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-600/80 mb-4">Permanently delete your account and all associated order history. This cannot be undone.</p>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors text-sm">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReviewModal(null)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl z-10 p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
              <button onClick={() => setReviewModal(null)} className="text-gray-400 hover:text-gray-900"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-5">Reviewing: <span className="font-bold text-gray-900">{reviewModal.productName}</span></p>
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} type="button" onMouseEnter={() => setReviewHover(star)} onMouseLeave={() => setReviewHover(0)} onClick={() => setReviewRating(star)} className="p-1 transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 transition-colors ${star <= (reviewHover || reviewRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-gray-700 self-center">{reviewRating}/5</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">Review Title</label>
              <input type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="e.g. Great quality fabric!" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none text-black" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-1">Your Review</label>
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Tell others about your experience..." rows={4} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none resize-none text-black" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSubmitReview} disabled={reviewSubmitting || !reviewTitle.trim() || !reviewComment.trim()} className="flex-1 px-4 py-2 bg-mint-600 text-white rounded-xl font-bold hover:bg-mint-500 transition-colors disabled:opacity-50">
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
