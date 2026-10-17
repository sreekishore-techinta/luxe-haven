import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Truck, Video, AlertCircle, ChevronRight, ChevronLeft, Minus, Plus, Share2, ArrowRight, Sparkles, Package, ShieldCheck, RefreshCw, Ruler, Droplets, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import ShareProduct from "@/components/ShareProduct";
import ProductGallery from "@/components/ProductGallery";

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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);

  const STITCHING_OPTIONS = [] as any[]; // Removed hardcoded options

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
            mrp_price: p.mrp_price ? parseFloat(p.mrp_price) : undefined,
            image: p.image || "",
            category: p.category_name || "General",
            description: p.description,
            fabric: p.fabric_name || "Premium Quality",
            color: p.colour_name || "",
            colorHex: p.hex_code || "",
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
              color: rp.colour_name || "",
              colorHex: rp.colour_hex || "",
              mrp_price: rp.mrp_price ? parseFloat(rp.mrp_price) : undefined,
              isNew: rp.is_new === 1,
              isBestSeller: rp.is_bestseller === 1,
              inStock: rp.status !== "Out of Stock" && parseInt(rp.stock_qty || rp.stock_quantity) > 0,
            })) || [],
            fabric_care: p.fabric_care || "",
            return_policy: p.return_policy || "",
            saree_specifications: p.saree_specifications || "",
            add_ons: p.add_ons || []
          };
          setProduct(mappedProduct);

          if (mappedProduct.colors && mappedProduct.colors.length > 0) {
            setSelectedColorName(mappedProduct.colors[0].color);
            if (mappedProduct.colors[0].variants && mappedProduct.colors[0].variants.length > 0) {
              setSelectedVariantId(String(mappedProduct.colors[0].variants[0].id));
            }
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch product details", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const selectedColor = product?.colors?.find((c: any) => c.color === selectedColorName);
  
  const galleryImages = useMemo(() => {
    let images: string[] = [];
    if (product?.images && product.images.length > 0) {
       images = [...product.images];
    } else if (product?.image) {
       images.push(product.image);
    }
    return images;
  }, [product]);

  // Auto-swipe gallery every 10 seconds
  useEffect(() => {
    if (!product || !galleryImages || galleryImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => 
        prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
      );
      setColorHeroImage(null);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [galleryImages]);

  const [colorHeroImage, setColorHeroImage] = useState<string | null>(null);

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

  // Combine color hero image with gallery if it exists
  const displayImages = useMemo(() => {
    const images = [...galleryImages];
    if (colorHeroImage && !images.includes(colorHeroImage)) {
        images.unshift(colorHeroImage);
    }
    
    // Ensure absolute paths
    return images.map(img => {
      if (img.startsWith('http')) {
        if (img.includes('localhost/') && !img.includes('localhost/luxe-haven/')) {
          return img.replace('localhost/', 'localhost/luxe-haven/');
        }
        return img;
      }
      const cleanPath = img.replace(/^src\//, '').replace(/^\/+/, '');
      return `${BASE_PATH}/${cleanPath}`;
    });
  }, [galleryImages, colorHeroImage]);

  // Fallback for sharing image
  const imageSrc = displayImages[0] || `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80`;

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
      const activeAddOns = product.add_ons?.filter((ao: any) => selectedAddOns.includes(ao.id)) || [];
      const addOnPrice = activeAddOns.reduce((sum: number, ao: any) => sum + Number(ao.price), 0);
      
      const stitchingText = activeAddOns
        .filter((ao: any) => ao.name.toLowerCase().includes('falls'))
        .map((ao: any) => ao.name)
        .join(', ');
        
      const hasGiftRow = activeAddOns.some((ao: any) => ao.name.toLowerCase().includes('gift'));

      const cartProd = {
        ...product,
        // Unique ID including options to treat different selections as separate cart items
        id: `${selectedVariantId ? `v${selectedVariantId}` : product.id}-${selectedAddOns.sort().join('_')}`,
        baseId: selectedVariantId ? `v${selectedVariantId}` : product.id,
        price: currentPrice + addOnPrice,
        basePrice: currentPrice,
        addOnPrice: addOnPrice,
        stock_qty: currentStock,
        color: selectedColorName || product.color,
        image: imageSrc,
        selectedStitching: stitchingText || null,
        hasGiftWrapping: hasGiftRow,
        selectedAddOnDetails: activeAddOns.map((ao: any) => ({ name: ao.name, price: ao.price }))
      };
      
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProd);
      }
    }, "Please login to add this piece to your bag");
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      const activeAddOns = product.add_ons?.filter((ao: any) => selectedAddOns.includes(ao.id)) || [];
      const addOnPrice = activeAddOns.reduce((sum: number, ao: any) => sum + Number(ao.price), 0);

      const stitchingText = activeAddOns
        .filter((ao: any) => ao.name.toLowerCase().includes('falls'))
        .map((ao: any) => ao.name)
        .join(', ');
        
      const hasGiftRow = activeAddOns.some((ao: any) => ao.name.toLowerCase().includes('gift'));

      const cartProd = {
        ...product,
        id: `${selectedVariantId ? `v${selectedVariantId}` : product.id}-${selectedAddOns.sort().join('_')}`,
        baseId: selectedVariantId ? `v${selectedVariantId}` : product.id,
        price: currentPrice + addOnPrice,
        basePrice: currentPrice,
        addOnPrice: addOnPrice,
        stock_qty: currentStock,
        color: selectedColorName || product.color,
        image: imageSrc,
        selectedStitching: stitchingText || null,
        hasGiftWrapping: hasGiftRow,
        selectedAddOnDetails: activeAddOns.map((ao: any) => ({ name: ao.name, price: ao.price }))
      };
      // For buy now we just add one or the chosen qty and go to checkout
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProd);
      }
      navigate("/checkout");
    }, "Please login to proceed to checkout");
  };

  const handlePreviousImage = () => {
    if (galleryImages.length > 1) {
      const newIndex = activeImageIndex === 0 ? galleryImages.length - 1 : activeImageIndex - 1;
      setActiveImageIndex(newIndex);
      setColorHeroImage(null);
    }
  };

  const handleNextImage = () => {
    if (galleryImages.length > 1) {
      const newIndex = activeImageIndex === galleryImages.length - 1 ? 0 : activeImageIndex + 1;
      setActiveImageIndex(newIndex);
      setColorHeroImage(null);
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
        <div className="grid lg:grid-cols-[5fr_7fr] gap-8 lg:gap-16 items-start">
          {/* Images */}
          {/* Images */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <ProductGallery images={displayImages} />
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

            {/* Color Variations (Improved Selector) */}
            {product.colors && product.colors.length > 0 && (
               <div className="mb-10 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                   <p className="font-display text-[11px] uppercase tracking-[0.2em] text-accent font-black flex items-center gap-2">
                     EXPLORE COLOURS <span className="w-12 h-px bg-accent/20 inline-block ml-2"></span>
                   </p>
                   <span className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">{product.colors.length} Variants Available</span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-3">
                  {product.colors.map((cGroup: any, idx: number) => {
                    const isSelected = selectedColorName === cGroup.color;
                    const variantImg = cGroup.images?.[0] ? 
                      (cGroup.images[0].startsWith('http') ? cGroup.images[0] : `${BASE_PATH}/${cGroup.images[0].replace(/^src\//, '').replace(/^\/+/, '')}`) : 
                      imageSrc;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColorName(cGroup.color);
                          if (cGroup.variants && cGroup.variants.length > 0) {
                            setSelectedVariantId(String(cGroup.variants[0].id));
                          } else {
                            setSelectedVariantId(null);
                          }
                          setActiveImageIndex(0);
                          if (cGroup.images && cGroup.images.length > 0) {
                            setColorHeroImage(cGroup.images[0]);
                          }
                        }}
                        className={`group relative flex flex-col items-center gap-2 transition-all duration-500`}
                      >
                         <div className={`aspect-square w-full rounded-2xl overflow-hidden border-2 transition-all duration-500 ${isSelected ? "border-accent ring-4 ring-accent/10 shadow-2xl scale-110 z-10" : "border-transparent opacity-70 grayscale-[30%] hover:opacity-100 hover:grayscale-0 hover:border-accent/40 hover:scale-105"}`}>
                            <img src={variantImg} className="w-full h-full object-cover" alt={cGroup.color} />
                            {/* Color Swatch Overlay */}
                            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: cGroup.hex || '#ccc' }} />
                         </div>
                         <span className={`text-[8px] font-black uppercase tracking-tighter truncate w-full text-center ${isSelected ? 'text-accent' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>
                           {cGroup.color}
                         </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fallback Related Products if no variants */}
            {(!product.colors || product.colors.length === 0) && product.related_products?.length > 0 && (
               <div className="mb-10 space-y-4">
                <div className="flex items-baseline gap-2">
                   <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                     ALSO DISCOVER <span className="w-8 h-px bg-border inline-block ml-2"></span>
                   </p>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {product.related_products.slice(0, 5).map((rel: any) => {
                    const relImg = rel.image.startsWith('http') ? rel.image : `${BASE_PATH}/${rel.image.replace(/^src\//, '').replace(/^\/+/, '')}`;
                    return (
                      <Link
                        key={rel.id}
                        to={`/product/${rel.id}`}
                        onClick={() => window.scrollTo(0,0)}
                        className="flex flex-col border border-border rounded-lg overflow-hidden bg-white hover:border-accent/40 hover:shadow-md transition-all group"
                      >
                         <div className="aspect-[3/4] overflow-hidden grayscale-[20%] group-hover:grayscale-0 transition-all">
                            <img src={relImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={rel.name} />
                         </div>
                         <div className="p-1.5 text-center bg-white border-t border-slate-50">
                            <p className="font-body text-[10px] font-medium text-slate-600 group-hover:text-accent uppercase tracking-tight truncate">{rel.color || "Varied"}</p>
                         </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-2 py-6 border-y border-border">
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
                    ? `In Stock (${currentStock})`
                    : "Out of Stock",
                  accent: currentStock > 0
                },
                {
                  label: "Product Code",
                  value: product.id ? `LH-${String(product.id).padStart(6, '0')}` : 'N/A',
                },
              ].map((detail) => (
                detail.value && (
                  <div key={detail.label}>
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{detail.label}</p>
                    <p className={`font-body text-sm ${detail.accent ? (currentStock <= 5 ? "text-orange-600 font-bold" : "text-emerald-700 font-medium") : detail.label === "Availability" ? "text-rose-600 font-bold" : ""}`}>{detail.value}</p>
                  </div>
                )
              ))}
            </div>

            {/* Add-on Services - Premium Grouped Implementation */}
            {product.add_ons && product.add_ons.length > 0 && (
              <div className="mb-10 space-y-10 border-t border-border pt-10">
                {Object.entries(
                  product.add_ons.reduce((groups: any, ao: any) => {
                    const group = ao.group_name || "General";
                    if (!groups[group]) groups[group] = [];
                    groups[group].push(ao);
                    return groups;
                  }, {})
                ).map(([groupName, items]: [string, any]) => {
                  const isRadio = items.some((item: any) => item.input_type === 'radio');
                  
                  return (
                    <div key={groupName} className="space-y-5">
                      <div className="flex items-center gap-4">
                        <h3 className="font-display text-[11px] font-black uppercase tracking-[0.3em] text-accent/80 whitespace-nowrap">
                          {groupName} Services
                        </h3>
                        <div className="h-px w-full bg-gradient-to-r from-accent/20 to-transparent" />
                      </div>
                      
                      <div className="space-y-4">
                        {/* Radio Group Header: "None" Option if it's a radio/exclusive group */}
                        {isRadio && (
                          <label 
                            className={`group relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${!items.some((item: any) => selectedAddOns.includes(item.id)) ? 'bg-slate-50' : 'bg-transparent hover:bg-slate-50/50'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              const groupIds = items.map((i: any) => i.id);
                              setSelectedAddOns(prev => prev.filter(id => !groupIds.includes(id)));
                            }}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${!items.some((item: any) => selectedAddOns.includes(item.id)) ? 'border-accent bg-accent/5 shadow-[0_0_10px_rgba(180,140,94,0.3)]' : 'border-slate-300 group-hover:border-accent'}`}>
                               <AnimatePresence>
                                 {!items.some((item: any) => selectedAddOns.includes(item.id)) && (
                                   <motion.div 
                                     initial={{ scale: 0 }} 
                                     animate={{ scale: 1 }} 
                                     exit={{ scale: 0 }}
                                     className="w-3 h-3 rounded-full bg-accent" 
                                   />
                                 )}
                               </AnimatePresence>
                            </div>
                            <span className={`font-body text-sm tracking-tight transition-colors ${!items.some((item: any) => selectedAddOns.includes(item.id)) ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>None</span>
                          </label>
                        )}

                        {items.map((ao: any) => {
                          const isSelected = selectedAddOns.includes(ao.id);
                          const isRadioItem = ao.input_type === 'radio';
                          
                          return (
                            <label 
                              key={ao.id}
                              className={`group relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${isSelected ? 'bg-slate-50' : 'bg-transparent hover:bg-slate-50/50'}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedAddOns(prev => {
                                  if (isSelected) {
                                    if (isRadioItem) return prev; 
                                    return prev.filter(id => id !== ao.id);
                                  }
                                  
                                  if (isRadioItem) {
                                      const otherGroupIds = items.map((item: any) => item.id);
                                      return [...prev.filter(id => !otherGroupIds.includes(id)), ao.id];
                                  }
                                  
                                  return [...prev, ao.id];
                                });
                              }}
                            >
                              <div className={`w-6 h-6 transition-all flex items-center justify-center border-2 ${isRadioItem ? 'rounded-full' : 'rounded-md'} ${isSelected ? 'border-accent bg-accent/5 shadow-[0_0_10px_rgba(180,140,94,0.3)]' : 'border-slate-300 group-hover:border-accent'}`}>
                                 <AnimatePresence>
                                   {isSelected && (
                                     <motion.div 
                                       initial={{ scale: 0 }} 
                                       animate={{ scale: 1 }}
                                       exit={{ scale: 0 }}
                                       className={`flex items-center justify-center ${isRadioItem ? 'w-3 h-3 rounded-full bg-accent' : 'text-accent'}`}
                                     >
                                       {!isRadioItem && <Plus size={14} strokeWidth={4} />}
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                              </div>
                              <div className="flex flex-col">
                                <span className={`font-body text-sm tracking-tight transition-colors ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                  {ao.name} <span className="opacity-60 text-[13px] ml-1 font-medium">(+₹{Number(ao.price).toLocaleString('en-IN')})</span>
                                </span>
                                {ao.description && <span className="text-[10px] text-slate-400 mt-0.5">{ao.description}</span>}
                              </div>
                              {isSelected && (
                                <motion.div 
                                  layoutId={`active-indicator-${ao.id}`}
                                  className="absolute left-0 w-1 h-1/2 bg-accent rounded-full"
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Low Stock Warning - Subtle Luxury Urgency */}
            {currentStock > 0 && currentStock <= 5 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 mb-2 flex items-center gap-2 py-2 px-3 bg-amber-50 border border-amber-100 rounded-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="font-body text-xs text-amber-800 font-semibold tracking-wide">
                   Hurry up! Only {currentStock} item{currentStock > 1 ? 's' : ''} left in stock
                </p>
              </motion.div>
            )}

            {/* Quantity + Purchase Row */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-2 xl:gap-3 w-full">
                <div className="flex items-center border border-border bg-card/30">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-10 flex items-center justify-center hover:bg-card transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center font-body text-xs font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => {
                      const available = currentStock > 0 ? currentStock : 50;
                      if (prev >= available) return prev;
                      return prev + 1;
                    })}
                    className="w-8 h-10 flex items-center justify-center hover:bg-card transition-colors disabled:opacity-30"
                    disabled={currentStock <= 0 || quantity >= (currentStock > 0 ? currentStock : 50)}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex flex-1 items-center gap-2 xl:gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0}
                    className="flex-1 btn-primary py-3 px-0 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-transparent min-w-0"
                  >
                    <ShoppingBag size={14} className="flex-shrink-0" />
                    <span className="truncate">Add to Bag</span>
                  </button>

                  {currentStock > 0 && (
                    <button 
                      onClick={handleBuyNow}
                      className="flex-1 btn-gold py-3 px-0 min-w-0"
                    >
                      <span className="truncate">Buy It Now</span>
                    </button>
                  )}
                </div>

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
                  className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full border border-border transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95 ${isInWishlist(product.id) ? "text-rose-500 bg-rose-50 border-rose-200" : "text-foreground hover:text-accent hover:border-accent"}`}
                >
                  <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Share */}
            <ShareProduct 
               productId={product.id}
               productName={product.name} 
               productImage={imageSrc} 
               className="mb-8"
            />

            {/* Categories */}
            <div className="mb-6">
               <p className="font-body text-[14px] text-foreground">
                 Categories: <span className="text-muted-foreground">{product.category}</span>
               </p>
            </div>

            {/* Enhanced Minimalist Accordions - Matching requested design */}
            <div className="mt-10 border-t border-slate-100">
                {[
                    {
                        id: 'details',
                        label: 'Product Details',
                        icon: <Heart size={18} className="text-slate-400" />,
                        content: (
                            <div className="space-y-4">
                                <p className="leading-relaxed font-body text-[13px] text-slate-600">
                                    {product.description}
                                </p>
                                <div className="grid grid-cols-1 gap-y-2 pt-2">
                                    {product.fabric && (
                                        <div className="flex justify-between border-b border-slate-50 py-2">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Fabric</span>
                                            <span className="text-[12px] font-black text-slate-900">{product.fabric}</span>
                                        </div>
                                    )}
                                    {product.sareeType && (
                                        <div className="flex justify-between border-b border-slate-50 py-2">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Type</span>
                                            <span className="text-[12px] font-black text-slate-900">{product.sareeType}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    },
                    {
                        id: 'care',
                        label: 'Washcare Instructions',
                        icon: <Droplets size={18} className="text-slate-400" />,
                        content: (
                            <p className="leading-relaxed font-body text-[13px] text-slate-600 whitespace-pre-line">
                                {product.fabric_care || "- Only dry clean recommended\n- Keep in a cool, dry place\n- Handle with absolute care"}
                            </p>
                        )
                    },
                    {
                        id: 'returns',
                        label: 'Shipping & Return',
                        icon: <Package size={18} className="text-slate-400" />,
                        content: (
                            <div className="space-y-4 font-body text-[13px] text-slate-600">
                                <div className="space-y-2">
                                    <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">All prices are inclusive of GST.</p>
                                    <ul className="space-y-2 list-disc pl-4 opacity-80">
                                        <li>Shipping charges are calculated at checkout based on order size, packaging, and delivery location.</li>
                                        <li>For International Orders, shipping charges are different.</li>
                                        <li>Import duty, VAT, and local taxes (if applicable) may be applicable and must be paid by the customer at delivery.</li>
                                    </ul>
                                </div>
                                {product.return_policy && (
                                    <div className="pt-4 mt-4 border-t border-slate-100">
                                        <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-2">Return & Refund Policy</p>
                                        <p className="opacity-80 italic">{product.return_policy}</p>
                                    </div>
                                )}
                            </div>
                        )
                    }
                ].map((section) => (
                    <div key={section.id} className="border-b border-slate-100">
                        <button
                            onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                            className="w-full flex items-center justify-between py-6 group"
                        >
                            <div className="flex items-center gap-4">
                                {section.icon}
                                <span className="font-display text-[14px] font-black uppercase tracking-[0.15em] text-slate-900 group-hover:text-accent transition-colors">
                                    {section.label}
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: openSection === section.id ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-slate-400 group-hover:text-slate-900"
                            >
                                <ChevronDown size={18} />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {openSection === section.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden bg-slate-50/50 rounded-2xl mb-4"
                                >
                                    <div className="p-6">
                                        {section.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>


          </motion.div>
        </div>

        {/* Related Products */}
        <section className="mt-12 lg:mt-16">
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
