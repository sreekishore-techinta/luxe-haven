import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CategoryHero from "@/components/CategoryHero";
import { Loader2, Camera } from "lucide-react";

const API_NODE = "http://localhost:5000/api/blouse";
const UPLOADS_NODE = "http://localhost:5000";

interface BlouseStyle {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
}

const DesignerBlouseStyles = () => {
    const [styles, setStyles] = useState<BlouseStyle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStyles();
    }, []);

    const fetchStyles = async () => {
        try {
            const res = await fetch(API_NODE);
            const json = await res.json();
            if (json.status === "success") {
                setStyles(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch blouse styles:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price);

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <CategoryHero
                title="Designer Blouse Styles"
                description="Elegant handcrafted blouse styles for every occasion, tailored to perfection."
                backgroundImage="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop"
                imagePosition="center 20%"
                align="left"
            />

            <div id="collection-grid" className="container mx-auto px-4 lg:px-8 py-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="font-display text-3xl font-bold text-[#0D3B2E] mb-2">Couture Collection</h2>
                        <p className="font-body text-sm text-[#0D3B2E]/60 tracking-wider uppercase">Member of our exclusive design house</p>
                    </div>
                    <div className="h-[1px] flex-1 bg-[#0D3B2E]/10" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
                        <Loader2 className="w-12 h-12 text-[#B48C5E] animate-spin" />
                        <p className="font-display text-xl italic text-[#0D3B2E]/60">Bringing your collection to life...</p>
                    </div>
                ) : styles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
                        <div className="w-24 h-24 bg-[#0D3B2E]/5 rounded-full flex items-center justify-center mb-8 text-[#0D3B2E]/10">
                            <Camera size={48} />
                        </div>
                        <h3 className="font-display text-4xl font-bold text-[#0D3B2E] mb-4">No Styles Found</h3>
                        <p className="font-body text-lg text-[#0D3B2E]/60 leading-relaxed">
                            We are currently curating new pieces for this collection.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {styles.map((style, index) => (
                            <motion.div
                                key={style.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative"
                            >
                                <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-6 shadow-2xl transition-transform duration-700 group-hover:-translate-y-2">
                                    <img
                                        src={style.image.startsWith("http") ? style.image : `${UPLOADS_NODE}/${style.image}`}
                                        alt={style.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0D3B2E]">
                                        {style.category}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="font-display text-xl font-bold text-[#0D3B2E] tracking-tight group-hover:text-[#B48C5E] transition-colors">
                                            {style.name}
                                        </h3>
                                        <span className="font-body text-sm font-black text-[#B48C5E]">
                                            {formatPrice(style.price)}
                                        </span>
                                    </div>
                                    <p className="font-body text-sm text-[#0D3B2E]/60 leading-relaxed line-clamp-2 italic">
                                        {style.description}
                                    </p>
                                    <div className="pt-4 overflow-hidden">
                                        <button className="w-full py-4 bg-[#0D3B2E] text-white text-[10px] uppercase font-black tracking-[0.3em] transition-all duration-500 relative translate-y-[100%] group-hover:translate-y-0">
                                            Reserve This Style
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignerBlouseStyles;
