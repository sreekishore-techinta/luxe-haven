import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import PageHeroBanner from "@/components/PageHeroBanner";
import { products } from "@/data/products";
import { Star, Loader2 } from "lucide-react";
import bestSellersHero from "@/assets/new-collections-hero.jpg";

const API = "http://localhost:8000";

const BestSellers = () => {
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/public/products.php?is_bestseller=1&per_page=100`);
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
            status: p.status,
            inStock: p.status !== "Out of Stock" && parseInt(p.stock_qty) > 0,
          }));
          setApiProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch best sellers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBest();
  }, []);

  const displayProducts = useMemo(() => {
    const combined = [...apiProducts];
    products.filter(p => p.isBestSeller).forEach(sp => {
      if (!combined.find(p => p.name === sp.name)) combined.push(sp);
    });
    return combined;
  }, [apiProducts]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-accent" size={48} />
      <p className="font-display text-xl italic text-accent/60">Gathering our most loved silks...</p>
    </div>
  );

  return (
    <div>
      <PageHeroBanner
        title="Best Sellers"
        subtitle="Most Loved"
        description="Our patrons' favorites — the sarees that have won hearts across the country for their quality, beauty, and timeless appeal."
        backgroundImage={bestSellersHero}
        imagePosition="center top"
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
