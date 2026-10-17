import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { API_URL as API, BASE_URL } from "@/api_config";

interface WebSlider {
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    button_text: string | null;
    button_link: string | null;
    image_url: string;
    logo_url?: string | null;
}

interface PageHeroBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  heightClass?: string;
  pageKey?: string; // Manual override
}

const PageHeroBanner = ({
  title: fallbackTitle,
  subtitle: fallbackSubtitle,
  description: fallbackDescription,
  backgroundImage: fallbackImage,
  imagePosition = "center 30%",
  imageFit = "cover",
  heightClass = "h-[80vh] md:h-[90vh] lg:h-screen",
  pageKey: manualKey
}: PageHeroBannerProps) => {
  const [sliders, setSliders] = useState<WebSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const location = useLocation();
  const params = useParams();

  const getPageKey = () => {
    if (manualKey) return manualKey.toLowerCase();
    const path = location.pathname;
    if (path === "/" || path === "") return "home";
    if (params.slug) return params.slug.toLowerCase();
    const segment = path.split('/').filter(Boolean).pop();
    if (segment) return segment.toLowerCase();
    return "home";
  };

  const activePageKey = getPageKey();

  useEffect(() => {
    const fetchSliders = async () => {
        try {
            const res = await fetch(`${API}/web_sliders/get_active.php?page=${activePageKey}`);
            const json = await res.json();
            if (json.status === "success" && json.data && json.data.length > 0) {
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

const getImageSrc = (url: string) => url.startsWith('http') ? url : `${BASE_URL}${url}`;

// Standardized height for all hero banners
const standardHeight = "relative w-full h-[80vh] md:h-[90vh] lg:h-screen overflow-hidden flex items-center bg-[#0a0a0a]";

if (loading) {
  return (
      <div className={standardHeight}>
         <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
         </div>
      </div>
  );
}

// Render dynamic slider if available
if (sliders.length > 0) {
    const slide = sliders[currentIndex];
    return (
        <section className={standardHeight + " group"}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-1000"
                        style={{
                            backgroundImage: `url(${getImageSrc(slide.image_url)})`,
                            backgroundPosition: "center 30%"
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 container mx-auto px-4 lg:px-20 h-full flex items-center justify-center lg:justify-start">
                <div className="max-w-[720px] text-center lg:text-left">
                    {slide.logo_url && (
                        <motion.div
                            initial={{ opacity: 0, y: -15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="mb-6 flex justify-center lg:justify-start"
                        >
                            <img
                                src={getImageSrc(slide.logo_url)}
                                alt="Brand Logo"
                                className="max-h-14 md:max-h-20 w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)] filter brightness-105"
                            />
                        </motion.div>
                    )}
                    {slide.subtitle && (
                        <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-body text-xs lg:text-[12px] tracking-[0.6em] uppercase text-white/70 mb-8 font-semibold">
                            {slide.subtitle}
                        </motion.p>
                    )}
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-8 leading-[1.1] [text-shadow:_0_6px_20px_rgba(0,0,0,0.4)]">
                        {slide.title}
                    </motion.h1>
                    {slide.description && (
                         <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-body text-base lg:text-[20px] text-white/95 leading-[1.6] max-w-lg mb-10">
                            {slide.description}
                        </motion.p>
                    )}
                    {slide.button_text && (
                        <Link 
                            to={slide.button_link || "#"} 
                            className="inline-flex items-center justify-center gap-3 px-10 py-3.5 sm:px-12 sm:py-4 bg-white/95 hover:bg-white text-[#1A1A1A] hover:text-[#B48C5E] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.25em] rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_18px_40px_rgba(180,140,94,0.45)] hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-white/60 backdrop-blur-sm group"
                        >
                            <span>{slide.button_text}</span>
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </div>
            </div>

            {sliders.length > 1 && (
                <>
                    <button 
                        onClick={prevSlide} 
                        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 bg-black/10 text-white flex items-center justify-center transition-all backdrop-blur-md z-30 group/btn"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={28} className="transition-transform group-hover/btn:-translate-x-1" />
                    </button>
                    <button 
                        onClick={nextSlide} 
                        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 bg-black/10 text-white flex items-center justify-center transition-all backdrop-blur-md z-30 group/btn"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={28} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                </>
            )}
        </section>
    );
}

// Fallback to original static content
return (
  <section className={standardHeight}>
    {fallbackImage && (
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: `url(${fallbackImage})`,
            backgroundPosition: imagePosition
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      </div>
    )}

    <div className="relative z-10 container mx-auto px-4 lg:px-20 h-full flex items-center justify-center lg:justify-start">
      <div className="max-w-[720px] text-center lg:text-left">
        {fallbackSubtitle && (
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-body text-xs lg:text-[12px] tracking-[0.6em] uppercase text-white/70 mb-8 font-semibold">
            {fallbackSubtitle}
          </motion.p>
        )}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-8 leading-[1.1] [text-shadow:_0_6px_20px_rgba(0,0,0,0.45)]">
          {fallbackTitle}
        </motion.h1>
        {fallbackDescription && (
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-body text-base lg:text-[20px] text-white/95 leading-[1.6] max-w-lg">
            {fallbackDescription}
          </motion.p>
        )}
      </div>
    </div>
  </section>
);
};

export default PageHeroBanner;
