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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group product-card"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
        <Link to={`/product/${product.id}`} className="block w-full h-full relative group/img">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 group-hover/img:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors duration-500" />
        </Link>

        {/* Wishlist Button On Image */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(wishProduct);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-foreground hover:scale-110 active:scale-95 transition-all shadow-sm group/heart"
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              size={18}
              className={`transition-colors duration-300 ${isLiked ? "fill-burgundy text-burgundy" : "text-foreground/40 group-hover/heart:text-burgundy"}`}
            />
          </motion.div>
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {(product as any).isNew && (
            <span className="px-3 py-1 bg-foreground text-background font-body text-[10px] uppercase tracking-[0.15em]">New</span>
          )}
          {discount > 0 && (
            <span className="px-3 py-1 bg-burgundy text-champagne font-body text-[10px] uppercase tracking-[0.15em]">-{discount}%</span>
          )}
          {!inStock && (
            <span className="px-3 py-1 bg-gray-700 text-white font-body text-[10px] uppercase tracking-[0.15em]">Out of Stock</span>
          )}
        </div>

        {/* Hover/Mobile Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 lg:group-hover:translate-y-0 lg:translate-y-full transition-transform duration-500 ease-out max-lg:translate-y-0">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {inStock ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(cartProduct);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 luxury-gradient text-champagne font-body text-[10px] uppercase tracking-[0.1em] hover:opacity-90 transition-opacity min-h-[44px]"
                >
                  <ShoppingBag size={14} />
                  Add to Bag
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-200 text-gray-500 font-body text-[10px] uppercase tracking-[0.1em] cursor-not-allowed min-h-[44px]">
                  Out of Stock
                </div>
              )}
            </div>
            <Link
              to={`/product/${product.id}`}
              className="w-full flex items-center justify-center py-2.5 bg-background/95 text-foreground font-body text-[10px] uppercase tracking-[0.15em] border border-foreground/10 hover:bg-foreground hover:text-background transition-all duration-300 min-h-[44px]"
            >
              View Product
            </Link>
          </div>
        </div>
      </div>

      {/* Info */}
      <Link to={`/product/${product.id}`}>
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
          {(product as any).fabric}
        </p>
        <h3 className="font-display text-sm font-medium text-[#0D3B2E] mb-2 leading-relaxed line-clamp-2 italic group-hover:text-[#B48C5E] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-body text-base font-black text-[#0D3B2E]">
              {formatPrice(discountPrice || product.price)}
            </span>
            {displayOriginal && discountPrice && (
              <span className="font-body text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
            {originalPrice && !discountPrice && (
              <span className="font-body text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Stock in hand */}
          {inStock && ((product as any).stock_qty > 0 || (product as any).stock_quantity > 0) && (
            <span className="font-body text-[9px] uppercase tracking-tighter text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100/50">
              {(product as any).stock_qty ?? (product as any).stock_quantity} Left
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
