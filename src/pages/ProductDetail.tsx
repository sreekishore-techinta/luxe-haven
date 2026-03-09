import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Share2, ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex] = useState(0);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-display text-2xl">Product Not Found</p>
        <Link to="/collections" className="btn-outline">Browse Collections</Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center gap-2 font-body text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <ChevronRight size={10} />
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="aspect-[3/4] overflow-hidden bg-card group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col lg:sticky lg:top-24 self-start"
          >
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              {product.isNew && (
                <span className="px-3 py-1 bg-foreground text-background font-body text-[10px] uppercase tracking-[0.15em]">New</span>
              )}
              {product.isBestSeller && (
                <span className="px-3 py-1 border border-accent text-accent font-body text-[10px] uppercase tracking-[0.15em]">Best Seller</span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px bg-accent" />
              <span className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">{product.fabric}</span>
            </div>

            <h1 className="font-display text-2xl lg:text-3xl xl:text-4xl font-semibold mb-5 leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-border">
              <span className="font-display text-2xl lg:text-3xl font-semibold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="font-body text-base text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="font-body text-xs px-3 py-1 bg-burgundy text-champagne uppercase tracking-wider">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 py-6 border-y border-border">
              {[
                { label: "Fabric", value: product.fabric },
                { label: "Color", value: product.color },
                { label: "Category", value: product.category },
                { label: "Availability", value: product.inStock ? "In Stock" : "Out of Stock", accent: product.inStock },
              ].map((detail) => (
                <div key={detail.label}>
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{detail.label}</p>
                  <p className={`font-body text-sm ${detail.accent ? "text-accent font-medium" : ""}`}>{detail.value}</p>
                </div>
              ))}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center hover:bg-card transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-body text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-12 flex items-center justify-center hover:bg-card transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-border text-foreground hover:text-accent hover:border-accent transition-colors">
                <Heart size={18} />
              </button>
            </div>

            {/* Share */}
            <button className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
              <Share2 size={14} /> Share this product
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-card">
              {[
                { icon: Truck, title: "Free Shipping", desc: "Above ₹5,000" },
                { icon: RotateCcw, title: "Easy Returns", desc: "7-day policy" },
                { icon: Shield, title: "Authentic", desc: "100% genuine" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon size={18} strokeWidth={1.5} className="text-accent" />
                  <span className="font-body text-[10px] uppercase tracking-wider font-medium">{title}</span>
                  <span className="font-body text-[10px] text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        <section className="mt-24 lg:mt-32">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-px bg-accent" />
              <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">Complete the Look</span>
              <div className="w-8 h-px bg-accent" />
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-semibold">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
