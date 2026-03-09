import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import CategoryBanner from "@/components/CategoryBanner";
import PromoSection from "@/components/PromoSection";
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
      <HeroSection />

      {/* Trust Bar */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <f.icon size={20} strokeWidth={1.5} className="text-accent flex-shrink-0" />
                <div>
                  <p className="font-body text-xs font-semibold">{f.title}</p>
                  <p className="font-body text-[11px] text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProducts />
      <CategoryBanner />
      <PromoSection />
      <TestimonialsSection />

      {/* Newsletter CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-px bg-accent" />
              <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">Stay Connected</span>
              <div className="w-8 h-px bg-accent" />
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-4">
              Join the LuxeDrape World
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-8">
              Be the first to know about new collections, exclusive offers, and the stories behind our craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="input-luxury flex-1" />
              <button className="btn-gold whitespace-nowrap">Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;
