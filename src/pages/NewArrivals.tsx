import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import CategoryHero from "@/components/CategoryHero";
import newArrivalsBanner from "@/assets/new-arrivals-banner.png";
import SkeletonCard from "@/components/SkeletonCard";

const API = "http://localhost/luxe-haven/api";

const NewArrivals = () => {
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNew = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/public/products.php?is_new=1&per_page=100&show_oos=1`);
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
        }
      } catch (err) {
        console.error("Failed to fetch new arrivals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNew();
  }, []);

  const displayProducts = useMemo(() => {
    return apiProducts;
  }, [apiProducts]);

  return (
    <div>
      <CategoryHero
        title="New Arrivals"
        description="Fresh from our master artisans' looms. Experience the latest in luxury silk weaving and contemporary heritage designs."
        backgroundImage={newArrivalsBanner}
        imagePosition="center 20%"
        align="left"
      />

      <div id="collection-grid" className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h3 className="font-display text-xl mb-2">No new arrivals found</h3>
            <p className="font-body text-sm text-muted-foreground">We're updating our collection. Please check back soon.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {displayProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
