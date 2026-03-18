import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart, CartProduct } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const API = "http://localhost:8000";

interface ProductCardProps {
  product: CartProduct | {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
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
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(String(product.id));

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  // Support both static (originalPrice) and API (discount_price) products
  const originalPrice = (product as any).originalPrice ?? null;
  const discountPrice = (product as any).discount_price ?? null;
  const displayOriginal = originalPrice || discountPrice;

  const discount = displayOriginal
    ? Math.round(((displayOriginal - product.price) / displayOriginal) * 100)
    : 0;

  // Stock check — support both static inStock and API status/stock_qty
  const inStock =
    (product as any).inStock !== undefined
      ? (product as any).inStock
      : (product as any).status !== "Out of Stock" && ((product as any).stock_quantity ?? (product as any).stock_qty ?? 1) > 0;

  const imageSrc = (product as any).image
    ? ((product as any).image.startsWith('http') ? (product as any).image : `${API}/${(product as any).image.replace(/^\/+/, '')}`)
    : `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80`;

  const cartProduct: CartProduct = {
    id: String(product.id),
    name: product.name,
    price: product.price,
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
    price: product.price,
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
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
      className="group relative flex flex-col h-full bg-white rounded-2xl p-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
    >
      {/* Image Container with Shimmer Effect */}
      <div className="relative aspect-[3.2/4] overflow-hidden rounded-xl bg-slate-50 mb-4 group/img-wrapper">
        <Link to={`/product/${product.id}`} className="block w-full h-full relative group/img overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
          {/* Premium Glare Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors duration-700" />

          {/* Animated Shimmer Line */}
          <motion.div
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 pointer-events-none"
          />
        </Link>

        {/* Wishlist Button On Image */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(wishProduct);
          }}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-foreground hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-md border border-slate-100 group/heart"
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Heart
              size={18}
              strokeWidth={2.5}
              className={`transition-colors duration-500 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover/heart:text-rose-500"}`}
            />
          </motion.div>
        </button>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {(product as any).isNew && (
            <span className="px-3 py-1 bg-slate-900/90 backdrop-blur-sm text-white font-body text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-sm">New</span>
          )}
          {discount > 0 && (
            <span className="px-3 py-1 bg-rose-600 text-white font-body text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-sm">-{discount}% Off</span>
          )}
          {!inStock && (
            <span className="px-3 py-1 bg-slate-500/90 backdrop-blur-sm text-white font-body text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-sm">Sold Out</span>
          )}
        </div>

        {/* Hover Action Triggers */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 hidden lg:block">
          <div className="flex flex-col gap-2">
            {inStock ? (
              <button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  addToCart(cartProduct);
                }}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-slate-800 transition-all shadow-xl active:scale-95 group/btn"
              >
                <ShoppingBag size={14} className="group-hover/btn:rotate-12 transition-transform" />
                Add to Bag
              </button>
            ) : null}
          </div>
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
              {formatPrice(discountPrice || product.price)}
            </span>
            {(displayOriginal && discountPrice) || (originalPrice && !discountPrice) ? (
              <span className="font-body text-xs text-slate-400 line-through font-medium">
                {formatPrice(discountPrice ? product.price : (originalPrice as number))}
              </span>
            ) : null}
          </div>

          {/* Stock in hand Badge */}
          {inStock && ((product as any).stock_qty > 0 || (product as any).stock_quantity > 0) && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-body text-[8px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100/50 shadow-sm"
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
