import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react";
import PageHeroBanner from "@/components/PageHeroBanner";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

import wishlistHero from "@/assets/wishlist-hero.png";

const Wishlist = () => {
  const { wishlist, toggleWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  if (isLoading && wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-burgundy" size={48} />
        <p className="font-display text-xl italic text-burgundy/60">Opening your royal chest of favorites...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen">
      <PageHeroBanner
        title="My Wishlist"
        subtitle="Saved Treasures"
        backgroundImage={wishlistHero}
        heightClass="h-[90vh] lg:h-screen"
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 mb-6 flex items-center justify-center border border-border rounded-full bg-white shadow-sm">
              <Heart size={32} strokeWidth={1} className="text-muted-foreground/30" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#0D3B2E] mb-3">Your Wishlist is Empty</h2>
            <p className="font-body text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
              Browse our collections and tap the heart icon on any piece to save it here for later.
            </p>
            <Link to="/collections" className="btn-gold px-12 py-4">
              Explore Collections
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-6">
              <p className="font-body text-sm text-muted-foreground">
                You have <span className="font-bold text-[#0D3B2E]">{wishlist.length}</span> {wishlist.length === 1 ? 'masterpiece' : 'masterpieces'} saved
              </p>
              <Link to="/collections" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-burgundy hover:gap-3 transition-all">
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {wishlist.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group bg-white border border-border/50 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-muted-foreground hover:text-burgundy hover:bg-white transition-all shadow-sm"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Product Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-burgundy font-bold mb-1">{product.fabric}</p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-display text-base font-semibold text-[#0D3B2E] line-clamp-1 italic group-hover:text-gold transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="font-body text-lg font-black text-[#0D3B2E]">
                          {formatPrice(product.discount_price || product.price)}
                        </span>
                        {product.discount_price && (
                          <span className="font-body text-xs text-muted-foreground line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product as any)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 luxury-gradient text-champagne font-body text-[10px] uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBag size={14} />
                      Add to Bag
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
