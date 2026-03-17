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
  imagePosition = "center 20%",
  imageFit = "cover",
  heightClass = "h-[80vh] md:h-[90vh] lg:h-screen"
}: PageHeroBannerProps) => {
  return (
    <section className={`relative w-full ${heightClass} flex items-center overflow-hidden bg-[#0a0a0a]`}>
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt={title}
            className={`w-full h-full object-${imageFit}`}
            style={{ objectPosition: imagePosition }}
            loading="eager"
          />
          {/* Gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/20 lg:to-transparent" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 lg:px-20 h-full flex items-end lg:items-center justify-center lg:justify-start pb-24 lg:pb-0">
        <div className="max-w-[520px] text-center lg:text-left">
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-body text-xs lg:text-[11px] tracking-[0.5em] uppercase text-white/70 mb-6 [text-shadow:_0_2px_10px_rgba(0,0,0,0.35)]"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-[68px] font-semibold text-white mb-6 [text-shadow:_0_2px_10px_rgba(0,0,0,0.35)] leading-[1.1]"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-body text-sm lg:text-[18px] text-white/90 font-medium leading-[1.6] [text-shadow:_0_2px_10px_rgba(0,0,0,0.35)]"
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
