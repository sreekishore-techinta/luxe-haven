import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL as API, BASE_URL } from "@/api_config";

interface WebSlider {
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    button_text: string | null;
    button_link: string | null;
    image_url: string;
}

const DynamicHero = ({ pageName }: { pageName?: string }) => {
    const [sliders, setSliders] = useState<WebSlider[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const location = useLocation();
    const params = useParams();

    // Determine the page key for the API
    const getPageKey = () => {
        if (pageName) return pageName.toLowerCase();
        
        const path = location.pathname;
        if (path === "/" || path === "") return "home";
        
        // Handle categorized routes /category/:slug or /sarees/:slug
        if (params.slug) return params.slug.toLowerCase();
        
        // Handle other static routes /new-arrivals -> new-arrivals
        const segment = path.split('/').filter(Boolean).pop();
        if (segment) {
            // Special cases for mapping
            if (segment === "account") return "my_account";
            return segment.toLowerCase();
        }
        
        return "home";
    };

    const activePageKey = getPageKey();

    useEffect(() => {
        const fetchSliders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/web_sliders/get_active.php?page=${activePageKey}`);
                const json = await res.json();
                if (json.status === "success" && json.data) {
                    setSliders(json.data);
                }
            } catch (err) {
                console.error("Failed to fetch sliders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSliders();
    }, [activePageKey]);

    // Auto-advance logic
    useEffect(() => {
        if (sliders.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % sliders.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [sliders.length]);

    const prevSlide = () => setCurrentIndex(i => (i === 0 ? sliders.length - 1 : i - 1));
    const nextSlide = () => setCurrentIndex(i => (i + 1) % sliders.length);

    const getImageSrc = (url: string) =>
        url.startsWith('http') ? url : `${BASE_URL}${url}`;

    // Fallback content if no sliders found for this page
    if (!loading && sliders.length === 0) {
        return (
            <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center overflow-hidden bg-[#1a1a1a]">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1610030469983-98e54724a912?q=80&w=2000')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
                <div className="relative z-10 container mx-auto px-6 lg:px-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase tracking-tight">
                            {activePageKey.replace(/[-_]/g, ' ')}
                        </h1>
                        <p className="text-white/60 text-lg font-body max-w-lg mb-8">
                            Discover our exclusive collection curated specifically for your style and heritage.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-[80vh] md:h-[90vh] lg:h-screen flex items-center justify-center bg-[#0a0a0a]">
               <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    const slide = sliders[currentIndex];

    return (
        <section className="relative w-full h-[80vh] md:h-[90vh] lg:h-screen flex items-center overflow-hidden bg-[#0a0a0a] group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <div
                        className="absolute inset-0 bg-no-repeat transition-all duration-1000"
                        style={{
                            backgroundImage: `url(${getImageSrc(slide.image_url)})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center 30%"
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/20 lg:to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 container mx-auto px-6 lg:px-20 h-full flex items-center">
                <div className="max-w-3xl text-center lg:text-left mx-auto lg:mx-0">
                    {slide.subtitle && (
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="font-body text-xs lg:text-sm tracking-[0.5em] uppercase text-[#D4AF37] mb-6 font-bold"
                        >
                            {slide.subtitle}
                        </motion.p>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter"
                    >
                        {slide.title.includes(' ') ? (
                            <>
                                <span className="block opacity-90">{slide.title.split(' ').slice(0, -1).join(' ')}</span>
                                <span className="italic font-light text-[#D4AF37] block mt-2 md:mt-4">
                                    {slide.title.split(' ').pop()}
                                </span>
                            </>
                        ) : (
                            slide.title
                        )}
                    </motion.h1>


                    {slide.description && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="font-body text-base lg:text-xl text-white/80 font-medium leading-relaxed max-w-xl mb-10"
                        >
                            {slide.description}
                        </motion.p>
                    )}

                    {slide.button_text && slide.button_link && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Link
                                to={slide.button_link}
                                className="inline-block px-12 py-4 bg-[#B8960C] text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-2xl"
                            >
                                {slide.button_text}
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>

            {sliders.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 z-20">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 z-20">
                        <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                        {sliders.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-[#D4AF37]' : 'w-4 bg-white/30 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default DynamicHero;
