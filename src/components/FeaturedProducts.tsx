import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

const FeaturedProducts = () => {
  const [activeTab, setActiveTab] = useState<"new" | "best">("new");

  const filtered = activeTab === "new"
    ? products.filter((p) => p.isNew)
    : products.filter((p) => p.isBestSeller);

  const displayProducts = filtered.length >= 4 ? filtered : products.slice(0, 4);

  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="w-8 h-px bg-accent" />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">
              Curated For You
            </span>
            <div className="w-8 h-px bg-accent" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl lg:text-5xl font-semibold mb-10"
          >
            Best of Both Worlds
          </motion.h2>

          <div className="flex justify-center gap-0">
            {(["new", "best"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body text-sm uppercase tracking-[0.2em] px-8 py-3 border-b-2 transition-all duration-300 ${
                  activeTab === tab
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {tab === "new" ? "New Arrivals" : "Best Sellers"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            to={activeTab === "new" ? "/new-arrivals" : "/best-sellers"}
            className="btn-outline group"
          >
            View All {activeTab === "new" ? "New Arrivals" : "Best Sellers"}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
