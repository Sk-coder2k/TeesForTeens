"use client";

import { useState, useEffect } from "react";
import { Star, Reply, Trash2, X, Check, MessageSquare, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Review {
  _id: string;
  user: { name: string; email: string };
  product: { name: string; images: string[]; price: number };
  order: { displayId: string };
  rating: number;
  title: string;
  comment: string;
  adminReply: string;
  adminRepliedAt: string;
  createdAt: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyModal, setReplyModal] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const getHeaders = () => {
    const u = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("teesforteens_user") || "{}") : {};
    return { "Content-Type": "application/json", Authorization: `Bearer ${u.token}` };
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/reviews/admin/all`, { headers: getHeaders() });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleReply = async () => {
    if (!replyModal || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/reviews/${replyModal._id}/reply`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ reply: replyText }),
      });
      await fetchReviews();
      setReplyModal(null);
      setReplyText("");
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? It will be hidden from the product page.")) return;
    try {
      await fetch(`${API_URL}/reviews/${id}`, { method: "DELETE", headers: getHeaders() });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = reviews.filter((r) => {
    if (filterRating && r.rating !== filterRating) return false;
    if (search && !r.product?.name?.toLowerCase().includes(search.toLowerCase()) &&
        !r.user?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">{reviews.length} total reviews · Avg rating: {avgRating} ⭐</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[5,4,3,2,1].map((star) => {
          const count = reviews.filter((r) => r.rating === star).length;
          const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
          return (
            <button
              key={star}
              onClick={() => setFilterRating(filterRating === star ? null : star)}
              className={`bg-white rounded-xl p-4 border shadow-sm text-center transition-all hover:shadow-md ${filterRating === star ? "border-mint-500 ring-2 ring-mint-200" : "border-gray-100"}`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="font-extrabold text-lg text-gray-900">{star}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{count}</p>
              <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                <div className="bg-amber-400 h-1 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct}%</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product or customer..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-300 text-gray-900"
        />
        {filterRating && (
          <button onClick={() => setFilterRating(null)} className="flex items-center gap-1 px-3 py-2.5 bg-mint-50 text-mint-700 rounded-xl text-sm font-bold border border-mint-200">
            {filterRating}★ <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <img
                    src={review.product?.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=80"}
                    alt={review.product?.name}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        {/* Product name */}
                        <p className="font-bold text-gray-900 text-sm flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-mint-500" />
                          {review.product?.name || "Product"}
                        </p>
                        {/* Customer */}
                        <p className="text-xs text-gray-500 mt-0.5">
                          by <span className="font-bold text-gray-700">{review.user?.name}</span>
                          {review.user?.email && <span className="text-gray-400"> · {review.user.email}</span>}
                          {review.order?.displayId && <span className="text-gray-400"> · Order #{review.order.displayId}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                        {/* Action buttons */}
                        <button
                          onClick={() => { setReplyModal(review); setReplyText(review.adminReply || ""); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-mint-50 hover:bg-mint-100 text-mint-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Reply className="w-3.5 h-3.5" /> {review.adminReply ? "Edit Reply" : "Reply"}
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Rating + Title */}
                    <div className="flex items-center gap-2 mt-3">
                      <StarDisplay rating={review.rating} />
                      <span className="font-bold text-gray-900 text-sm">{review.title}</span>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                  </div>
                </div>

                {/* Admin Reply */}
                {review.adminReply && (
                  <div className="mt-4 ml-20 bg-mint-50 border border-mint-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-mint-700 mb-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> TeesforTeens replied
                      {review.adminRepliedAt && (
                        <span className="font-normal text-mint-500 ml-1">
                          · {new Date(review.adminRepliedAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-700">{review.adminReply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReplyModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900">Reply to Review</h3>
              <button onClick={() => setReplyModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Review summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <StarDisplay rating={replyModal.rating} />
                <span className="font-bold text-sm text-gray-900">{replyModal.title}</span>
              </div>
              <p className="text-sm text-gray-600">{replyModal.comment}</p>
              <p className="text-xs text-gray-400 mt-1">— {replyModal.user?.name}</p>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply to the customer..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-300 text-gray-900 resize-none"
            />

            <div className="flex gap-3 mt-4">
              <button onClick={() => setReplyModal(null)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={submitting || !replyText.trim()}
                className="flex-1 px-4 py-3 bg-mint-600 hover:bg-mint-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Sending..." : <><Reply className="w-4 h-4" /> Send Reply</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
