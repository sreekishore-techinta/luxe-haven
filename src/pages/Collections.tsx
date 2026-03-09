import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import PageHeroBanner from "@/components/PageHeroBanner";
import { products } from "@/data/products";
import { SlidersHorizontal, Grid3X3, LayoutGrid, X } from "lucide-react";
import categorySarees from "@/assets/category-sarees.jpg";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

const fabricFilters = ["All", "Pure Silk", "Banarasi Silk", "Kanjivaram Silk", "Mysore Silk", "Patola Silk"];

const Collections = () => {
  const [sortBy, setSortBy] = useState("featured");
  const [fabricFilter, setFabricFilter] = useState("All");
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const sorted = useMemo(() => {
    let filtered = fabricFilter === "All"
      ? [...products]
      : products.filter((p) => p.fabric === fabricFilter);

    return filtered.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "newest") return a.isNew ? -1 : 1;
      return 0;
    });
  }, [sortBy, fabricFilter]);

  return (
    <div>
      <PageHeroBanner
        title="Our Collections"
        subtitle="Discover"
        description="Explore our curated selection of handcrafted silk sarees, each piece a testament to India's rich textile heritage."
        backgroundImage={categorySarees}
      />

      <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
        {/* Fabric Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {fabricFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFabricFilter(f)}
              className={`font-body text-xs uppercase tracking-[0.15em] px-5 py-2 border transition-all duration-300 ${
                fabricFilter === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <p className="font-body text-sm text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "Product" : "Products"}
          </p>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 transition-colors ${gridCols === 3 ? "text-foreground" : "text-muted-foreground/40"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 transition-colors ${gridCols === 4 ? "text-foreground" : "text-muted-foreground/40"}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-body text-sm bg-transparent border-none text-foreground focus:outline-none cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl mb-2">No products found</p>
            <p className="font-body text-sm text-muted-foreground mb-4">Try a different filter</p>
            <button onClick={() => setFabricFilter("All")} className="btn-outline text-xs">
              <X size={12} /> Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 lg:gap-6`}>
            {sorted.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
