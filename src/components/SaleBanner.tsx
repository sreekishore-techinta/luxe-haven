import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag, ArrowRight, Flame } from "lucide-react";
import { API_URL as API, BASE_URL } from "@/api_config";
import festiveSaleBanner from "@/assets/festive_sale_banner.png";

const SaleBanner = () => {
    const [slider, setSlider] = useState<any>(null);

    useEffect(() => {
        const fetchSlider = async () => {
            try {
                const res = await fetch(`${API}/web_sliders/get_active.php?page=sale_banner`);
                const json = await res.json();
                if (json.status === "success" && json.data && json.data.length > 0) {
                    setSlider(json.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch sale banner", err);
            }
        };
        fetchSlider();
    }, []);

    const imageSrc = slider?.image_url 
        ? (slider.image_url.startsWith('http') ? slider.image_url : `${BASE_URL}${slider.image_url}`)
        : festiveSaleBanner;

    return (
        <section className="relative overflow-hidden">
            {/* Background image */}
            <div className="relative h-[420px] lg:h-[500px]">
                <img
                    src={imageSrc}
                    alt={slider?.title || "Festival Sale"}
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
                                    {slider?.subtitle || "Limited Time Offer"}
                                </span>
                            </div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-champagne leading-[1.0] mb-4 uppercase tracking-tighter"
                        >
                            {slider?.title ? (
                                <>
                                    {slider.title.split(' ')[0]}{" "}
                                    <span className="italic font-light text-gold-light">
                                        {slider.title.split(' ').slice(1).join(' ') || "Grand Sale"}
                                    </span>
                                </>
                            ) : (
                                <>
                                    Festive{" "}
                                    <span className="italic font-light text-gold-light">
                                        Grand Sale
                                    </span>
                                </>
                            )}
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex items-baseline gap-3 mb-6"
                        >
                            <span className="font-display text-7xl lg:text-8xl font-bold text-gold leading-none tracking-tighter">
                                {slider?.description?.match(/\d+/)?.[0] || "40"}
                            </span>
                            <div>
                                <span className="font-display text-3xl text-gold font-light">%</span>
                                <p className="font-body text-[10px] text-gold-light/70 tracking-[0.2em] uppercase font-black">
                                    Off Sitewide
                                </p>
                            </div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="font-body text-[11px] text-champagne/60 mb-8 flex items-center gap-2 uppercase tracking-widest font-black"
                        >
                            <Tag size={13} className="text-accent" />
                            Use code{" "}
                            <span className="font-semibold text-gold px-3 py-1 bg-gold/10 border border-gold/20 tracking-[0.3em]">
                                {slider?.description?.split(' ')[0] || "FESTIVE40"}
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
                                to={slider?.button_link || "/collections"}
                                className="inline-flex items-center gap-4 px-10 py-5 bg-gold text-[#1a1008] font-body text-[11px] uppercase tracking-[0.3em] hover:bg-gold-light transition-all duration-500 font-black group shadow-xl shadow-gold/10"
                            >
                                {slider?.button_text || "Shop the Sale"}
                                <ArrowRight
                                    size={15}
                                    className="transition-transform group-hover:translate-x-2"
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
