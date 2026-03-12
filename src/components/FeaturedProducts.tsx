import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import { products as staticProducts } from "@/data/products";

const tabs = [
  { key: "new", label: "New Arrivals", icon: Sparkles },
  { key: "best", label: "Best Sellers", icon: TrendingUp },
] as const;

const API = "http://localhost:8000";

const FeaturedProducts = () => {
  const [activeTab, setActiveTab] = useState<"new" | "best">("new");
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/public/products.php?per_page=100`);
        const json = await res.json();
        if (json.status === 'success') {
          const mapped = json.data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: parseFloat(p.price),
            discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
            image: p.image_url || "",
            category: p.category_name || p.category,
            description: p.description,
            fabric: p.fabric,
            isNew: p.is_new === 1,
            isBestSeller: p.is_bestseller === 1,
            stock_qty: parseInt(p.stock_qty),
            status: p.status,
            inStock: p.status !== "Out of Stock" && parseInt(p.stock_qty) > 0,
          }));
          setApiProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const displayedItems = useMemo(() => {
    // Merge static and API
    const combined = [...apiProducts];
    staticProducts.forEach(sp => {
      if (!combined.find(p => p.name === sp.name)) {
        combined.push(sp);
      }
    });

    const filtered = activeTab === "new"
      ? combined.filter(p => p.isNew)
      : combined.filter(p => p.isBestSeller || p.id === "1" || p.id === "2"); // Fallback for best sellers if list empty

    return filtered; // Show all fetched products instead of slicing to 8
  }, [activeTab, apiProducts]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-px bg-accent" />
              <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">
                Curated For You
              </span>
            </div>
            <h2 className="font-display text-3xl lg:text-5xl font-semibold leading-tight">
              Best of{" "}
              <span className="italic font-light text-accent">Both Worlds</span>
            </h2>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-0 border border-border self-start lg:self-auto overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-6 py-3 font-body text-xs uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-accent" size={32} />
              <p className="font-body text-sm text-muted-foreground italic">Fetching treasures...</p>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            >
              {displayedItems.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            to="/collections"
            className="btn-outline group inline-flex items-center gap-2"
          >
            View All{" "}
            {activeTab === "new" ? "New Arrivals" : "Best Sellers"}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
