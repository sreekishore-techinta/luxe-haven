import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/new-collections-hero.jpg";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative w-full">
      {/* Main Hero Wrapper */}
      <div className="relative w-full h-[85vh] md:h-screen overflow-hidden">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat bg-[center_top] md:bg-[center_30%] transition-all duration-1000 ease-out"
            style={{ 
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover"
            }}
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 lg:bg-gradient-to-r lg:from-foreground/80 lg:via-foreground/30 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Hero Content Container */}
        <div className="relative h-full container mx-auto px-4 lg:px-20 flex flex-col justify-center lg:justify-center">
          <div className="max-w-2xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex items-center justify-center lg:justify-start gap-3 mb-6 lg:mb-8"
            >
              <div className="w-8 lg:w-16 h-px bg-gold" />
              <span className="font-body text-[10px] lg:text-[12px] tracking-[0.5em] lg:tracking-[0.6em] uppercase text-gold-light font-semibold">
                New Collection 2026
              </span>
              <div className="w-8 lg:hidden h-px bg-gold" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-[110px] font-semibold text-white lg:text-champagne leading-[1] lg:leading-[0.9] mb-8 lg:mb-10 [text-shadow:_0_10px_30px_rgba(0,0,0,0.3)]"
            >
              Timeless
              <br />
              <span className="italic font-light text-gold-light">Elegance</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="font-body text-sm lg:text-lg text-white/90 lg:text-champagne/80 mb-10 lg:mb-12 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Discover our curated collection of handcrafted silk sarees,
              where centuries of tradition meet contemporary luxury.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
            >
              <Link to="/collections" className="group relative px-12 py-4 bg-gold-dark text-white rounded-[4px] text-[11px] font-bold uppercase tracking-[0.3em] overflow-hidden transition-all shadow-2xl hover:bg-gold hover:scale-105 active:scale-95 text-center w-full sm:w-auto">
                <span className="relative z-10">Shop Collection</span>
                <div className="absolute inset-0 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 z-0" />
              </Link>
              <Link
                to="/new-arrivals"
                className="group inline-flex items-center justify-center gap-2 px-12 py-4 border border-white/40 lg:border-champagne/40 text-white lg:text-champagne font-body text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-all duration-300 w-full sm:w-auto rounded-[4px]"
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
