import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { API_URL as API } from "@/api_config";

interface ServiceCategory {
    id: number;
    title: string;
    image_url: string;
    link_url?: string;
    tag: string;
    display_order: number;
}

export default function ServicesGrid() {
    const [services, setServices] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch(`${API}/services/get_active.php`);
                const json = await res.json();
                if (json.status === "success") {
                    setServices(json.data);
                }
            } catch (err) {
                console.error("Failed to fetch services", err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curating Lookbook...</p>
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <section className="py-24 bg-white border-y border-slate-50">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <Sparkles size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-display text-2xl font-black text-slate-950">Curated Lookbook Coming Soon</h2>
                        <p className="text-slate-500 font-bold max-w-xs mx-auto">Our artisans are currently assembling a premium collection just for you.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <motion.header 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-px bg-[#D4AF37]/40" />
                            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-[#D4AF37]/80 font-black">Shop the Look</span>
                        </div>
                        <h2 className="font-display text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                            Curated <span className="italic text-[#D4AF37]/80 font-light">Lookbook</span>
                        </h2>
                    </div>
                    <Link to="/collections" className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-slate-950 transition-colors">
                        Explore Full Collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.header>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 lg:gap-12">
                    {services.map((service, i) => (
                        <Link 
                            to={service.link_url || `/collections?category=${encodeURIComponent(service.title)}`}

                            key={service.id}

                            className="group flex flex-col items-center text-center space-y-6"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="w-full"
                            >
                                <div className="relative w-full aspect-square">
                                    {/* Circle Container */}
                                    <div className="absolute inset-0 rounded-full border border-slate-100 shadow-sm overflow-hidden group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-500 bg-slate-50">
                                        <img 
                                            src={service.image_url.startsWith('http') ? service.image_url : (service.image_url.startsWith('/') ? service.image_url : `/${service.image_url}`)} 
                                            alt={service.title} 
                                            className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://placehold.co/400x400/f8fafc/cbd5e1?text=Image+Missing";
                                            }}
                                        />
                                    </div>

                                    {/* Tag Badge */}
                                    {service.tag && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 5 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (i * 0.1) + 0.3 }}
                                            className="absolute -top-1 -right-1 bg-[#D4AF37] text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg z-10"
                                        >
                                            {service.tag}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Title Below */}
                            <div className="space-y-1">
                                <h3 className="font-display text-sm font-black text-slate-950 tracking-tight group-hover:text-[#D4AF37] transition-colors duration-300">
                                    {service.title}
                                </h3>
                                <div className="w-6 h-0.5 bg-transparent group-hover:bg-[#D4AF37]/30 mx-auto transition-all duration-300 rounded-full" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
