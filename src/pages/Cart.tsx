import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  Heart,
  ChevronRight,
  Package
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const FREE_SHIPPING_THRESHOLD = 999;
  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const shippingProgress = Math.min(100, Math.round((totalPrice / FREE_SHIPPING_THRESHOLD) * 100));

  const standardShippingFee = isFreeShipping || items.length === 0 ? 0 : 99;
  const discountAmount = appliedCoupon ? Math.round((totalPrice * appliedCoupon.discountPercent) / 100) : 0;
  const finalTotal = Math.max(0, totalPrice - discountAmount + standardShippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setIsApplyingCoupon(true);
    setTimeout(() => {
      setIsApplyingCoupon(false);
      if (code === "LISHAN10" || code === "LUXE10" || code === "WELCOME10") {
        setAppliedCoupon({ code, discountPercent: 10 });
        toast.success(`Coupon "${code}" applied! 10% discount added.`);
      } else if (code === "FESTIVE15") {
        setAppliedCoupon({ code, discountPercent: 15 });
        toast.success(`Coupon "${code}" applied! 15% discount added.`);
      } else {
        toast.error(`Coupon code "${code}" is invalid or expired.`);
      }
    }, 400);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed.");
  };

  const handleMoveToWishlist = (product: any) => {
    if (!isInWishlist(product.id)) {
      toggleWishlist(product);
      toast.success(`${product.name} moved to wishlist`);
    } else {
      toast.info(`${product.name} is already in your wishlist`);
    }
    removeFromCart(product.id);
  };

  // ─── EMPTY STATE ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="bg-[#FAF7F2] min-h-[80vh] pt-28 pb-20 flex items-center">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl p-8 sm:p-12 border border-[#EBE3D5] shadow-sm"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-[#B48C5E]/15 to-[#F5EBE1] flex items-center justify-center text-[#B48C5E]">
              <ShoppingBag size={44} strokeWidth={1.25} />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
              Your Shopping Bag is Empty
            </h1>
            <p className="font-body text-sm sm:text-base text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Explore our curated regal silks, handcrafted sarees, and exquisite designer pieces to fill your bag.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/collections"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0D3B2E] text-white rounded-full font-body text-xs font-bold uppercase tracking-widest hover:bg-[#124e3d] transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
              >
                Explore Collections <ArrowRight size={14} />
              </Link>
              <Link
                to="/sarees"
                className="w-full sm:w-auto px-8 py-3.5 border border-[#B48C5E] text-[#B48C5E] rounded-full font-body text-xs font-bold uppercase tracking-widest hover:bg-[#B48C5E]/10 transition-all text-center"
              >
                Browse Sarees
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── CART WITH ITEMS ─────────────────────────────────────────────────────────
  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-body">
          <Link to="/" className="hover:text-[#B48C5E] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A] font-semibold">Shopping Bag</span>
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#EBE3D5] pb-5">
          <div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Shopping Bag
            </h1>
            <p className="font-body text-xs sm:text-sm text-gray-500 mt-1">
              You have <span className="font-semibold text-[#0D3B2E]">{items.length}</span> {items.length === 1 ? "masterpiece" : "masterpieces"} in your royal bag
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to empty your shopping bag?")) {
                clearCart();
                toast.info("Bag cleared");
              }
            }}
            className="self-start sm:self-auto text-xs text-gray-400 hover:text-rose-600 transition-colors flex items-center gap-1.5 font-body"
          >
            <Trash2 size={13} />
            <span>Clear Bag</span>
          </button>
        </div>

        {/* Free Shipping Progress Notification */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#EBE3D5] mb-8 shadow-sm">
          <div className="flex items-center justify-between text-xs sm:text-sm font-body mb-2">
            <span className="flex items-center gap-2 text-gray-700 font-medium">
              <Truck size={16} className="text-[#B48C5E]" />
              {isFreeShipping ? (
                <strong className="text-emerald-700">Congratulations! You've unlocked FREE Delivery.</strong>
              ) : (
                <span>
                  Add <strong className="text-[#B48C5E]">{formatPrice(amountNeededForFreeShipping)}</strong> more to get <strong>FREE Delivery</strong>
                </span>
              )}
            </span>
            <span className="text-xs font-bold text-gray-500">{shippingProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isFreeShipping ? "bg-emerald-500" : "bg-gradient-to-r from-[#B48C5E] to-[#D4AF37]"}`}
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Main Grid: Items on Left, Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence>
              {items.map((item) => {
                const itemPrice = item.product.discount_price || item.product.price;
                const itemSubtotal = itemPrice * item.quantity;

                return (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EBE3D5] shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                  >
                    {/* Thumbnail */}
                    <Link
                      to={`/product/${item.product.id}`}
                      className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 group block border border-gray-100"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="font-display text-base sm:text-lg font-semibold text-[#1A1A1A] hover:text-[#B48C5E] transition-colors leading-snug"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            title="Remove item"
                            className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Fabric / Attributes */}
                        {(item.product.fabric || item.product.color) && (
                          <p className="text-xs text-gray-500 font-body mt-1">
                            {item.product.fabric && <span>Fabric: {item.product.fabric}</span>}
                            {item.product.fabric && item.product.color && <span> • </span>}
                            {item.product.color && <span>Color: {item.product.color}</span>}
                          </p>
                        )}

                        {/* Selected Add-ons */}
                        {item.product.selectedAddOnDetails && item.product.selectedAddOnDetails.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {item.product.selectedAddOnDetails.map((ao: any, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#B48C5E]/30 text-[10px] text-[#B48C5E] font-body font-bold uppercase tracking-wider"
                              >
                                <Sparkles size={10} />
                                {ao.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pricing and Quantity */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-body text-gray-400 uppercase tracking-wider">Qty:</span>
                          <div className="flex items-center border border-[#EBE3D5] rounded-lg bg-gray-50/50">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white rounded-l-lg transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="font-body text-xs font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white rounded-r-lg transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => handleMoveToWishlist(item.product)}
                            className="text-xs text-gray-500 hover:text-[#B48C5E] transition-colors flex items-center gap-1 font-body ml-2"
                          >
                            <Heart size={13} />
                            <span className="hidden sm:inline">Save for later</span>
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right">
                          <p className="font-display text-base sm:text-lg font-bold text-[#0D3B2E]">
                            {formatPrice(itemSubtotal)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[11px] font-body text-gray-400">
                              {formatPrice(itemPrice)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Continue Shopping Link */}
            <div className="pt-2">
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D3B2E] hover:text-[#B48C5E] transition-colors font-body"
              >
                <ArrowRight size={14} className="rotate-180" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#EBE3D5] shadow-sm">
              <h2 className="font-display text-lg font-bold text-[#1A1A1A] mb-4 pb-3 border-b border-[#EBE3D5]">
                Order Summary
              </h2>

              {/* Price Details */}
              <div className="space-y-3 text-sm font-body text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Tag size={13} /> Coupon ({appliedCoupon.code})
                    </span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {standardShippingFee === 0 ? (
                      <span className="text-emerald-700 uppercase text-xs font-bold tracking-wider">Free</span>
                    ) : (
                      formatPrice(standardShippingFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-400 pt-1">
                  <span>Taxes (GST)</span>
                  <span>Included in prices</span>
                </div>

                <div className="border-t border-[#EBE3D5] pt-4 mt-2 flex justify-between items-baseline">
                  <span className="font-display text-base font-bold text-gray-900">Total Payable</span>
                  <div className="text-right">
                    <span className="font-display text-xl sm:text-2xl font-bold text-[#0D3B2E]">
                      {formatPrice(finalTotal)}
                    </span>
                    <p className="text-[10px] text-gray-400 font-body">Including all taxes & duties</p>
                  </div>
                </div>
              </div>

              {/* Coupon Code Accordion / Input */}
              <div className="mb-6 pt-4 border-t border-gray-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-body">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Tag size={14} />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% OFF)</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Promo code (try LISHAN10)"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D5] rounded-full text-xs font-body uppercase placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:border-[#B48C5E]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#0D3B2E] text-white rounded-full text-xs font-body font-bold uppercase tracking-wider transition-all disabled:opacity-50 hover:shadow-md"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </button>
                  </form>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 bg-[#0D3B2E] hover:bg-[#124e3d] text-white rounded-full font-body text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-[0_8px_24px_rgba(13,59,46,0.3)] hover:shadow-[0_12px_32px_rgba(13,59,46,0.45)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-4 text-center">
                <p className="text-[11px] text-gray-400 font-body">
                  Guaranteed safe & secure checkout
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE3D5] shadow-sm space-y-3.5">
              <div className="flex items-center gap-3 text-xs font-body text-gray-700">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] flex items-center justify-center text-[#B48C5E] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">100% Authentic Handcrafted</p>
                  <p className="text-[11px] text-gray-400">Direct from master weavers</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-body text-gray-700">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] flex items-center justify-center text-[#B48C5E] shrink-0">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Easy 7-Day Returns</p>
                  <p className="text-[11px] text-gray-400">Hassle-free replacement policy</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-body text-gray-700">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] flex items-center justify-center text-[#B48C5E] shrink-0">
                  <Package size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Royal Gift Packaging</p>
                  <p className="text-[11px] text-gray-400">Included on every luxury order</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
