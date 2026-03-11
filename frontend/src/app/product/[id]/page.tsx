"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Share2, Shield, Truck, RotateCcw, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { ProductCard } from "@/components/ProductCard";

import { useProducts } from "@/context/ProductsContext";
import { notFound } from "next/navigation";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  // We use `use` here if we need params data strictly, but we are using mock data anyway.
  const resolvedParams = use(params);
  const slug = resolvedParams.id;
  
  const { products } = useProducts();
  
  // Find product by slug/id from the centralized context
  const foundProduct = products.find(p => p.id === slug);
  if (!foundProduct) return notFound();

  const PRODUCT = {
    ...foundProduct,
    // Add detail-specific mock fields that aren't on the brief ProductCard mock yet
    description: `Experience ultimate comfort with our premium ${foundProduct.name}. Featuring a relaxed fit, this piece is a staple for any modern wardrobe. It pairs perfectly with whatever you throw at it, retaining its shape wash after wash.`,
    features: ["100% Premium Material", "Heavyweight Fabric", "Comfort Fit", "Pre-shrunk"],
  };
  
  // Suggest 4 random related products 
  const RELATED = products.filter(p => p.id !== slug && p.id !== undefined).slice(0, 4);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(PRODUCT.colors && PRODUCT.colors.length > 0 ? PRODUCT.colors[0] : "");
  const [selectedSize, setSelectedSize] = useState(PRODUCT.sizes && PRODUCT.sizes.length > 0 ? PRODUCT.sizes[0] : "");
  const [quantity, setQuantity] = useState(1);

  // Fetch real reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/reviews/product/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (e) { console.error('Failed to fetch reviews', e); }
      finally { setReviewsLoading(false); }
    };
    fetchReviews();
  }, [slug]);

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : PRODUCT.rating;
  const totalReviews = reviews.length > 0 ? reviews.length : PRODUCT.reviews;

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { success } = useToast();

  const isWished = isInWishlist(PRODUCT.id);

  const handleAddToCart = () => {
    addToCart({
      id: PRODUCT.id, // properly use product ID
      name: PRODUCT.name,
      price: Number(PRODUCT.price),
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: PRODUCT.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600",
    });
  };

  const toggleWishlist = () => {
    if (isWished) {
      removeFromWishlist(PRODUCT.id);
      success("Removed from Wishlist");
    } else {
      addToWishlist({
        id: PRODUCT.id,
        name: PRODUCT.name,
        price: Number(PRODUCT.price),
        category: PRODUCT.category,
        rating: PRODUCT.rating,
        reviews: PRODUCT.reviews,
        image: PRODUCT.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600",
      });
      success("Added to Wishlist");
    }
  };

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-mint-600">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/shop" className="hover:text-mint-600">Shop</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href={`/shop?category=${PRODUCT.category}`} className="hover:text-mint-600">{PRODUCT.category}</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium truncate">{PRODUCT.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex xl:flex-col gap-4 overflow-x-auto md:overflow-visible w-full md:w-24 flex-shrink-0">
              {(PRODUCT.images && PRODUCT.images.length > 0 ? PRODUCT.images : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"]).map((img: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-[3/4] w-20 md:w-full rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-mint-500" : "border-transparent hover:border-mint-300"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in">
              <img 
                src={(PRODUCT.images && PRODUCT.images.length > 0 ? PRODUCT.images : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"])[activeImage] || PRODUCT.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"} 
                alt={PRODUCT.name} 
                className="w-full h-full object-cover object-center transition-opacity duration-500"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <span className="text-mint-600 font-bold uppercase tracking-wider text-sm mb-2">{PRODUCT.category}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">{PRODUCT.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-5 w-5 ${star <= Math.round(PRODUCT.rating) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="ml-2 font-medium text-gray-900">{PRODUCT.rating}</span>
              <span className="mx-2 text-gray-300">|</span>
              <a href="#reviews" className="text-sm text-mint-600 hover:underline">{PRODUCT.reviews} Reviews</a>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-extrabold text-gray-900">₹{PRODUCT.price}</span>
              {PRODUCT.originalPrice > Number(PRODUCT.price) && Number(PRODUCT.price) > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through font-bold decoration-2">₹{PRODUCT.originalPrice}</span>
                  <span className="text-xs font-bold text-mint-800 bg-mint-100 px-2.5 py-1 rounded-full">
                    {Math.round((1 - Number(PRODUCT.price) / PRODUCT.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-8">{PRODUCT.description}</p>

            <hr className="border-gray-200 mb-8" />

            {/* Select Sizes */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {(PRODUCT.sizes || []).map((size: string) => {
                  const isSoldOut = typeof PRODUCT.sizeStock?.[size] === 'number' && PRODUCT.sizeStock[size] <= 0;
                  return (
                    <button
                      key={size}
                      disabled={isSoldOut}
                      onClick={() => setSelectedSize(size)}
                      className={`relative w-14 h-10 rounded-xl flex justify-center items-center font-bold text-sm transition-all border overflow-hidden ${
                        isSoldOut
                          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70"
                          : selectedSize === size
                            ? "bg-mint-500 text-white border-mint-500 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-900"
                      }`}
                    >
                      {size}
                      {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[2px] bg-red-400/50 transform -rotate-45"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select Colors */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {(PRODUCT.colors || []).map((color: string) => {
                  const isSoldOut = typeof PRODUCT.colorStock?.[color] === 'number' && PRODUCT.colorStock[color] <= 0;
                  return (
                    <button
                      key={color}
                      disabled={isSoldOut}
                      onClick={() => setSelectedColor(color)}
                      className={`relative px-5 py-2.5 rounded-full font-bold text-sm transition-all border overflow-hidden ${
                        isSoldOut
                          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70"
                          : selectedColor === color 
                            ? "bg-mint-500 border-mint-500 text-white shadow-sm" 
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-900"
                      }`}
                    >
                      {color}
                      {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[120%] h-[2px] bg-red-400/50 transform -rotate-12"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-10 text-gray-900">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-mint-500 hover:bg-mint-600 text-white h-12 sm:h-14 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
              
              <button 
                onClick={toggleWishlist}
                className={`w-14 h-14 flex-shrink-0 rounded-xl border flex items-center justify-center transition-colors hover-lift ${isWished ? 'border-mint-500 bg-mint-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <Heart 
                  className={`w-5 h-5 ${isWished ? 'fill-[#FF6B6B] text-[#FF6B6B]' : 'text-gray-900 hover:text-red-500'}`} 
                  strokeWidth={isWished ? 0 : 2} 
                />
              </button>
            </div>

            {/* Extra Info Grid */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-200">
              <div className="flex gap-3 items-start">
                <Truck className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Free Express Delivery</h4>
                  <p className="text-xs text-gray-500 mt-1">2-3 Business Days</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <RotateCcw className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Hassle-free Returns</h4>
                  <p className="text-xs text-gray-500 mt-1">Within 7 days</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Shield className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Premium Quality</h4>
                  <p className="text-xs text-gray-500 mt-1">100% Authentic</p>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button className="text-gray-500 hover:text-mint-600 flex items-center gap-2 text-sm font-medium">
                  <Share2 className="w-5 h-5" /> Share
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="bg-mint-50 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-4">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-6 h-6 ${i <= Math.round(avgRating) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="font-bold text-lg text-gray-900">{avgRating} out of 5</p>
                <p className="text-gray-600">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-6 sm:py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-mint-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review: any) => {
                const userName = review.user?.name || 'Customer';
                const timeAgo = (() => {
                  const diff = Date.now() - new Date(review.createdAt).getTime();
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  if (days === 0) return 'Today';
                  if (days === 1) return 'Yesterday';
                  if (days < 7) return `${days} days ago`;
                  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
                  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
                })();
                return (
                  <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-mint-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{timeAgo}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                    <p className="text-gray-600 mb-6 text-sm">{review.comment}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-mint-200 rounded-full flex items-center justify-center font-bold text-mint-800">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{userName}</p>
                        <p className="text-xs text-green-600 font-medium">Verified Buyer</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-mint-100">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {RELATED.map((product, i) => (
            <ProductCard key={i} item={product} />
          ))}
        </div>
      </div>

    </div>
  );
}
