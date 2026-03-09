import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Truck, RotateCcw, Shield, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-body text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="py-6 lg:py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 font-body text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
          <ChevronRight size={12} />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-[3/4] overflow-hidden bg-card"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-2">
              {product.fabric}
            </p>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-4 leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-2xl font-semibold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="font-body text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="font-body text-xs px-2 py-0.5 bg-burgundy text-champagne">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-8 py-6 border-y border-border">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Fabric</p>
                <p className="font-body text-sm">{product.fabric}</p>
              </div>
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Color</p>
                <p className="font-body text-sm">{product.color}</p>
              </div>
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Category</p>
                <p className="font-body text-sm">{product.category}</p>
              </div>
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Availability</p>
                <p className="font-body text-sm text-accent">{product.inStock ? "In Stock" : "Out of Stock"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => addToCart(product)}
                className="flex-1 flex items-center justify-center gap-2 py-4 luxury-gradient text-champagne font-body text-sm uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>
              <button className="w-14 flex items-center justify-center border border-border text-foreground hover:text-accent hover:border-accent transition-colors">
                <Heart size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RotateCcw, label: "Easy Returns" },
                { icon: Shield, label: "Authentic" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 py-3">
                  <Icon size={18} className="text-accent" />
                  <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        <section className="mt-20 lg:mt-28">
          <h2 className="font-display text-2xl lg:text-3xl font-semibold text-center mb-10">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
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
