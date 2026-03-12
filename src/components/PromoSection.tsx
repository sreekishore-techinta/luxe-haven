import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import heroImage2 from "@/assets/hero-2.jpg";

const PromoSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.12)]">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/3] lg:aspect-auto overflow-hidden"
          >
            <img
              src={heroImage2}
              alt="Luxury silk fabric and gold jewelry"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Floating Badge */}
            <div className="absolute bottom-6 left-6 bg-background/95 backdrop-blur px-5 py-3 shadow-xl">
              <p className="font-body text-[9px] tracking-[0.4em] uppercase text-accent mb-0.5">since 2009</p>
              <p className="font-display text-sm font-semibold text-foreground">Master Weavers</p>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col justify-center bg-card p-10 lg:p-16 xl:p-20 relative overflow-hidden"
          >
            {/* Decorative circle background */}
            <div className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full border border-accent/10 opacity-60" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-accent/10 opacity-60" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-accent" />
                <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">
                  Artisan Crafted
                </span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-semibold mb-6 leading-[1.1]">
                Where Heritage
                <br />
                <span className="italic font-light text-accent">Meets Modernity</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
                Each piece in our collection is meticulously handcrafted by master
                weavers, preserving centuries-old techniques while embracing
                contemporary aesthetics. From the finest Banarasi silks to
                Kanjivaram masterpieces, every saree tells a story of artistry and
                devotion.
              </p>

              {/* Highlight list */}
              <ul className="space-y-2 mb-10">
                {[
                  "Hand-selected silk threads from artisan farms",
                  "Zero compromise on quality — every piece inspected",
                  "Traditional loom techniques with modern design sensibility",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-xs text-muted-foreground">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/about" className="btn-outline group">
                  Our Story
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link to="/collections" className="btn-gold group">
                  Shop Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
