import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import PageHeroBanner from "@/components/PageHeroBanner";

const Wishlist = () => {
  return (
    <div>
      <PageHeroBanner title="My Wishlist" subtitle="Saved Pieces" />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 mb-6 flex items-center justify-center border border-border rounded-full">
            <Heart size={32} strokeWidth={1} className="text-muted-foreground/40" />
          </div>
          <h2 className="font-display text-2xl font-semibold mb-3">Your Wishlist is Empty</h2>
          <p className="font-body text-sm text-muted-foreground max-w-sm mb-8">
            Browse our collections and tap the heart icon on any piece to save it here for later.
          </p>
          <Link to="/collections" className="btn-gold">
            Explore Collections
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;
