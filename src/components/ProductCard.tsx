import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="px-3 py-1 bg-foreground text-background font-body text-[10px] uppercase tracking-[0.15em]">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-3 py-1 bg-burgundy text-champagne font-body text-[10px] uppercase tracking-[0.15em]">
              -{discount}%
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="flex gap-2">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 flex items-center justify-center gap-2 py-3 luxury-gradient text-champagne font-body text-xs uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={14} />
              Add to Bag
            </button>
            <button className="w-11 flex items-center justify-center bg-background/90 backdrop-blur text-foreground hover:text-accent transition-colors">
              <Heart size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <Link to={`/product/${product.id}`}>
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
          {product.fabric}
        </p>
        <h3 className="font-display text-sm font-medium text-foreground mb-2 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-body text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
