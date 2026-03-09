import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImage2 from "@/assets/hero-2.jpg";

const PromoSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="aspect-[4/3] lg:aspect-auto overflow-hidden"
          >
            <img
              src={heroImage2}
              alt="Luxury silk fabric and gold jewelry"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col justify-center bg-card p-10 lg:p-16 xl:p-20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-accent" />
              <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">Artisan Crafted</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-semibold mb-6 leading-[1.1]">
              Where Heritage
              <br />
              <span className="italic font-light">Meets Modernity</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
              Each piece in our collection is meticulously handcrafted by master
              weavers, preserving centuries-old techniques while embracing contemporary
              aesthetics. From the finest Banarasi silks to Kanjivaram masterpieces,
              every saree tells a story of artistry and devotion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/about" className="btn-outline group">
                Our Story
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/collections" className="btn-gold group">
                Shop Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
