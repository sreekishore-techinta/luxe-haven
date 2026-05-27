import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

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
    <div className="bg-[#FDFBF7] min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[45vh] text-center"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {wishlist.map((product, i) => (
                <ProductCard 
                  key={product.id}
                  product={{
                    ...product,
                    price: product.price,
                    discount_price: product.discount_price || undefined,
                  } as any}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
