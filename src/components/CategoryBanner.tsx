import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import categorySarees from "@/assets/category-sarees.jpg";
import categoryBlouses from "@/assets/category-blouses.jpg";
import categorySuits from "@/assets/category-suits.jpg";

const categories = [
  { name: "Silk Sarees", image: categorySarees, link: "/collections?cat=sarees" },
  { name: "Designer Blouses", image: categoryBlouses, link: "/collections?cat=blouses" },
  { name: "Suit Sets", image: categorySuits, link: "/collections?cat=suits" },
];

const CategoryBanner = () => {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="font-body text-xs tracking-[0.4em] uppercase text-accent mb-3">
            Explore
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <Link
                to={cat.link}
                className="group block relative aspect-[4/5] overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-xl text-champagne mb-2">{cat.name}</h3>
                  <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-light group-hover:text-gold transition-colors">
                    View Collection →
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
