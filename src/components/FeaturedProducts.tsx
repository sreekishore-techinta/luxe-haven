import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

const FeaturedProducts = () => {
  const [activeTab, setActiveTab] = useState<"new" | "best">("new");

  const filtered = activeTab === "new"
    ? products.filter((p) => p.isNew)
    : products.filter((p) => p.isBestSeller);

  // If not enough filtered, show first 4
  const displayProducts = filtered.length >= 4 ? filtered : products.slice(0, 4);

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.4em] uppercase text-accent mb-3"
          >
            Curated For You
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl lg:text-4xl font-semibold mb-8"
          >
            Best of Both Worlds
          </motion.h2>

          {/* Tabs */}
          <div className="flex justify-center gap-8">
            {(["new", "best"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body text-sm uppercase tracking-[0.2em] pb-2 border-b-2 transition-colors duration-300 ${
                  activeTab === tab
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "new" ? "New Arrivals" : "Best Sellers"}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {displayProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
