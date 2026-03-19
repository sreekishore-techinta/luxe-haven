import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import CategoryHero from "@/components/CategoryHero";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import SkeletonCard from "@/components/SkeletonCard";
import bestSellersHero from "@/assets/new-collections-hero.jpg";

const API = "http://localhost/luxe-haven/api";

const BestSellers = () => {
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchBest = async () => {
      setLoading(true);
      try {
        const url = new URL(`${API}/public/products.php`);
        url.searchParams.append("is_bestseller", "1");
        url.searchParams.append("page", String(currentPage));
        url.searchParams.append("per_page", String(itemsPerPage));
        url.searchParams.append("show_oos", "1");

        const res = await fetch(url.toString());
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
            isBestSeller: p.is_bestseller === 1,
            status: p.status,
            inStock: p.status !== "Out of Stock",
          }));
          setApiProducts(mapped);
          if (json.total_pages) setTotalPages(json.total_pages);
        }
      } catch (err) {
        console.error("Failed to fetch best sellers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBest();
  }, [currentPage]);

  const displayProducts = useMemo(() => {
    return apiProducts;
  }, [apiProducts]);

  return (
    <div>
      <CategoryHero
        title="Best Sellers"
        description="Our patrons' favorites — the sarees that have won hearts across the country for their quality, beauty, and timeless appeal."
        backgroundImage={bestSellersHero}
        imagePosition="center 20%"
        align="left"
      />

      <div id="collection-grid" className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
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

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h3 className="font-display text-xl mb-2">No best sellers found</h3>
            <p className="font-body text-sm text-muted-foreground">We're updating our collection. Please check back soon.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {displayProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-12 h-12 flex items-center justify-center border border-border rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground hover:text-background transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-12 h-12 rounded-full font-body text-sm transition-all ${currentPage === i + 1
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-12 h-12 flex items-center justify-center border border-border rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground hover:text-background transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BestSellers;
