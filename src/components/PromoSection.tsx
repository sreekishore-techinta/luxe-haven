import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage2 from "@/assets/hero-2.jpg";

const PromoSection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="aspect-[4/3] overflow-hidden"
          >
            <img
              src={heroImage2}
              alt="Luxury silk fabric and gold jewelry"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:pl-16 xl:pl-24"
          >
            <p className="font-body text-xs tracking-[0.4em] uppercase text-accent mb-3">
              Artisan Crafted
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-6 leading-tight">
              Where Heritage
              <br />
              <span className="italic font-normal">Meets Modernity</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
              Each piece in our collection is meticulously handcrafted by master
              weavers, preserving centuries-old techniques while embracing contemporary
              aesthetics. From the finest Banarasi silks to Kanjivaram masterpieces,
              every saree tells a story of artistry and devotion.
            </p>
            <Link
              to="/about"
              className="inline-block px-8 py-3.5 border border-foreground text-foreground font-body text-sm uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              Our Story
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
