import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const NoticeBanner = () => {
    const [notice, setNotice] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const response = await fetch("http://localhost/luxe-haven/api/public/get_settings.php");
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

        fetchNotice();
    }, []);

    if (!notice || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#0D3B2E] text-white relative overflow-hidden"
            >
                <div className="container mx-auto px-4 py-2.5 flex items-center justify-center text-center">
                    <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={14} className="text-[#B48C5E] animate-pulse" />
                        <span>{notice}</span>
                        <Sparkles size={14} className="text-[#B48C5E] animate-pulse" />
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
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
