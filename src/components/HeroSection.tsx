import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-1.jpg";
import heroImage2 from "@/assets/hero-2.jpg";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative">
      {/* Main Hero */}
      <div className="relative h-[90vh] lg:h-[95vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury silk saree collection"
            className="w-full h-full object-cover scale-105 animate-[scale-down_20s_ease-out_forwards]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        </div>

        <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-end pb-20 lg:pb-28">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-px bg-gold" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-gold-light">
                New Collection 2026
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-champagne leading-[0.95] mb-8"
            >
              Timeless
              <br />
              <span className="italic font-light text-gold-light">Elegance</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="font-body text-sm text-champagne/70 mb-10 max-w-md leading-relaxed"
            >
              Discover our curated collection of handcrafted silk sarees,
              where centuries of tradition meet contemporary luxury.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/collections" className="btn-gold group">
                Shop Collection
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/new-arrivals"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-champagne/30 text-champagne font-body text-sm uppercase tracking-[0.2em] hover:bg-champagne/10 transition-all duration-300"
              >
                New Arrivals
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Secondary Split Banner */}
      <div className="grid md:grid-cols-2">
        <Link to="/best-sellers" className="group relative h-64 lg:h-80 overflow-hidden">
          <img src={heroImage2} alt="Best sellers" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-foreground/50 group-hover:bg-foreground/40 transition-colors duration-500" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-body text-[10px] tracking-[0.5em] uppercase text-gold-light mb-2">Trending Now</p>
            <h3 className="font-display text-2xl lg:text-3xl text-champagne mb-3">Best Sellers</h3>
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-light/80 group-hover:text-gold transition-colors flex items-center gap-1">
              Explore <ArrowRight size={12} />
            </span>
          </div>
        </Link>
        <Link to="/collections" className="group relative h-64 lg:h-80 overflow-hidden bg-card">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <p className="font-body text-[10px] tracking-[0.5em] uppercase text-accent mb-2">Handcrafted</p>
            <h3 className="font-display text-2xl lg:text-3xl text-foreground mb-4">The Art of Silk</h3>
            <p className="font-body text-xs text-muted-foreground max-w-sm leading-relaxed mb-4">
              Every piece tells a story of heritage, woven with passion by master artisans across India.
            </p>
            <span className="font-body text-xs tracking-[0.3em] uppercase text-accent group-hover:text-gold-dark transition-colors flex items-center gap-1">
              View All <ArrowRight size={12} />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
