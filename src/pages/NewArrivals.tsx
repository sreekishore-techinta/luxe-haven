import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import PageHeroBanner from "@/components/PageHeroBanner";
import { products } from "@/data/products";

const NewArrivals = () => {
  const newProducts = products.filter((p) => p.isNew);
  const displayProducts = newProducts.length > 0 ? newProducts : products.slice(0, 4);

  return (
    <div>
      <PageHeroBanner
        title="New Arrivals"
        subtitle="Just Landed"
        description="Be the first to discover our latest handcrafted silk sarees, fresh from the looms of India's finest artisans."
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {displayProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </motion.div>

        {/* Highlight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-10 lg:p-16 bg-card text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-accent" />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">Coming Soon</span>
            <div className="w-8 h-px bg-accent" />
          </div>
          <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-4">
            Monsoon Collection <span className="italic font-light">2026</span>
          </h2>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mb-6">
            A celebration of rain-soaked hues and cloud-soft silks. Subscribe to be notified when this exclusive collection drops.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input type="email" placeholder="Your email" className="input-luxury flex-1" />
            <button className="btn-gold whitespace-nowrap">Notify Me</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewArrivals;
