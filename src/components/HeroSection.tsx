import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/new-collections-hero.jpg";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative w-full">
      {/* Main Hero Wrapper */}
      <div className="relative w-full h-[80vh] md:h-screen overflow-hidden">
        {/* Background Image Container */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury silk saree collection"
            className="w-full h-full object-cover object-[center_20%]"
            loading="eager"
            fetchPriority="high"
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 lg:bg-gradient-to-r lg:from-foreground/90 lg:via-foreground/40 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Hero Content Container */}
        <div className="relative h-full container mx-auto px-4 lg:px-8 flex flex-col justify-center pt-[35vh] lg:pt-0 lg:justify-end pb-12 lg:pb-28">
          <div className="max-w-2xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex items-center justify-center lg:justify-start gap-3 mb-4 lg:mb-6"
            >
              <div className="w-8 lg:w-12 h-px bg-gold" />
              <span className="font-body text-[10px] lg:text-[11px] tracking-[0.4em] lg:tracking-[0.5em] uppercase text-gold-light">
                New Collection 2026
              </span>
              <div className="w-8 lg:hidden h-px bg-gold" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white lg:text-champagne leading-[1.1] lg:leading-[0.95] mb-6 lg:mb-8"
            >
              Timeless
              <br />
              <span className="italic font-light text-gold-light">Elegance</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="font-body text-xs lg:text-sm text-white/80 lg:text-champagne/70 mb-8 lg:mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Discover our curated collection of handcrafted silk sarees,
              where centuries of tradition meet contemporary luxury.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link to="/collections" className="btn-gold group w-full sm:w-auto px-10">
                Shop Collection
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/new-arrivals"
                className="inline-flex items-center justify-center gap-2 px-10 py-3.5 border border-white/30 lg:border-champagne/30 text-white lg:text-champagne font-body text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
              >
                New Arrivals
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
