import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CategoryHero from "@/components/CategoryHero";
import { ArrowRight } from "lucide-react";
import sareeCollectionRed from "@/assets/saree-collection-red.png";

const API = "http://localhost/luxe-haven/api";

const Sarees = () => {
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubcategories = async () => {
            try {
                const res = await fetch(`${API}/public/saree_types.php`);
                const json = await res.json();
                if (json.status === 'success') {
                    setSubcategories(json.data);
                }
            } catch (err) {
                console.error("Failed to fetch saree subcategories", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubcategories();
    }, []);

    return (
        <div>
            <CategoryHero
                title="Saree Collections"
                description="Discover our diverse range of handcrafted sarees, from traditional weaves to contemporary designer pieces."
                backgroundImage={sareeCollectionRed}
                imagePosition="center 20%"
                align="left"
            />

            <div id="collection-grid" className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded lg:rounded-xl shadow-sm" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {subcategories.map((sub, i) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    to={`/sarees/${sub.slug}`}
                                    className="group block relative overflow-hidden bg-card rounded lg:rounded-xl shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="aspect-[3/4] overflow-hidden bg-slate-50">
                                        <img
                                            src={
                                                sub.image.startsWith('http')
                                                    ? (sub.image.includes('localhost/') && !sub.image.includes('localhost/luxe-haven/') ? sub.image.replace('localhost/', 'localhost/luxe-haven/') : sub.image)
                                                    : (sub.image.startsWith('src') || sub.image.startsWith('uploads') ? `/${sub.image}` : `/${sub.image}`)
                                            }
                                            alt={sub.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800'; // Fallback to a silk saree image
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute bottom-0 left-0 w-full p-6 transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                                        <h3 className="font-display text-xl lg:text-2xl font-semibold text-white mb-2">{sub.name}</h3>
                                        <div className="flex items-center gap-2 text-gold-light font-body text-[10px] uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">
                                            Explore Collection
                                            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sarees;
