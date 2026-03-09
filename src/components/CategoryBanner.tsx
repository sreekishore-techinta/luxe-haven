import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import categorySarees from "@/assets/category-sarees.jpg";
import categoryBlouses from "@/assets/category-blouses.jpg";
import categorySuits from "@/assets/category-suits.jpg";

const categories = [
  { name: "Silk Sarees", subtitle: "Heritage Weaves", image: categorySarees, link: "/collections" },
  { name: "Designer Blouses", subtitle: "Contemporary Craft", image: categoryBlouses, link: "/collections" },
  { name: "Suit Sets", subtitle: "Elegant Ensembles", image: categorySuits, link: "/collections" },
];

const CategoryBanner = () => {
  return (
    <section className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-accent" />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">Explore</span>
            <div className="w-8 h-px bg-accent" />
          </div>
          <h2 className="font-display text-3xl lg:text-5xl font-semibold">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link to={cat.link} className="group block relative aspect-[3/4] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent group-hover:from-foreground/80 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-light/70 mb-2">{cat.subtitle}</p>
                  <h3 className="font-display text-2xl text-champagne mb-3">{cat.name}</h3>
                  <span className="inline-flex items-center gap-2 font-body text-xs tracking-[0.3em] uppercase text-gold-light group-hover:text-gold transition-colors">
                    View Collection <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBanner;
