import { motion } from "framer-motion";

interface CategoryHeroProps {
    title: string;
    description?: string;
    backgroundImage?: string;
    imagePosition?: string;
    align?: "left" | "center";
}

const CategoryHero = ({
    title,
    description,
    backgroundImage,
    imagePosition = "center 20%",
    align = "center"
}: CategoryHeroProps) => {
    return (
        <section className="relative w-full h-[80vh] md:h-screen overflow-hidden flex items-center bg-[#FDFBF7]">
            {backgroundImage && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={backgroundImage}
                        alt={title}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: imagePosition }}
                        loading="eager"
                    />
                    {/* Lightened Overlay for clear visuals and text readability */}
                    <div className={`absolute inset-0 z-10 ${align === "left"
                        ? "bg-gradient-to-r from-black/50 via-black/5 to-transparent"
                        : "bg-black/10"
                        }`} />
                </div>
            )}

            <div className={`container mx-auto px-4 lg:px-20 relative z-20 h-full flex pt-[40vh] lg:pt-0 items-start lg:items-center ${align === "left" ? "justify-center lg:justify-start" : "justify-center"
                }`}>
                <div className={`${align === "left" ? "max-w-[520px] text-center lg:text-left" : "max-w-3xl text-center"
                    }`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className={`font-display font-semibold text-white mb-[20px] tracking-tight leading-[1.1] ${align === "left"
                            ? "text-[32px] md:text-6xl lg:text-[68px]"
                            : "text-[40px] md:text-7xl lg:text-8xl"
                            } [text-shadow:_0_2px_10px_rgba(0,0,0,0.35)]`}>
                            {title}
                        </h1>

                        {description && (
                            <p className="font-body text-sm lg:text-[18px] text-white/90 font-medium mb-[30px] lg:mx-0 mx-auto leading-[1.6] [text-shadow:_0_2px_10px_rgba(0,0,0,0.35)]">
                                {description}
                            </p>
                        )}

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            onClick={() => {
                                const nextSec = document.getElementById('collection-grid');
                                if (nextSec) nextSec.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-[32px] py-[14px] bg-white text-black rounded-[4px] text-[11px] font-semibold uppercase tracking-[2px] hover:bg-[#D4AF37] hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                            Explore Collection
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CategoryHero;
