import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import CategoryHero from "@/components/CategoryHero";
import { Grid3X3, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import SkeletonCard from "@/components/SkeletonCard";
import FilterDrawer from "@/components/FilterDrawer";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

import { fabricTypes as fabricFilters } from "@/data/products";


import { API_URL as API } from "@/api_config";

const Collections = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subCategoryParam = searchParams.get("sub");
  const searchParam = searchParams.get("search");

  const [sortBy, setSortBy] = useState("featured");
  const [fabricFilter, setFabricFilter] = useState("All");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API}/public/products.php?page=${currentPage}&per_page=${itemsPerPage}&show_oos=1`;
        
        if (categoryParam && categoryParam !== "All") {
          url += `&category=${encodeURIComponent(categoryParam)}`;
        }

        if (searchParam) {
          url += `&search=${encodeURIComponent(searchParam)}`;
        }

        const res = await fetch(url);
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
            fabric: p.saree_type_name || p.fabric_name || p.fabric || "Premium",
            color: p.colour_name || "",
            sareeType: p.saree_type_name || "",
            blouseStyle: p.blouse_style_name || "",
            isNew: p.is_new === 1 || p.is_new_arrival === 1,
            isBestSeller: p.is_bestseller === 1,
            stock_qty: parseInt(p.stock_qty),
            status: p.status,
            inStock: p.status !== "Out of Stock" && parseInt(p.stock_qty) > 0,
          }));
          setApiProducts(mapped);
          if (json.total_pages) setTotalPages(json.total_pages);
        }

      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
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
    if (fabricFilter !== "All") {
      const searchTerm = fabricFilter.toLowerCase().replace(/ silk| saree/gi, "").trim();
      filtered = filtered.filter((p) => {
        const searchSource = [p.name, p.fabric, p.category, p.sareeType || ""].join(" ").toLowerCase();
        return searchSource.includes(searchTerm);
      });
    }
    return filtered.sort((a, b) => {
      const priceA = a.discount_price || a.price;
      const priceB = b.discount_price || b.price;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "newest") return a.isNew ? -1 : 1;
      return 0;
    });
  }, [sortBy, fabricFilter, apiProducts, categoryParam]);

  return (
    <div className="bg-[#FBFAF7] min-h-screen">
      <CategoryHero
        title="Our Collections"
        description="Explore our curated selection of handcrafted silk sarees, each piece a testament to India's rich textile heritage."
        backgroundImage="https://images.unsplash.com/photo-1583307132230-fa9a0ad1f60a?q=80&w=2070&auto=format&fit=crop"
        pageKey="collections"
      />

      <div className="container mx-auto px-4 lg:px-8 pt-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-px bg-[#D4AF37]/30" />
                  <span className="font-body text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-black">Archive Discovery</span>
               </div>
               <h1 className="font-display text-4xl lg:text-5xl font-black text-[#041E18] tracking-tight">
                  {categoryParam || searchParam ? (
                    <>Showing <span className="italic font-light text-[#D4AF37]">{categoryParam || searchParam}</span> Collection</>
                  ) : (
                    <>The <span className="italic font-light text-[#D4AF37]">Grand Collection</span></>
                  )}
               </h1>
               {(categoryParam || searchParam) && (
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   Explore curated masterpieces specifically selected for you
                 </p>
               )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <FilterDrawer
               isOpen={isFilterOpen}
               onOpen={() => setIsFilterOpen(true)}
               onClose={() => setIsFilterOpen(false)}
               sortBy={sortBy}
               onSortChange={setSortBy}
               fabricFilter={fabricFilter}
               onFabricChange={setFabricFilter}
               resultCount={sorted.length}
             />

             <div className="flex items-center gap-1 bg-[#041E18]/5 p-1 rounded-2xl border border-[#041E18]/5">
                <button 
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded-xl transition-all ${gridCols === 3 ? "bg-white text-[#D4AF37] shadow-md" : "text-[#041E18]/30 hover:text-[#041E18]"}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button 
                   onClick={() => setGridCols(4)}
                   className={`p-2 rounded-xl transition-all ${gridCols === 4 ? "bg-white text-[#D4AF37] shadow-md" : "text-[#041E18]/30 hover:text-[#041E18]"}`}
                >
                  <LayoutGrid size={18} />
                </button>
             </div>
          </div>
        </div>



        {loading ? (
          <div className="space-y-20">
            {[1, 2].map(s => (
              <div key={s} className="space-y-12">
                <div className="w-64 h-12 bg-gray-100 animate-pulse rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div id="collection-grid" className="space-y-24 scroll-mt-24">
            {fabricFilters.filter(f => f !== "All").map(fabricGroup => {
              const searchGroup = fabricGroup.toLowerCase().replace(/ silk| saree/gi, "").trim();
              const productsInGroup = sorted.filter(p => {
                const searchSource = [p.name || "", p.fabric || "", p.category || "", p.sareeType || ""].join(" ").toLowerCase();
                return searchSource.includes(searchGroup);
              });
              if (productsInGroup.length === 0) return null;
              return (
                <section key={fabricGroup} className="relative">
                  <div className="flex items-center gap-8 mb-10 overflow-hidden">
                    <h2 className="font-['Poppins',sans-serif] text-[32px] font-black text-[#041E18] whitespace-nowrap tracking-tight uppercase">
                      {fabricGroup}
                    </h2>
                    <div className="h-[2px] w-full bg-[#D4AF37]/10" />
                    <span className="font-['Inter',sans-serif] text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest whitespace-nowrap bg-white px-6 py-2 rounded-full border border-[#D4AF37]/20 shadow-sm">
                      {productsInGroup.length} Pieces
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-10 lg:gap-16`}>
                    {productsInGroup.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </section>
              );
            })}

            {(() => {
              const shownInGroups = new Set();
              fabricFilters.filter(f => f !== "All").forEach(fabricGroup => {
                const searchGroup = fabricGroup.toLowerCase().replace(/ silk| saree/gi, "").trim();
                sorted.forEach(p => {
                  const searchSource = [p.name, p.fabric, p.category, p.sareeType].join(" ").toLowerCase();
                  if (searchSource.includes(searchGroup)) shownInGroups.add(p.id);
                });
              });
              const otherProducts = sorted.filter(p => !shownInGroups.has(p.id));
              if (otherProducts.length === 0) return null;
              return (
                <section className="relative">
                   <div className="flex items-center gap-8 mb-10 overflow-hidden">
                    <h2 className="font-['Poppins',sans-serif] text-[32px] font-black text-[#041E18] whitespace-nowrap tracking-tight uppercase">
                        {(categoryParam || searchParam) ? `${categoryParam || searchParam} Collection` : "Essential Classics"}
                    </h2>
                    <div className="h-[2px] w-full bg-[#041E18]/5" />
                  </div>
                  <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-10 lg:gap-16`}>
                    {otherProducts.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </section>
              );
            })()}

            {(apiProducts.length === 0 && !loading) && (
              <section className="py-40 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-[1px] bg-[#D4AF37]/30 mb-10" />
                <h2 className="font-display text-4xl font-bold text-slate-400 mb-4 tracking-tight">No Exquisite Pieces found</h2>
                <p className="font-body text-slate-500 max-w-xs mx-auto italic">We are currently curating masterpieces specifically for your selection.</p>
                <Link to="/collections" className="mt-10 px-8 py-4 bg-slate-950 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all">Explore Full Discovery</Link>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
