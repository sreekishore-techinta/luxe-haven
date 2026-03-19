import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import CategoryHero from "@/components/CategoryHero";
import { ArrowLeft, ChevronLeft, ChevronRight, Grid3X3, LayoutGrid } from "lucide-react";
import SkeletonCard from "@/components/SkeletonCard";

const API = "http://localhost/luxe-haven/api";

const SareeSubCategory = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState<any[]>([]);
    const [subcategory, setSubcategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [gridCols, setGridCols] = useState<3 | 4>(4);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const url = new URL(`${API}/public/products_by_subcategory.php`);
                url.searchParams.append("subcategory", slug || "");
                url.searchParams.append("page", String(currentPage));
                url.searchParams.append("per_page", String(itemsPerPage));

                const res = await fetch(url.toString());
                const json = await res.json();
                if (json.status === 'success') {
                    const mapped = json.data.map((p: any) => ({
                        id: String(p.id),
                        name: p.name,
                        price: parseFloat(p.price),
                        discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
                        image: p.image || "",
                        category: "Sarees",
                        description: p.description,
                        fabric: p.fabric,
                        isNew: p.is_new === 1,
                        isBestSeller: p.is_bestseller === 1,
                        status: p.status,
                        inStock: p.status !== "Out of Stock" && (parseInt(p.stock_qty) || 0) > 0,
                    }));
                    setProducts(mapped);
                    setSubcategory(json.subcategory);
                    if (json.total_pages) setTotalPages(json.total_pages);
                }
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
                if (currentPage > 1) {
                    const grid = document.getElementById('collection-grid');
                    if (grid) {
                        const offset = 100; // Offset for header/hero
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = grid.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        };
        fetchProducts();
    }, [slug, currentPage]);

    return (
        <div>
            <CategoryHero
                title={subcategory?.name ? `${subcategory.name} Collection` : ""}
                description={subcategory?.description || `Explore our curated selection of ${subcategory?.name || "premium sarees"}, each piece a masterpiece of elegance and tradition.`}
                backgroundImage={subcategory?.hero_image ? (subcategory.hero_image.startsWith('src') ? `/${subcategory.hero_image}` : (subcategory.hero_image.startsWith('uploads') ? `${API}/../${subcategory.hero_image}` : (subcategory.hero_image.startsWith('http') ? subcategory.hero_image : `/${subcategory.hero_image}`))) : (subcategory?.image ? (subcategory.image.startsWith('src') ? `/${subcategory.image}` : (subcategory.image.startsWith('uploads') ? `${API}/../${subcategory.image}` : (subcategory.image.startsWith('http') ? subcategory.image : `/${subcategory.image}`))) : "")}
                imagePosition="center 20%"
                align="left"
            />

            <div id="collection-grid" className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Link to="/sarees" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-[10px] sm:text-xs uppercase tracking-widest min-h-[44px]">
                            <ArrowLeft size={14} /> Back to All
                        </Link>
                        <p className="font-body text-xs sm:text-sm text-muted-foreground sm:ml-4">
                            {!loading && `${products.length} Items found`}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
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
                    </div>
                </div>

                {loading ? (
                    <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 lg:gap-6`}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} index={i} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="font-display text-xl mb-2">No products found in this category</p>
                        <p className="font-body text-sm text-muted-foreground mb-8">We are currently updating our collection with fresh arrivals.</p>
                        <Link to="/sarees" className="btn-gold px-12">Browse Other Collections</Link>
                    </div>
                ) : (
                    <>
                        <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 lg:gap-6`}>
                            {products.map((product, i) => (
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

export default SareeSubCategory;
