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
    imagePosition = "center",
    align = "center"
}: CategoryHeroProps) => {
    return (
        <section className="relative w-full min-h-[50vh] md:h-[80vh] lg:h-screen overflow-hidden flex items-center bg-[#FDFBF7]">
            {backgroundImage && (
                <div className="absolute inset-0 z-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-1000 ease-out"
                        style={{ 
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: imagePosition
                        }}
                    />
                    {/* Lightened Overlay for clear visuals and text readability */}
                    <div className={`absolute inset-0 z-10 ${align === "left"
                        ? "bg-gradient-to-r from-black/60 via-black/20 to-transparent"
                        : "bg-black/25"
                        }`} />
                </div>
            )}

            <div className={`container mx-auto px-4 lg:px-20 relative z-20 h-full flex pt-[40vh] lg:pt-0 items-start lg:items-center ${align === "left" ? "justify-center lg:justify-start" : "justify-center"
                }`}>
                <div className={`${align === "left" ? "max-w-[620px] text-center lg:text-left" : "max-w-3xl text-center"
                    }`}>
                    <motion.div
                        initial={{ opacity: 0, x: align === "left" ? -50 : 0, y: align === "left" ? 0 : 20 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`font-display font-semibold text-white mb-[24px] tracking-tight leading-[1.05] ${align === "left"
                            ? "text-[42px] md:text-7xl lg:text-[84px]"
                            : "text-[48px] md:text-8xl lg:text-9xl"
                            } [text-shadow:_0_4px_15px_rgba(0,0,0,0.5)]`}
                        >
                            {title}
                        </motion.h1>

                        {description && (
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="font-body text-base lg:text-[20px] text-white/95 font-medium mb-[40px] lg:mx-0 mx-auto leading-[1.6] max-w-lg [text-shadow:_0_2px_10px_rgba(0,0,0,0.4)]"
                            >
                                {description}
                            </motion.p>
                        )}

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            onClick={() => {
                                const nextSec = document.getElementById('collection-grid');
                                if (nextSec) nextSec.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="group relative px-[40px] py-[16px] bg-white text-black rounded-[4px] text-[12px] font-bold uppercase tracking-[3px] overflow-hidden transition-all shadow-2xl hover:bg-[#D4AF37] hover:text-white active:scale-95"
                        >
                            <span className="relative z-10">Explore Collection</span>
                            <div className="absolute inset-0 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 z-0" />
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CategoryHero;
