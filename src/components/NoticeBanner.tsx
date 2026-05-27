import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { API_URL } from "@/api_config";

const NoticeBanner = () => {
    const [notice, setNotice] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_URL}/public/get_settings.php`);
                if (response.ok) {
                    const json = await response.json();
                    if (json.status === "success" && json.data.public_notice) {
                        setNotice(json.data.public_notice);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch public notice", err);
            }
        };

        fetchSettings();
    }, []);

    if (!notice || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#FDF5E6] text-[#1A1A1A] relative overflow-hidden"
            >
                <div className="container mx-auto px-10 py-2.5 flex items-center justify-center text-center">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-[85%] mx-auto">
                        <Sparkles size={12} className="text-[#B48C5E] animate-pulse shrink-0" />
                        <span className="truncate">{notice}</span>
                        <Sparkles size={12} className="text-[#B48C5E] animate-pulse shrink-0" />
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
                {/* Decorative gold line */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#B48C5E]/30" />
            </motion.div>
        </AnimatePresence>
    );
};

export default NoticeBanner;
