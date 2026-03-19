import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

import categorySarees from "@/assets/category-sarees.jpg";
import categoryBlouses from "@/assets/category-blouses.png";
import categorySuits from "@/assets/category-suits.jpg";

const API = "http://localhost/luxe-haven/api";

const CategoryBanner = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/public/categories.php`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          // Map images to categories if we know them, else use fallback
          const mapped = json.data.map((cat: any) => {
            let img = categorySarees; // Default
            let accent = "from-amber-900/60";

            if (cat.name.toLowerCase().includes('saree')) {
              img = categorySarees;
              accent = "from-amber-900/60";
            } else if (cat.name.toLowerCase().includes('blouse')) {
              img = categoryBlouses;
              accent = "from-rose-900/60";
            } else if (cat.name.toLowerCase().includes('suit')) {
              img = categorySuits;
              accent = "from-emerald-900/60";
            }

            return {
              ...cat,
              image: img,
              accentColor: accent,
              subtitle: "Premium Collection",
              link: `/collections?category=${encodeURIComponent(cat.name)}`
            };
          });
          setCategories(mapped);
        }
      })
      .catch(err => console.error("Failed to fetch categories", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="py-20 flex justify-center">
      <Loader2 className="animate-spin text-accent" size={32} />
    </div>
  );

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-accent" />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">
              Explore
            </span>
            <div className="w-8 h-px bg-accent" />
          </div>
          <h2 className="font-display text-3xl lg:text-5xl font-semibold">
            Shop by{" "}
            <span className="italic font-light text-accent">Category</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 text-center">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link
                to={cat.link}
                className="group block relative aspect-[3/4] overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.accentColor} via-foreground/15 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-light/80 mb-2">
                    {cat.subtitle}
                  </p>
                  <h3 className="font-display text-2xl text-champagne mb-4 font-medium uppercase tracking-wider">
                    {cat.name}
                  </h3>

                  {/* Hover reveal button */}
                  <div className="overflow-hidden">
                    <span className="inline-flex items-center gap-2 font-body text-xs tracking-[0.3em] uppercase text-gold-light translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      View Collection{" "}
                      <ArrowRight
                        size={12}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
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

