import { Flame, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const offers = [
    "🔥 Diwali Special — Upto 40% OFF on Silk Sarees",
    "✨ Use Code LUXE200 for ₹200 Off on Orders Above ₹3,999",
    "🎁 Free Blouse Piece on Every Saree Above ₹6,000",
    "💛 New Kanjivaram Collections Just Landed",
    "🚚 Free Shipping Pan India Above ₹5,000",
];

const FlashSaleStrip = () => {
    return (
        <section className="relative overflow-hidden bg-[#1a1008] border-b border-gold/20 py-3">
            {/* Scrolling ticker */}
            <div className="flex items-center gap-0 overflow-hidden">
                <div
                    className="flex gap-16 items-center whitespace-nowrap"
                    style={{
                        animation: "marquee 35s linear infinite",
                    }}
                >
                    {[...offers, ...offers].map((item, i) => (
                        <span
                            key={i}
                            className="font-body text-[11px] tracking-[0.18em] uppercase text-gold-light flex items-center gap-3"
                        >
                            <Flame size={11} className="text-gold shrink-0" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </section>
    );
};

export default FlashSaleStrip;
