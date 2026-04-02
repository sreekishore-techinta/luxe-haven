import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
                        <Link to={slide.button_link || "#"} className="inline-block px-12 py-4 bg-white text-black text-[12px] font-bold uppercase tracking-[3px] hover:bg-[#D4AF37] hover:text-white transition-all shadow-xl">
                            {slide.button_text}
                        </Link>
                    )}
                </div>
            </div>

            {sliders.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/10 bg-black/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"><ChevronLeft size={24}/></button>
                    <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/10 bg-black/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"><ChevronRight size={24}/></button>
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
