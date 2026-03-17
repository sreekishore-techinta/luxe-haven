import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import CategoryHero from "@/components/CategoryHero";
import { SlidersHorizontal, Grid3X3, LayoutGrid, X, Loader2, ArrowLeft } from "lucide-react";

import sareeCollectionRed from "@/assets/saree-collection-red.png";
import blouseHero from "@/assets/blouses-hero-final.png";
import suitHero from "@/assets/kurtha-suit-hero.png";
import defaultHero from "@/assets/new-arrivals-hero-2.jpg";

const API = "http://localhost:8000";

const heroMap: Record<string, string> = {
    "sarees": sareeCollectionRed,
    "blouses": blouseHero,
    "suit-sets": suitHero,
    "kurthas": suitHero,
    "new-arrivals": defaultHero
};

const CategoryPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [products, setProducts] = useState<any[]>([]);
    const [categoryInfo, setCategoryInfo] = useState<{ id: number, name: string, hero_image?: string, description?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [gridCols, setGridCols] = useState<3 | 4>(4);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const res = await fetch(`${API}/public/products_by_category.php?slug=${slug}`);
                const json = await res.json();
                if (json.status === 'success') {
                    setCategoryInfo(json.category);
                    const mapped = json.data.map((p: any) => ({
                        id: String(p.id),
                        name: p.name,
                        price: parseFloat(p.price),
                        discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
                        image: p.image || "",
                        category: json.category.name,
                        description: p.description,
                        fabric: p.fabric,
                        isNew: p.is_new === 1,
                        isBestSeller: p.is_bestseller === 1,
                        status: p.status,
                        inStock: p.status !== "Out of Stock" && (p.stock_qty || 0) > 0,
                    }));
                    setProducts(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryProducts();
    }, [slug]);

    if (!slug) return null;

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <CategoryHero
                title={categoryInfo?.name || slug.replace("-", " ").toUpperCase()}
                description={categoryInfo?.description || `Explore our curated selection of premium ${categoryInfo?.name || slug} crafted for elegance.`}
                backgroundImage={heroMap[slug] || (categoryInfo?.hero_image ? (categoryInfo.hero_image.startsWith('src') ? `/${categoryInfo.hero_image}` : (categoryInfo.hero_image.startsWith('uploads') ? `${API}/../${categoryInfo.hero_image}` : (categoryInfo.hero_image.startsWith('http') ? categoryInfo.hero_image : `/${categoryInfo.hero_image}`))) : defaultHero)}
                imagePosition="center 20%"
                align="left"
            />

            <div id="collection-grid" className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#0D3B2E]/10">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-[#0D3B2E]/5 rounded-full transition-colors text-[#0D3B2E]/60">
                            <ArrowLeft size={20} />
                        </Link>
                        <p className="font-body text-sm text-[#0D3B2E]/60 font-medium">
                            <span className="font-black text-[#0D3B2E]">{products.length}</span> {products.length === 1 ? "Style" : "Styles"} Found
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-1">
                            <button
                                onClick={() => setGridCols(3)}
                                className={`p-2 rounded-lg transition-all ${gridCols === 3 ? "bg-[#0D3B2E] text-white shadow-lg" : "text-[#0D3B2E]/30 hover:bg-[#0D3B2E]/5"}`}
                            >
                                <Grid3X3 size={18} />
                            </button>
                            <button
                                onClick={() => setGridCols(4)}
                                className={`p-2 rounded-lg transition-all ${gridCols === 4 ? "bg-[#0D3B2E] text-white shadow-lg" : "text-[#0D3B2E]/30 hover:bg-[#0D3B2E]/5"}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
                        <Loader2 className="w-12 h-12 text-[#B48C5E] animate-spin" />
                        <p className="font-display text-xl italic text-[#0D3B2E]/60">Bringing your collection to life...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-[#0D3B2E]/5 rounded-full flex items-center justify-center mb-6 text-[#0D3B2E]/20">
                            <X size={40} />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-[#0D3B2E] mb-2">No masterworks found</h3>
                        <p className="font-body text-sm text-[#0D3B2E]/60 mb-8 leading-relaxed">We are currently curating new pieces for this collection. Please check back shortly for our new arrivals.</p>
                        <Link to="/collections" className="btn-gold px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em]">Explore All Collections</Link>
                    </div>
                ) : (
                    <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 lg:gap-8`}>
                        {products.map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
