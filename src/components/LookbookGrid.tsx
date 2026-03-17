import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import categorySarees from "@/assets/category-sarees.jpg";
import categoryBlouses from "@/assets/category-blouses.png";
import categorySuits from "@/assets/category-suits.jpg";
import heroImage2 from "@/assets/new-arrivals-hero-2.jpg";
import product3 from "@/assets/product-3.jpg";

const panels = [
    {
        image: categorySarees,
        title: "Silk Sarees",
        subtitle: "Heritage Collection",
        tag: "300+ Styles",
        link: "/collections",
        span: "row-span-2",
    },
    {
        image: heroImage2,
        title: "New Arrivals",
        subtitle: "Season 2026",
        tag: "Just In",
        link: "/new-arrivals",
        span: "",
    },
    {
        image: categoryBlouses,
        title: "Designer Blouses",
        subtitle: "Contemporary Craft",
        tag: "Exclusive",
        link: "/collections",
        span: "",
    },
    {
        image: categorySuits,
        title: "Suit Sets",
        subtitle: "Elegant Ensembles",
        tag: "Limited Edition",
        link: "/collections",
        span: "",
    },
    {
        image: product3,
        title: "Best Sellers",
        subtitle: "Most Loved Picks",
        tag: "Trending",
        link: "/best-sellers",
        span: "",
    },
];

const LookbookGrid = () => {
    return (
        <section className="py-16 bg-[#FDFBF7]">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-end justify-between mb-10"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-px bg-accent" />
                            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">
                                Shop The Look
                            </span>
                        </div>
                        <h2 className="font-display text-3xl lg:text-5xl font-semibold leading-tight">
                            Curated{" "}
                            <span className="italic font-light text-accent">Lookbook</span>
                        </h2>
                    </div>
                    <Link
                        to="/collections"
                        className="hidden md:flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        View All Collections <ArrowUpRight size={14} />
                    </Link>
                </motion.div>

                {/* Asymmetric Editorial Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {/* Panel 1 - Large, spans 2 rows on lg */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="lg:row-span-2 lg:col-span-1 aspect-[4/5] sm:aspect-auto sm:h-[400px] lg:h-auto"
                    >
                        <Link
                            to={panels[0].link}
                            className="group relative w-full h-full overflow-hidden block"
                        >
                            <img
                                src={panels[0].image}
                                alt={panels[0].title}
                                className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
                            <div className="absolute top-4 left-4">
                                <span className="inline-block px-3 py-1 bg-gold text-[#1a1008] font-body text-[9px] tracking-[0.3em] uppercase font-semibold">
                                    {panels[0].tag}
                                </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-light mb-2">
                                    {panels[0].subtitle}
                                </p>
                                <h3 className="font-display text-2xl lg:text-3xl text-champagne font-medium mb-3">
                                    {panels[0].title}
                                </h3>
                                <span className="inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.3em] uppercase text-gold-light group-hover:text-gold transition-colors">
                                    Explore <ArrowRight size={11} />
                                </span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Right Side Panels - Grid within Grid or Flat on Mobile */}
                    <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                        {/* Panel 2 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[330px]"
                        >
                            <Link
                                to={panels[1].link}
                                className="group relative w-full h-full overflow-hidden block"
                            >
                                <img
                                    src={panels[1].image}
                                    alt={panels[1].title}
                                    className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                                <div className="absolute top-3 left-3">
                                    <span className="inline-block px-2.5 py-1 bg-foreground text-champagne font-body text-[9px] tracking-[0.25em] uppercase">
                                        {panels[1].tag}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="font-display text-lg text-champagne font-medium">
                                        {panels[1].title}
                                    </h3>
                                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-light">
                                        {panels[1].subtitle}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Panel 3 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="sm:col-span-1 lg:col-span-2 aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[330px]"
                        >
                            <Link
                                to={panels[2].link}
                                className="group relative w-full h-full overflow-hidden block"
                            >
                                <img
                                    src={panels[2].image}
                                    alt={panels[2].title}
                                    className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                                <div className="absolute top-3 right-3">
                                    <span className="inline-block px-2.5 py-1 bg-accent/90 text-accent-foreground font-body text-[9px] tracking-[0.25em] uppercase">
                                        {panels[2].tag}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="font-display text-lg text-champagne font-medium">
                                        {panels[2].title}
                                    </h3>
                                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-light">
                                        {panels[2].subtitle}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Panel 4 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="lg:col-span-2 aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[330px]"
                        >
                            <Link
                                to={panels[3].link}
                                className="group relative w-full h-full overflow-hidden block"
                            >
                                <img
                                    src={panels[3].image}
                                    alt={panels[3].title}
                                    className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                                <div className="absolute top-3 left-3">
                                    <span className="inline-block px-2.5 py-1 border border-champagne/30 text-champagne font-body text-[9px] tracking-[0.25em] uppercase backdrop-blur-sm">
                                        {panels[3].tag}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="font-display text-lg text-champagne font-medium">
                                        {panels[3].title}
                                    </h3>
                                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-light">
                                        {panels[3].subtitle}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Panel 5 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className="aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[330px]"
                        >
                            <Link
                                to={panels[4].link}
                                className="group relative w-full h-full overflow-hidden block"
                            >
                                <img
                                    src={panels[4].image}
                                    alt={panels[4].title}
                                    className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                                <div className="absolute top-3 left-3">
                                    <span className="inline-block px-2.5 py-1 bg-burgundy/90 text-champagne font-body text-[9px] tracking-[0.25em] uppercase">
                                        {panels[4].tag}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                                    <div>
                                        <h3 className="font-display text-lg text-champagne font-medium">
                                            {panels[4].title}
                                        </h3>
                                        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-light">
                                            {panels[4].subtitle}
                                        </p>
                                    </div>
                                    <span className="w-9 h-9 rounded-full bg-gold/20 backdrop-blur border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-[#1a1008] transition-all duration-500">
                                        <ArrowRight size={13} />
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 text-center md:hidden">
                    <Link
                        to="/collections"
                        className="btn-outline group inline-flex items-center gap-2"
                    >
                        View All Collections <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LookbookGrid;
