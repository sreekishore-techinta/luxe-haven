import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag, ArrowRight, Flame } from "lucide-react";
import festiveSaleBanner from "@/assets/festive_sale_banner.png";

const SaleBanner = () => {
    return (
        <section className="relative overflow-hidden">
            {/* Background image */}
            <div className="relative h-[420px] lg:h-[500px]">
                <img
                    src={festiveSaleBanner}
                    alt="Festival Sale"
                    className="absolute inset-0 w-full h-full object-cover object-top brightness-[1.05] contrast-[1.05] saturate-[1.05]"
                    loading="lazy"
                />
                {/* Minimalist lightened overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1008]/60 via-[#1a1008]/20 to-transparent" />

                {/* Content */}
                <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center gap-3 mb-5"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/30 backdrop-blur-sm">
                                <Flame size={14} className="text-gold animate-pulse" />
                                <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold">
                                    Limited Time Offer
                                </span>
                            </div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-champagne leading-[1.0] mb-4"
                        >
                            Festive{" "}
                            <span className="italic font-light text-gold-light">
                                Grand Sale
                            </span>
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex items-baseline gap-3 mb-6"
                        >
                            <span className="font-display text-7xl lg:text-8xl font-bold text-gold leading-none">
                                40
                            </span>
                            <div>
                                <span className="font-display text-3xl text-gold font-light">%</span>
                                <p className="font-body text-sm text-gold-light/70 tracking-wide uppercase">
                                    Off Sitewide
                                </p>
                            </div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="font-body text-sm text-champagne/60 mb-8 flex items-center gap-2"
                        >
                            <Tag size={13} className="text-accent" />
                            Use code{" "}
                            <span className="font-semibold text-gold px-2 py-0.5 bg-gold/10 border border-gold/20 tracking-widest">
                                FESTIVE40
                            </span>{" "}
                            at checkout
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <Link
                                to="/collections"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-[#1a1008] font-body text-sm uppercase tracking-[0.2em] hover:bg-gold-light transition-colors duration-300 font-semibold group"
                            >
                                Shop the Sale
                                <ArrowRight
                                    size={15}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SaleBanner;
