import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart, CartProduct } from "@/context/CartContext";

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
      : (product as any).status !== "Out of Stock" && ((product as any).stock_qty ?? 1) > 0;

  const cartProduct: CartProduct = {
    id: String(product.id),
    name: product.name,
    price: product.price,
    discount_price: discountPrice,
    image: (product as any).image || "",
    fabric: (product as any).fabric,
    color: (product as any).color || "",
    sku: (product as any).sku ?? "",
    stock_qty: (product as any).stock_qty,
    status: (product as any).status,
    category: product.category,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
        <Link to={`/product/${product.id}`}>
          <img
            src={(product as any).image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!inStock ? "opacity-60 grayscale" : ""}`}
            loading="lazy"
          />
        </Link>

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

        {/* Hover Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="flex gap-2">
            {inStock ? (
              <button
                onClick={() => addToCart(cartProduct)}
                className="flex-1 flex items-center justify-center gap-2 py-3 luxury-gradient text-champagne font-body text-xs uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
              >
                <ShoppingBag size={14} />
                Add to Bag
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-200 text-gray-500 font-body text-xs uppercase tracking-[0.15em] cursor-not-allowed">
                Out of Stock
              </div>
            )}
            <button className="w-11 flex items-center justify-center bg-background/90 backdrop-blur text-foreground hover:text-accent transition-colors">
              <Heart size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <Link to={`/product/${product.id}`}>
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
          {(product as any).fabric}
        </p>
        <h3 className="font-display text-sm font-medium text-foreground mb-2 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold text-foreground">
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
      </Link>
    </motion.div>
  );
};

export default ProductCard;
