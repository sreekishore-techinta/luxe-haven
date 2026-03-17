import HeroSection from "@/components/HeroSection";
import FlashSaleStrip from "@/components/FlashSaleStrip";
import LookbookGrid from "@/components/LookbookGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import CollectionsRibbon from "@/components/CollectionsRibbon";
import CategoryBanner from "@/components/CategoryBanner";
import SaleBanner from "@/components/SaleBanner";

import HeritageBand from "@/components/HeritageBand";
import TestimonialsSection from "@/components/TestimonialsSection";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Truck, RotateCcw, Shield, Gem } from "lucide-react";

const trustFeatures = [
  { icon: Gem, title: "100% Authentic", desc: "Certified handcrafted pieces" },
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹5,000" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure transactions" },
];

const Index = () => {
  return (
    <>
      {/* 1. Flash Sale Marquee Strip (Moved above Hero) */}
      <FlashSaleStrip />

      {/* 2. Hero Section */}
      <HeroSection />


      {/* 4. Editorial Lookbook Grid */}
      <LookbookGrid />

      {/* 5. Featured Products (New/Best Sellers tabs) */}
      <FeaturedProducts />

      {/* 6. Collections Ribbon (scroll pills by fabric) */}
      <CollectionsRibbon />

      {/* 7. Shop by Category */}
      <CategoryBanner />

      {/* 8. Festive Sale Banner */}
      <SaleBanner />

      {/* 9. Heritage Story + Stats */}
      <HeritageBand />



      {/* 11. Testimonials */}
      <TestimonialsSection />

      {/* 12. Trust Bar (Relocated) */}
      <section className="py-12 lg:py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-[#FDFBF7] rounded-sm border border-[#F5F1E8] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] py-8 lg:py-10 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
              {trustFeatures.map((f, i) => (
                <div key={f.title} className="relative flex flex-col items-center text-center px-4"
                >
                  {/* Vertical Divider for Desktop */}
                  {i !== 0 && (
                    <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-[#EADDCA]/40" />
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-4">
                      <f.icon
                        size={28}
                        strokeWidth={1}
                        color="#D4AF37"
                        className="transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold tracking-wide mb-1 text-foreground">
                        {f.title}
                      </h3>
                      <p className="font-body text-[11px] text-muted-foreground tracking-tight">
                        {f.desc}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default Index;
