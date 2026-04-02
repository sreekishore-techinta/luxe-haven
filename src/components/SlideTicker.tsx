import { useState, useEffect } from "react";
import { API_URL as API } from "@/api_config";

interface SlideCard {
    id: number;
    content: string;
    icon: string;
}

const SlideTicker = () => {
    const [slides, setSlides] = useState<SlideCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await fetch(`${API}/slide_cards/get_active.php`);
                const json = await res.json();
                if (json.status === "success") {
                    const filtered = json.data.filter((s: SlideCard) => 
                        !s.content.toLowerCase().includes("shipping") && 
                        !s.content.toLowerCase().includes("free")
                    );
                    setSlides(filtered);
                }
            } catch (err) {
                console.error("Failed to load slide cards", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();
    }, []);

    if (loading || slides.length === 0) return null;

    return (
        <div className="bg-[#1A1A1A] text-white overflow-hidden py-2.5 relative flex items-center w-full z-40 border-b border-white/10">
            <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-[#1A1A1A] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-[#1A1A1A] to-transparent z-10 pointer-events-none"></div>

            <div className="marquee-container flex items-center whitespace-nowrap overflow-hidden">
                <div className="marquee-content flex items-center hover:[animation-play-state:paused] uppercase tracking-widest text-[10px] sm:text-[11px] font-bold">
                    {/* Render the slides twice to create the infinite loop effect smoothly */}
                    {[...slides, ...slides, ...slides, ...slides].map((slide, index) => (
                        <div key={`${slide.id}-${index}`} className="flex items-center gap-3 px-8 md:px-16 shrink-0 text-[#EADDCD]">
                            {slide.icon && <span className="text-sm shrink-0">{slide.icon}</span>}
                            <span>{slide.content}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SlideTicker;
