import { motion } from "framer-motion";

interface PageHeroBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  heightClass?: string;
}

const PageHeroBanner = ({
  title,
  subtitle,
  description,
  backgroundImage,
  imagePosition = "center",
  imageFit = "cover",
  heightClass = "h-[80vh] md:h-[90vh] lg:h-screen"
}: PageHeroBannerProps) => {
  return (
    <section className={`relative w-full ${heightClass} flex items-center overflow-hidden bg-[#0a0a0a]`}>
      {backgroundImage && (
        <div className="absolute inset-0">
          <div 
            className={`absolute inset-0 bg-${imageFit} bg-no-repeat bg-[center_top] md:bg-[center_30%] transition-all duration-1000 ease-out`}
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover"
            }}
          />
          {/* Gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 lg:bg-gradient-to-r lg:from-black/60 lg:via-black/10 lg:to-transparent" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 lg:px-20 h-full flex items-center justify-center lg:justify-start">
        <div className="max-w-[620px] text-center lg:text-left">
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="font-body text-xs lg:text-[12px] tracking-[0.6em] uppercase text-white/70 mb-8 [text-shadow:_0_2px_10px_rgba(0,0,0,0.35)] font-semibold"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-8 [text-shadow:_0_6px_20px_rgba(0,0,0,0.45)] leading-[1.05]"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-body text-base lg:text-[20px] text-white/95 font-medium leading-[1.6] max-w-lg [text-shadow:_0_2px_10px_rgba(0,0,0,0.4)]"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHeroBanner;
