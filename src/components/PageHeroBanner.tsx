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
  imagePosition = "center top",
  imageFit = "cover",
  heightClass = "h-[100dvh] min-h-[500px]"
}: PageHeroBannerProps) => {
  return (
    <section className={`page-hero relative w-full ${heightClass} flex flex-col justify-end text-center overflow-hidden bg-[#0a0a0a]`}>
      {backgroundImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={backgroundImage}
            alt="Hero Background"
            className={`w-full h-full object-${imageFit}`}
            style={{ objectPosition: imagePosition }}
          />
        </div>
      )}

      {/* Very subtle gradient — just enough to make text readable at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

      {/* Content Side - Positioned to keep faces clear */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-32 lg:pb-40">
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body text-xs lg:text-sm tracking-[0.6em] uppercase text-[#F5F1E8] mb-6"
          >
            {subtitle}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl lg:text-9xl font-semibold text-white mb-8 drop-shadow-2xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-sm lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="section-divider mt-12 bg-white/30"
        />
      </div>
    </section>
  );
};

export default PageHeroBanner;
