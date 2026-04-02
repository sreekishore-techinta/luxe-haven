import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Share2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";

import { API_URL as API, BASE_PATH } from "@/api_config";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Always fetch from API
    fetch(`${API}/public/products.php?id=${id}`)
      .then(res => {
        console.log("Product fetch status:", res.status);
        return res.json();
      })
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
            inStock: (p.status !== "Out of Stock" && (parseInt(p.stock_qty || p.stock_quantity || 0) > 0)) || (p.status === "Active" && parseInt(p.stock_qty || 0) > 0),
            stock_qty: parseInt(p.stock_qty || p.stock_quantity || 0),
            status: p.status,
            images: p.images?.map((img: any) => img.url) || [],
            colors: p.colors || [],
            related_products: p.related_products?.map((rp: any) => ({
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
            })) || []
          };
          setProduct(mappedProduct);

          if (mappedProduct.colors && mappedProduct.colors.length > 0) {
            setSelectedColorName(mappedProduct.colors[0].color);
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch product details", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const selectedColor = product?.colors?.find((c: any) => c.color === selectedColorName);
  
  const currentImages = useMemo(() => {
    let images: string[] = [];
    if (selectedColor && selectedColor.images.length > 0) {
       images = [...selectedColor.images];
    }
    
    // Always append general collection images so the gallery is rich
    if (product?.images && product.images.length > 0) {
       product.images.forEach((img: string) => {
          if (!images.includes(img)) images.push(img);
       });
    }

    if (images.length === 0 && product?.image) {
       images.push(product.image);
    }
    
    return images;
  }, [selectedColor, product]);

  const currentPrice = useMemo(() => {
    if (selectedColor?.variants && selectedColor.variants.length > 0) {
       const vPrice = selectedColor.variants[0].price;
       if (vPrice > 0) return vPrice;
    }
    return product?.price || 0;
  }, [selectedColor, product]);

  const currentStock = useMemo(() => {
    if (selectedColor?.variants && selectedColor.variants.length > 0) {
       return selectedColor.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
    }
    return product?.stock_qty || 0;
  }, [selectedColor, product]);

  const imageSrc = useMemo(() => {
    const rawImage = currentImages[activeImageIndex] || currentImages[0];

    if (!rawImage) {
      const idNum = parseInt(String(product?.id || "0").replace(/\D/g, "") || "0");
      return `https://images.unsplash.com/photo-${[
        "1610030469983-98e550d6193c",
        "1583391733958-650fac5ebf7f",
        "1609505848912-b7c3b8b4beda",
        "1589465885855-4421b5be9d76",
        "1562145037-41ec78627e1f",
        "1574169208507-84376144848b"
      ][isNaN(idNum) ? 0 : Math.abs(idNum) % 6]}?w=1200&q=80`;
    }
    
    if (rawImage.startsWith('http')) {
      if (rawImage.includes('localhost/') && !rawImage.includes('localhost/luxe-haven/')) {
        return rawImage.replace('localhost/', 'localhost/luxe-haven/');
      }
      return rawImage;
    }

    const cleanPath = rawImage.replace(/^src\//, '').replace(/^\/+/, '');
    return `${BASE_PATH}/${cleanPath}`;
  }, [currentImages, activeImageIndex, product?.id]);

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
    requireAuth(() => {
      const cartProd = {
        ...product,
        image: imageSrc
      };
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProd);
      }
    }, "Please login to add this piece to your bag");
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      const cartProd = {
        ...product,
        image: imageSrc
      };
      // For buy now we just add one or the chosen qty and go to checkout
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProd);
      }
      navigate("/checkout");
    }, "Please login to proceed to checkout");
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
            <div className="aspect-[3/4] overflow-hidden bg-card group relative">
              <motion.img
                key={imageSrc}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('unsplash')) {
                    const idNum = parseInt(String(product?.id || "0").replace(/\D/g, "") || "0");
                    target.src = `https://images.unsplash.com/photo-${[
                      "1610030469983-98e550d6193c",
                      "1583391733958-650fac5ebf7f",
                      "1609505848912-b7c3b8b4beda",
                      "1589465885855-4421b5be9d76",
                      "1562145037-41ec78627e1f",
                      "1574169208507-84376144848b"
                    ][isNaN(idNum) ? 0 : Math.abs(idNum) % 6]}?w=1200&q=80`;
                  }
                }}
              />
            </div>
            {currentImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 noscrollbar">
                {currentImages.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 aspect-[3/4] flex-shrink-0 overflow-hidden border transition-all ${activeImageIndex === idx ? "border-accent shadow-sm" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img 
                      src={img.startsWith('http') ? (img.includes('localhost/') && !img.includes('localhost/luxe-haven/') ? img.replace('localhost/', 'localhost/luxe-haven/') : img) : `${BASE_PATH}/${img.replace(/^src\//, '').replace(/^\/+/, '')}`} 
                      className="w-full h-full object-cover" 
                      alt={`Thumbnail ${idx + 1}`} 
                    />
                  </button>
                ))}
              </div>
            )}

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
                {formatPrice(product.discount_price && product.discount_price < currentPrice ? product.discount_price : currentPrice)}
              </span>
              {product.discount_price && product.discount_price < currentPrice && (
                <>
                  <span className="font-body text-base text-muted-foreground line-through">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="font-body text-xs px-3 py-1 bg-burgundy text-champagne uppercase tracking-wider">
                    Save {Math.round(((currentPrice - product.discount_price) / currentPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Color Navigation & Variants */}
            {product.colors && product.colors.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                   <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                     SELECT COLOR <span className="w-8 h-px bg-border inline-block ml-2"></span>
                   </p>
                   <span className="font-body text-sm text-foreground font-medium">{selectedColorName}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((cGroup: any, idx: number) => {
                    const isSelected = selectedColorName === cGroup.color;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColorName(cGroup.color);
                          setActiveImageIndex(0);
                          setQuantity(1);
                        }}
                        className={`group relative flex items-center gap-3 px-4 py-3 border transition-all ${isSelected ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-slate-300 hover:bg-slate-50"}`}
                      >
                        <span className={`w-5 h-5 rounded-full border shadow-inner ${isSelected ? "border-accent" : "border-slate-200"}`} style={{ backgroundColor: cGroup.hex || '#e2e8f0' }}></span>
                        <span className={`font-body text-xs tracking-wider uppercase ${isSelected ? "text-accent font-semibold" : "text-slate-600"}`}>
                          {cGroup.color}
                        </span>
                        {isSelected && (
                           <motion.div layoutId="currentColorOutline" className="absolute inset-x-0 -bottom-px h-px bg-accent" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : product.related_products?.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                   <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                     MORE COLOURS & STYLES <span className="w-8 h-px bg-border inline-block ml-2"></span>
                   </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.related_products.map((rel: any) => (
                      <Link
                        key={rel.id}
                        to={`/product/${rel.id}`}
                        onClick={() => window.scrollTo(0,0)}
                        className="group relative w-12 h-16 border border-border shadow-sm overflow-hidden hover:border-accent transition-all"
                        title={rel.name}
                      >
                        <img src={rel.image.startsWith('http') ? rel.image : `${BASE_PATH}/${rel.image.replace(/^src\//, '').replace(/^\/+/, '')}`} alt={rel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Description */}
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 py-6 border-y border-border">
              {[
                { label: "Fabric", value: product.fabric },
                { label: "Color", value: selectedColorName || product.color },
                { label: "Occasion", value: product.occasion },
                { label: "Pattern", value: product.pattern },
                { label: "Neck Type", value: product.neckType },
                { label: "Sleeve", value: product.sleeveType },
                { label: "Saree Type", value: product.sareeType },
                { label: "Blouse Style", value: product.blouseStyle },
                { label: "Brand", value: product.brand },
                {
                  label: "Availability",
                  value: currentStock > 0
                    ? "In Stock"
                    : "Out of Stock",
                  accent: currentStock > 0
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
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center hover:bg-card transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-body text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => {
                      const available = currentStock > 0 ? currentStock : 50;
                      if (prev >= available) return prev;
                      return prev + 1;
                    })}
                    className="w-10 h-12 flex items-center justify-center hover:bg-card transition-colors disabled:opacity-30"
                    disabled={currentStock <= 0 || quantity >= (currentStock > 0 ? currentStock : 50)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="flex-1 btn-primary disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-transparent font-black tracking-[0.2em] text-[10px] uppercase"
                >
                  <ShoppingBag size={16} />
                  {currentStock > 0 ? "Add to Bag" : "Out of Stock"}
                </button>
                <button 
                  onClick={() => requireAuth(() => toggleWishlist({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discount_price: product.discount_price,
                    image: imageSrc,
                    category: product.category,
                    fabric: product.fabric
                  }), "Please login to add to wishlist")}
                  className={`w-12 h-12 flex items-center justify-center border border-border transition-colors ${isInWishlist(product.id) ? "text-rose-500 bg-rose-50 border-rose-200" : "text-foreground hover:text-accent hover:border-accent"}`}
                >
                  <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
              
              {currentStock > 0 && (
                <button 
                  onClick={handleBuyNow}
                  className="w-full btn-gold justify-center py-4 text-[11px] font-black tracking-[0.3em] uppercase"
                >
                  Buy It Now
                </button>
              )}
            </div>

            {/* Share */}
            <button className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
              <Share2 size={14} /> Share this product
            </button>


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
            {product.related_products?.map((p: any, i: number) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
