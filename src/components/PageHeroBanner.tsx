import { motion } from "framer-motion";

interface PageHeroBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
}

const PageHeroBanner = ({ title, subtitle, description, backgroundImage }: PageHeroBannerProps) => {
  return (
    <section className="page-hero flex items-center justify-center text-center">
      {backgroundImage && (
        <div className="absolute inset-0">
          <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className={backgroundImage ? "page-hero-overlay" : "absolute inset-0 luxury-gradient"} />

      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20 lg:py-28">
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body text-xs tracking-[0.4em] uppercase text-gold-light mb-4"
          >
            {subtitle}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-champagne mb-4"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-sm text-gold-light/70 max-w-lg mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="section-divider mt-8"
        />
      </div>
    </section>
  );
};

export default PageHeroBanner;
