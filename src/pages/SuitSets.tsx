import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import PageHeroBanner from "@/components/PageHeroBanner";
import { products } from "@/data/products";
import { SlidersHorizontal, Grid3X3, LayoutGrid, X, Loader2 } from "lucide-react";
import suitSetsHero from "@/assets/kurtha-suit-hero.png";

const API = "http://localhost:8000";

const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Newest", value: "newest" },
];

const fabricFilters = ["All", "Art Silk", "Chanderi", "Cotton", "Georgette"];

const SuitSets = () => {
    const [sortBy, setSortBy] = useState("featured");
    const [fabricFilter, setFabricFilter] = useState("All");
    const [gridCols, setGridCols] = useState<3 | 4>(4);
    const [apiProducts, setApiProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuits = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/public/products.php?category=Suit Sets&per_page=100`);
                const json = await res.json();
                if (json.status === 'success') {
                    const mapped = json.data.map((p: any) => ({
                        id: String(p.id),
                        name: p.name,
                        price: parseFloat(p.price),
                        discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
                        image: p.image_url || "",
                        category: "Suit Sets",
                        description: p.description,
                        fabric: p.fabric,
                        isNew: p.is_new === 1,
                        isBestSeller: p.is_bestseller === 1,
                        status: p.status,
                        inStock: p.status !== "Out of Stock" && (p.stock_qty || 0) > 0,
                    }));
                    setApiProducts(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch suit sets", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSuits();
    }, []);

    const sorted = useMemo(() => {
        const combined = [...apiProducts];
        products.filter(p => p.category === "Suit Sets").forEach(sp => {
            if (!combined.find(p => p.name === sp.name)) combined.push(sp);
        });

        let filtered = combined;

        if (fabricFilter !== "All") {
            filtered = filtered.filter((p) => p.fabric === fabricFilter);
        }

        return filtered.sort((a, b) => {
            if (sortBy === "price-asc") return a.price - b.price;
            if (sortBy === "price-desc") return b.price - a.price;
            if (sortBy === "newest") return a.isNew ? -1 : 1;
            return 0;
        });
    }, [sortBy, fabricFilter, apiProducts]);

    return (
        <div>
            <PageHeroBanner
                title="Kurtha & Suit Sets"
                subtitle="Regal Silhouettes"
                description="Experience luxury with our hand-crafted, beautifully tailored Kurtha and Suit Sets designed for timeless elegance."
                backgroundImage={suitSetsHero}
                imagePosition="center top"
                imageFit="cover"
                heightClass="h-[100dvh]"
            />

            <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
                {/* Fabric Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {fabricFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFabricFilter(f)}
                            className={`font-body text-xs uppercase tracking-[0.15em] px-5 py-2 border transition-all duration-300 ${fabricFilter === f
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
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
                        <Loader2 className="w-12 h-12 text-[#B48C5E] animate-spin" />
                        <p className="font-display text-lg italic text-[#0D3B2E]/60">Tailoring your royal silhouettes...</p>
                    </div>
                ) : sorted.length === 0 ? (
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

export default SuitSets;
