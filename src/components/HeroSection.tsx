import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-1.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[85vh] lg:h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury silk saree collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-xs tracking-[0.4em] uppercase text-gold-light mb-4"
          >
            New Collection 2026
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-champagne leading-tight mb-6"
          >
            Timeless
            <br />
            <span className="italic font-normal">Elegance</span>
            <br />
            Redefined
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="font-body text-sm text-gold-light/80 mb-8 max-w-sm leading-relaxed"
          >
            Discover our curated collection of handcrafted silk sarees, where tradition meets contemporary luxury.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex gap-4"
          >
            <Link
              to="/collections"
              className="px-8 py-3.5 gold-gradient text-accent-foreground font-body text-sm uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
            >
              Shop Now
            </Link>
            <Link
              to="/collections?filter=new"
              className="px-8 py-3.5 border border-gold-light/40 text-champagne font-body text-sm uppercase tracking-[0.2em] hover:bg-champagne/10 transition-colors"
            >
              New Arrivals
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
