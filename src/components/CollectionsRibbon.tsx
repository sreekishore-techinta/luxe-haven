import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, SlidersHorizontal, Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import { fabricTypes } from "@/data/products";

const SHOW_PER_PAGE = 8;
const API = "http://localhost:8000";

const CollectionsRibbon = () => {
    const [activeTab, setActiveTab] = useState("All");
    const [showAll, setShowAll] = useState(false);
    const [apiProducts, setApiProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const tabsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
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
                        isBestSeller: p.is_bestseller === 1,
                        stock_qty: parseInt(p.stock_qty),
                        status: p.status,
                        inStock: p.status !== "Out of Stock" && (parseInt(p.stock_qty) || 0) > 0,
                    }));
                    setApiProducts(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch products for ribbon", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filtered = useMemo(() => {
        return activeTab === "All"
            ? apiProducts
            : apiProducts.filter((p) => p.fabric === activeTab);
    }, [activeTab, apiProducts]);

    const displayed = showAll ? filtered : filtered.slice(0, SHOW_PER_PAGE);

    const scrollTabs = (dir: "left" | "right") => {
        if (tabsRef.current) {
            tabsRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setShowAll(false);
    };

    return (
        <section className="py-20 lg:py-28 bg-[#FDFBF7] border-y border-border">
            <div className="container mx-auto px-4 lg:px-8">

                {/* ── Section Header ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-px bg-accent" />
                            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">
                                Browse By Fabric
                            </span>
                        </div>
                        <h2 className="font-display text-3xl lg:text-4xl font-semibold leading-tight">
                            Our{" "}
                            <span className="italic font-light text-accent">Collections</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <SlidersHorizontal size={14} />
                        <span className="font-body text-xs tracking-wide">
                            {filtered.length} styles available
                        </span>
                    </div>
                </motion.div>

                {/* ── Filter Tabs Row ──────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="relative flex items-center gap-2 mb-10"
                >
                    {/* Scroll left */}
                    <button
                        onClick={() => scrollTabs("left")}
                        className="shrink-0 w-8 h-8 flex items-center justify-center border border-border bg-background hover:border-accent hover:text-accent transition-colors duration-200 rounded-sm lg:hidden"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={15} />
                    </button>

                    {/* Tabs */}
                    <div
                        ref={tabsRef}
                        className="flex items-center gap-2 overflow-x-auto flex-1"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {fabricTypes.map((tab, i) => {
                            const isActive = activeTab === tab;
                            return (
                                <motion.button
                                    key={tab}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={() => handleTabChange(tab)}
                                    className={`
                    shrink-0 px-5 py-2.5 font-body text-[11px] tracking-[0.25em] uppercase transition-all duration-300 whitespace-nowrap border
                    ${isActive
                                            ? "bg-foreground text-background border-foreground shadow-md"
                                            : "bg-background text-muted-foreground border-border hover:border-accent/60 hover:text-foreground hover:bg-accent/5"
                                        }
                  `}
                                >
                                    {tab}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Scroll right */}
                    <button
                        onClick={() => scrollTabs("right")}
                        className="shrink-0 w-8 h-8 flex items-center justify-center border border-border bg-background hover:border-accent hover:text-accent transition-colors duration-200 rounded-sm lg:hidden"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={15} />
                    </button>
                </motion.div>

                {/* ── Active Tab Pill (desktop label) ─────────────────────── */}
                {activeTab !== "All" && (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <span className="font-body text-xs text-muted-foreground">Viewing:</span>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 text-accent font-body text-[11px] tracking-[0.2em] uppercase rounded-sm">
                            {activeTab}
                            <button
                                onClick={() => setActiveTab("All")}
                                className="text-accent/60 hover:text-accent ml-1 font-bold transition-colors"
                                aria-label="Clear filter"
                            >
                                ×
                            </button>
                        </span>
                    </motion.div>
                )}

                {/* ── Products Grid ────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab + "-grid"}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
                    >
                        {displayed.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <p className="font-display text-lg text-muted-foreground italic">
                                    No products found for this category.
                                </p>
                            </div>
                        ) : (
                            displayed.map((product, i) => (
                                <ProductCard key={product.id} product={product} index={i} />
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* ── Load More / View All ─────────────────────────────────── */}
                {filtered.length > SHOW_PER_PAGE && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        {!showAll ? (
                            <>
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="btn-outline group"
                                >
                                    Load More ({filtered.length - SHOW_PER_PAGE} remaining)
                                    <ChevronRight
                                        size={14}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </button>
                                <Link
                                    to="/collections"
                                    className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                                >
                                    View All Collections <ArrowRight size={12} />
                                </Link>
                            </>
                        ) : (
                            <Link to="/collections" className="btn-gold group">
                                Shop Full Collection
                                <ArrowRight
                                    size={14}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </Link>
                        )}
                    </motion.div>
                )}

                {filtered.length <= SHOW_PER_PAGE && filtered.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-12 text-center"
                    >
                        <Link to="/collections" className="btn-outline group">
                            View All{activeTab !== "All" ? ` ${activeTab}` : ""} Collections
                            <ArrowRight
                                size={14}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default CollectionsRibbon;
