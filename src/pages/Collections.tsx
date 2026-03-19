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

const API = "http://localhost/luxe-haven/api";

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
    <div>
      <CategoryHero
        title={categoryParam && categoryParam !== "All" ? categoryParam : "Our Collections"}
        description="Explore our curated selection of handcrafted silk sarees, each piece a testament to India's rich textile heritage."
        backgroundImage="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop"
        imagePosition="center 20%"
        align="left"
      />

      <div id="collection-grid" className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
        {/* Fabric Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {fabricFilters.map((f) => (
            <button
              key={f}
              onClick={() => { setFabricFilter(f); setCurrentPage(1); }}
              className={`font-body text-[10px] uppercase tracking-[0.2em] px-6 py-3 border transition-all duration-300 min-h-[44px] ${fabricFilter === f
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
          <p className="font-body text-xs sm:text-sm text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "Product" : "Products"} found
          </p>
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setGridCols(3)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${gridCols === 3 ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${gridCols === 4 ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-6 h-8">
              <SlidersHorizontal size={14} className="text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-body text-xs sm:text-sm bg-transparent border-none text-foreground focus:outline-none cursor-pointer appearance-none pr-4"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 lg:gap-6`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl mb-2">No products found</p>
            <p className="font-body text-sm text-muted-foreground mb-4">Try a different filter</p>
            <button onClick={() => { setFabricFilter("All"); setSortBy("featured"); }} className="btn-outline text-xs inline-flex items-center gap-2">
              <X size={12} /> Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 lg:gap-6`}>
              {sorted.map((product, i) => (
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
      </div >
    </div >
  );
};

export default Collections;
