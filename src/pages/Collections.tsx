import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import CategoryHero from "@/components/CategoryHero";
import { SlidersHorizontal, Grid3X3, LayoutGrid, X, ChevronLeft, ChevronRight } from "lucide-react";
import SkeletonCard from "@/components/SkeletonCard";
import newCollectionsHero from "@/assets/new-collections-hero.jpg";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

const fabricFilters = [
  "All", "Pure Silk", "Banarasi Silk", "Kanjivaram Silk",
  "Mysore Silk", "Patola Silk", "Chanderi Silk", "Tussar Silk"
];

import { API_URL as API } from "@/api_config";

const Collections = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subCategoryParam = searchParams.get("sub");

  const [sortBy, setSortBy] = useState("featured");
  const [fabricFilter, setFabricFilter] = useState("All");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = new URL(`${API}/public/products.php`);
        url.searchParams.append("page", String(currentPage));
        url.searchParams.append("per_page", String(itemsPerPage));
        url.searchParams.append("show_oos", "1");
        
        // Use category param if it exists and isn't "All"
        if (categoryParam && categoryParam !== "All") {
          url.searchParams.append("category", categoryParam);
        }

        const res = await fetch(url.toString());
        const json = await res.json();

        if (json.status === 'success') {
          const mapped = json.data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: parseFloat(p.price),
            discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
            image: p.image || "",
            category: p.category_name || "General",
            description: p.description,
            fabric: p.fabric_name || p.fabric || "Premium Quality",
            color: p.colour_name || "",
            sareeType: p.saree_type_name || "",
            blouseStyle: p.blouse_style_name || "",
            isNew: p.is_new === 1,
            isBestSeller: p.is_bestseller === 1,
            stock_qty: parseInt(p.stock_qty),
            status: p.status,
            inStock: p.status !== "Out of Stock",
          }));
          setApiProducts(mapped);
          if (json.total_pages) setTotalPages(json.total_pages);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
        // Scroll to grid top after fetch
        if (currentPage > 1) {
          const grid = document.getElementById('collection-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    fetchProducts();
  }, [categoryParam, currentPage]);

  const sorted = useMemo(() => {
    let filtered = [...apiProducts];

    // Category Filter from URL
    if (categoryParam && categoryParam !== "All") {
      filtered = filtered.filter(p => 
        p.category.toLowerCase().includes(categoryParam.toLowerCase()) ||
        categoryParam.toLowerCase().includes(p.category.toLowerCase())
      );
    }

    // Fabric Filter from UI
    if (fabricFilter !== "All") {
      filtered = filtered.filter((p) => 
        p.fabric.toLowerCase().includes(fabricFilter.toLowerCase().replace(" silk", "").trim())
      );
    }

    return filtered.sort((a, b) => {
      const priceA = a.discount_price || a.price;
      const priceB = b.discount_price || b.price;

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "newest") return a.isNew ? -1 : 1;
      return 0; // Featured / Default
    });
  }, [sortBy, fabricFilter, apiProducts, categoryParam]);

  return (
    <div className="bg-[#FBFAF7] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="font-['Poppins',sans-serif] text-[48px] font-black text-[#041E18] leading-[1.1] mb-6 tracking-tight">Our Collections</h1>
          <p className="font-['Inter',sans-serif] text-sm text-gray-500 leading-relaxed italic">
            Explore our curated selection of handcrafted silk sarees, each piece a testament to India's rich textile heritage.
          </p>
        </header>

        {loading ? (
          <div className="space-y-20">
            {[1, 2].map(s => (
              <div key={s} className="space-y-8">
                <div className="w-48 h-10 bg-gray-100 animate-pulse rounded-xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-24">
            {fabricFilters.filter(f => f !== "All").map(fabricGroup => {
              const productsInGroup = apiProducts.filter(p => 
                p.fabric.toLowerCase().includes(fabricGroup.toLowerCase().replace(" silk", "").trim())
              );

              if (productsInGroup.length === 0) return null;

              return (
                <section key={fabricGroup} className="relative">
                  <div className="flex items-center gap-8 mb-10 overflow-hidden">
                    <h2 className="font-['Poppins',sans-serif] text-[32px] font-black text-[#041E18] whitespace-nowrap tracking-tight uppercase">
                      {fabricGroup}
                    </h2>
                    <div className="h-[2px] w-full bg-[#D4AF37]/10" />
                    <span className="font-['Inter',sans-serif] text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest whitespace-nowrap bg-white px-6 py-2 rounded-full border border-[#D4AF37]/20 shadow-sm">
                      {productsInGroup.length} Exquisite Pieces
                    </span>
                  </div>

                  <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 lg:gap-8`}>
                    {productsInGroup.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Handle products that don't match standard silken fabrics if any */}
            {(() => {
              const standardFabrics = fabricFilters.filter(f => f !== "All").map(f => f.toLowerCase().replace(" silk", "").trim());
              const otherProducts = apiProducts.filter(p => 
                !standardFabrics.some(sf => p.fabric.toLowerCase().includes(sf))
              );

              if (otherProducts.length === 0) return null;

              return (
                <section className="relative">
                   <div className="flex items-center gap-8 mb-10 overflow-hidden">
                    <h2 className="font-['Poppins',sans-serif] text-[32px] font-black text-[#041E18] whitespace-nowrap tracking-tight uppercase">Other Classics</h2>
                    <div className="h-[2px] w-full bg-[#041E18]/5" />
                  </div>
                  <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 lg:gap-8`}>
                    {otherProducts.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </section>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
