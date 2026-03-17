import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, PackageSearch } from "lucide-react";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";

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
        // Fetch products that are active and in stock
        const res = await fetch(`${API}/public/products.php?per_page=100&status=Active`);
        const json = await res.json();
        if (json.status === 'success') {
          const mapped = json.data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: parseFloat(p.price),
            discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
            image: p.image || "",
            category: p.category_name || p.category,
            description: p.description,
            fabric: p.fabric,
            isNew: p.is_new === 1,
            isBestSeller: (p.sales_count ?? 0) > 10 || p.is_bestseller === 1,
            sales_count: parseInt(p.sales_count ?? 0),
            created_at: p.created_at,
            stock_qty: parseInt(p.stock_qty),
            status: p.status,
            inStock: p.status !== "Out of Stock" && (parseInt(p.stock_qty) || 0) > 0,
          }));
          setApiProducts(mapped.filter((p: any) => p.inStock));
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
    let filtered = [...apiProducts];

    if (activeTab === "new") {
      // Latest products (order by created_at DESC or isNew tag)
      filtered = filtered
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);
    } else {
      // Best sellers (order by sales_count DESC)
      filtered = filtered
        .sort((a, b) => (b.sales_count ?? 0) - (a.sales_count ?? 0))
        .slice(0, 8);
    }

    return filtered;
  }, [activeTab, apiProducts]);

  return (
    <section className="py-16 bg-[#FDFBF7]/50">
      <div className="container mx-auto px-4 lg:px-8 text-center sm:text-left">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <div className="w-8 h-px bg-accent" />
              <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent font-semibold">
                Curated For You
              </span>
            </div>
            <h2 className="font-display text-3xl lg:text-5xl font-semibold leading-tight text-[#0D3B2E]">
              Best of{" "}
              <span className="italic font-light text-[#B48C5E]">Both Worlds</span>
            </h2>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center justify-center lg:justify-start gap-0 border border-border bg-white rounded-full overflow-hidden p-1 shadow-sm self-center lg:self-auto min-h-[50px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2.5 px-8 py-2.5 rounded-full font-body text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${isActive
                    ? "bg-[#0D3B2E] text-white shadow-lg"
                    : "text-muted-foreground hover:text-[#0D3B2E] hover:bg-muted/30"
                    }`}
                >
                  <Icon size={14} className={isActive ? "text-[#B48C5E]" : ""} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/50 rounded-2xl bg-white/50"
            >
              <PackageSearch size={48} className="text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-xl text-muted-foreground">No products available</h3>
              <p className="font-body text-sm text-muted-foreground/60 max-w-md mt-1">
                We're currently updating our stock for {activeTab === "new" ? "New Arrivals" : "Best Sellers"}. Please check back soon.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            >
              {displayedItems.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            to={activeTab === "new" ? "/new-arrivals" : "/best-sellers"}
            className="group btn-outline inline-flex items-center gap-3 px-12 py-4 border-[#0D3B2E] text-[#0D3B2E] hover:bg-[#0D3B2E] hover:text-white"
          >
            View All{" "}
            {activeTab === "new" ? "New Arrivals" : "Best Sellers"}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
