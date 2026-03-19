import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Share2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

const API = "http://localhost/luxe-haven/api";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex] = useState(0);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    // Always fetch from API
    fetch(`${API}/public/products.php?id=${id}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success' && json.data && json.data.length > 0) {
          const p = json.data[0];
          const mappedProduct = {
            id: String(p.id),
            name: p.name,
            price: parseFloat(p.price),
            discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
            image: p.image || "",
            category: p.category_name || "General",
            description: p.description,
            fabric: p.fabric_name || "Premium Quality",
            color: p.colour_name || "",
            occasion: p.occasion_name || "",
            pattern: p.pattern_name || "",
            neckType: p.neck_type_name || "",
            sleeveType: p.sleeve_type_name || "",
            brand: p.brand_name || "",
            sareeType: p.saree_type_name || "",
            blouseStyle: p.blouse_style_name || "",
            isNew: p.is_new === 1,
            isBestSeller: p.is_bestseller === 1,
            inStock: p.status !== "Out of Stock" && (parseInt(p.stock_qty || p.stock_quantity) > 0),
            stock_qty: parseInt(p.stock_qty || p.stock_quantity || 0),
            status: p.status,
            images: p.images?.map((img: any) => img.url) || []
          };
          setProduct(mappedProduct);

          // Fetch related products from same category
          if (mappedProduct.category) {
            fetch(`${API}/public/products.php?category=${encodeURIComponent(mappedProduct.category)}&per_page=5`)
              .then(res => res.json())
              .then(relJson => {
                if (relJson.status === 'success') {
                  const filtered = relJson.data
                    .filter((rp: any) => String(rp.id) !== String(p.id))
                    .slice(0, 4)
                    .map((rp: any) => ({
                      id: String(rp.id),
                      name: rp.name,
                      price: parseFloat(rp.price),
                      discount_price: rp.discount_price ? parseFloat(rp.discount_price) : undefined,
                      image: rp.image || "",
                      category: rp.category_name || "General",
                      fabric: rp.fabric_name || "Premium Quality",
                      isNew: rp.is_new === 1,
                      isBestSeller: rp.is_bestseller === 1,
                      inStock: rp.status !== "Out of Stock" && parseInt(rp.stock_qty || rp.stock_quantity) > 0,
                      stock_qty: parseInt(rp.stock_qty || rp.stock_quantity || 0),
                    }));
                  setRelatedProducts(filtered);
                }
              });
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch product details", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-12 h-12 border-2 border-[#0D3B2E]/10 border-t-[#B48C5E] rounded-full animate-spin" />
      <p className="font-display text-lg italic text-[#0D3B2E]/60">Revealing masterpiece...</p>
    </div>
  );

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

  const discount = product.discount_price && product.price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    const cartProd = {
      ...product,
      image: product.image || product.images?.[0] || ""
    };
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProd);
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
                src={product.image || `https://images.unsplash.com/photo-${[
                  "1610030469983-98e550d6193c",
                  "1583391733958-650fac5ebf7f",
                  "1609505848912-b7c3b8b4beda",
                  "1589465885855-4421b5be9d76",
                  "1562145037-41ec78627e1f",
                  "1574169208507-84376144848b"
                ][parseInt(String(product.id).replace(/\D/g, "")) % 6]}?w=1200&q=80`}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
                fetchPriority="high"
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
              <span className="font-display text-2xl lg:text-3xl font-semibold">
                {formatPrice(product.discount_price || product.price)}
              </span>
              {product.discount_price && (
                <>
                  <span className="font-body text-base text-muted-foreground line-through">
                    {formatPrice(product.price)}
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
                { label: "Occasion", value: product.occasion },
                { label: "Pattern", value: product.pattern },
                { label: "Neck Type", value: product.neckType },
                { label: "Sleeve", value: product.sleeveType },
                { label: "Saree Type", value: product.sareeType },
                { label: "Blouse Style", value: product.blouseStyle },
                { label: "Brand", value: product.brand },
                {
                  label: "Availability",
                  value: product.inStock
                    ? "In Stock"
                    : "Out of Stock",
                  accent: product.inStock
                },
              ].map((detail) => (
                detail.value && (
                  <div key={detail.label}>
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{detail.label}</p>
                    <p className={`font-body text-sm ${detail.accent ? "text-accent font-medium leading-relaxed" : ""}`}>{detail.value}</p>
                  </div>
                )
              ))}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center hover:bg-card transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-body text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => {
                    const available = product.stock_qty ?? 50;
                    if (prev >= available) return prev;
                    return prev + 1;
                  })}
                  className="w-10 h-12 flex items-center justify-center hover:bg-card transition-colors disabled:opacity-30"
                  disabled={!product.inStock || quantity >= (product.stock_qty ?? 50)}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 btn-primary disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-transparent"
              >
                <ShoppingBag size={16} />
                {product.inStock ? "Add to Bag" : "Out of Stock"}
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-card">
              {[
                { icon: Truck, title: "Free Shipping", desc: "Above ₹5,000" },
                { icon: RotateCcw, title: "Easy Returns", desc: "7-day policy" },
                { icon: Shield, title: "Authentic", desc: "100% genuine" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center gap-1.5 text-center p-2">
                  <Icon size={18} strokeWidth={1.5} className="text-accent" />
                  <span className="font-body text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap">{title}</span>
                  <span className="font-body text-[9px] text-muted-foreground">{desc}</span>
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
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
