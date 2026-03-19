import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Sparkles } from "lucide-react";
import { useCart, CartProduct } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const API = "http://localhost/luxe-haven";

interface ProductCardProps {
  product: CartProduct | {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount_price?: number;
    image: string;
    category: string;
    description: string;
    fabric: string;
    color: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    inStock?: boolean;
    stock_qty?: number;
    status?: string;
  };
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  console.log("ProductCard Data:", product);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(String(product.id));

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);

  // Support both static (originalPrice) and API (discount_price) products
  const originalPrice = (product as any).originalPrice ?? null;
  const discountPrice = (product as any).discount_price ?? null;
  const displayOriginal = originalPrice || (discountPrice ? product.price : null);
  const currentPrice = discountPrice || product.price;

  const discount = displayOriginal
    ? Math.round(((displayOriginal - currentPrice) / displayOriginal) * 100)
    : 0;

  // Stock check logic
  const inStock =
    (product as any).inStock !== undefined
      ? (product as any).inStock
      : (product as any).status !== "Out of Stock";

  // Fix image source path - handles absolute URLs from API and local relative paths
  const imageSrc = useMemo(() => {
    if (!(product as any).image) {
      return `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80`;
    }

    const rawImage = (product as any).image;
    
    // If it's already a full URL from API (often points to localhost/ without subdirectory)
    if (rawImage.startsWith('http')) {
      // Fix for XAMPP subdirectory hosting: if URL points to localhost but is missing luxe-haven subdirectory
      if (rawImage.includes('localhost/') && !rawImage.includes('localhost/luxe-haven/')) {
        return rawImage.replace('localhost/', 'localhost/luxe-haven/');
      }
      return rawImage;
    }

    // fallback for relative paths
    return `${API}/${rawImage.replace(/^\/+/, '')}`;
  }, [(product as any).image]);

  const cartProduct: CartProduct = {
    id: String(product.id),
    name: product.name,
    price: currentPrice,
    discount_price: discountPrice,
    image: imageSrc,
    fabric: (product as any).fabric,
    color: (product as any).color || "",
    sku: (product as any).sku ?? "",
    stock_quantity: (product as any).stock_quantity ?? (product as any).stock_qty,
    stock_qty: (product as any).stock_qty,
    status: (product as any).status,
    category: product.category,
  };

  const wishProduct = {
    id: String(product.id),
    name: product.name,
    price: currentPrice,
    discount_price: discountPrice || undefined,
    image: imageSrc,
    category: product.category,
    fabric: (product as any).fabric,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -12, transition: { duration: 0.4, ease: "easeOut" } }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col h-full bg-white rounded-[2rem] p-3 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(13,59,46,0.15)] border border-[#0D3B2E]/5"
    >
      {/* Image Container */}
      <div className="relative aspect-[3.2/4] overflow-hidden rounded-[1.5rem] bg-[#F8F9FA] mb-5 group/img-wrapper">
        <Link to={`/product/${product.id}`} className="block w-full h-full relative overflow-hidden">
          <motion.img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('unsplash')) {
                target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80';
              }
            }}
          />
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-[#0D3B2E]/20 transition-all duration-700" />
        </Link>

        {/* Wishlist Button On Image */}
        <button
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            toggleWishlist(wishProduct);
          }}
          className="absolute top-4 right-4 z-20 p-3 bg-white/80 backdrop-blur-xl rounded-full text-foreground hover:bg-white hover:scale-110 active:scale-90 transition-all shadow-lg border border-white/40 group/heart"
        >
          <motion.div animate={isLiked ? { scale: [1, 1.3, 1] } : {}}>
            <Heart
              size={16}
              strokeWidth={2.5}
              className={`transition-colors duration-500 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover/heart:text-rose-500"}`}
            />
          </motion.div>
        </button>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {(product as any).isNew && (
            <span className="px-3 py-1.5 bg-[#0D3B2E] text-white font-body text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-[#0D3B2E]/20 border border-[#0D3D2E]">New Arrival</span>
          )}
          {discount > 0 && discount < 100 && (
            <span className="px-3 py-1.5 bg-gold text-slate-900 font-body text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-xl shadow-gold/20 flex items-center gap-1.5 border border-gold/50">
              <Sparkles size={10} className="text-slate-800" />
              {discount}% Off
            </span>
          )}
          {!inStock && (
            <span className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md text-white font-body text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10">Sold Out</span>
          )}
        </div>

        {/* Quick Add Button - Premium Animation */}
        <div className={`absolute bottom-5 left-5 right-5 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] z-20 ${
          inStock ? "lg:translate-y-4 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100" : "opacity-100 translate-y-0"
        }`}>
          <button
            disabled={!inStock}
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              if (inStock) addToCart(cartProduct);
            }}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-body text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 group/btn ${
              inStock 
                ? "bg-[#0D3B2E] text-white hover:bg-[#0D3B2E]/90 shadow-black/20" 
                : "bg-white/40 backdrop-blur-xl text-slate-500 border border-white/20 cursor-not-allowed grayscale"
            }`}
          >
            {inStock ? (
              <>
                <ShoppingBag size={14} className="group-hover/btn:translate-y-[-2px] transition-transform" />
                Add to Bag
              </>
            ) : (
              "Sold Out"
            )}
          </button>
        </div>
      </div>

      {/* Info Section - Always Centered */}
      <Link to={`/product/${product.id}`} className="flex flex-col items-center text-center px-4 pb-4 flex-1">
        <p className="font-body text-[9px] uppercase tracking-[0.3em] text-[#B48C5E] mb-2 font-black">
          {(product as any).fabric || (product as any).category}
        </p>
        <h3 className="font-display text-[16px] font-black text-slate-900 mb-2 leading-tight line-clamp-1 italic group-hover:text-[#B48C5E] transition-all duration-300 tracking-tight">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-3">
            <span className="font-body text-base font-black text-slate-900">
              {formatPrice(currentPrice)}
            </span>
            {displayOriginal > currentPrice ? (
              <span className="font-body text-xs text-slate-400 line-through font-medium">
                {formatPrice(displayOriginal)}
              </span>
            ) : null}
          </div>

          {/* Stock in hand Badge */}
          {inStock && ((product as any).stock_qty > 0 || (product as any).stock_quantity > 0) && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-body text-[8px] font-black uppercase tracking-widest text-[#0D3B2E] bg-[#0D3B2E]/5 px-4 py-1.5 rounded-full border border-[#0D3B2E]/10"
            >
              {(product as any).stock_qty ?? (product as any).stock_quantity} Artisanal Pieces Left
            </motion.span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
