import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import PageHeroBanner from "@/components/PageHeroBanner";
import { products } from "@/data/products";
import { Star } from "lucide-react";

const BestSellers = () => {
  const bestProducts = products.filter((p) => p.isBestSeller);
  const displayProducts = bestProducts.length > 0 ? bestProducts : products.slice(0, 4);

  return (
    <div>
      <PageHeroBanner
        title="Best Sellers"
        subtitle="Most Loved"
        description="Our patrons' favorites — the sarees that have won hearts across the country for their quality, beauty, and timeless appeal."
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-6 mb-16 max-w-2xl mx-auto text-center"
        >
          {[
            { number: "10,000+", label: "Happy Customers" },
            { number: "4.9", label: "Average Rating", icon: true },
            { number: "500+", label: "5-Star Reviews" },
          ].map((stat) => (
            <div key={stat.label} className="py-6">
              <div className="flex items-center justify-center gap-1">
                <span className="font-display text-2xl lg:text-3xl font-semibold">{stat.number}</span>
                {stat.icon && <Star size={16} className="fill-gold text-gold" />}
              </div>
              <p className="font-body text-[11px] tracking-[0.15em] uppercase text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BestSellers;
