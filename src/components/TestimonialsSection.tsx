import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, Plus, Loader2, MessageSquare } from "lucide-react";
import { API_URL as API } from "@/api_config";
import ReviewForm from "./ReviewForm";

interface Review {
  id: number;
  name: string;
  rating: number;
  message: string;
  created_at: string;
}

const fallbackReviews = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    initial: "P",
    text: "The quality of the silk is absolutely extraordinary. I wore the Banarasi saree to my sister's wedding and received so many compliments. Truly a masterpiece.",
    rating: 5,
    accentColor: "bg-[#D4AF37]/10 text-[#D4AF37]",
  },
  {
    name: "Ananya Reddy",
    location: "Hyderabad",
    initial: "A",
    text: "Lishan Sarees' attention to detail is unmatched. The packaging felt like unwrapping a luxury gift. The Kanjivaram saree exceeded all my expectations.",
    rating: 5,
    accentColor: "bg-rose-50 text-rose-600",
  },
  {
    name: "Meera Iyer",
    location: "Bangalore",
    initial: "M",
    text: "I've been shopping for silk sarees for years, and nothing compares to the craftsmanship here. The colors are vibrant, the weave is flawless. A true heirloom piece.",
    rating: 5,
    accentColor: "bg-emerald-50 text-emerald-600",
  },
];

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API}/reviews/get_approved.php`);
      const json = await res.json();
      if (json.status === "success") {
        setReviews(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Use dynamic reviews, or fall back to pre-defined ones if empty
  const displayReviews = reviews.length > 0 
    ? reviews.slice(0, 6).map(r => ({
        name: r.name,
        location: "Verified Patron",
        initial: r.name[0].toUpperCase(),
        text: r.message,
        rating: r.rating,
        accentColor: "bg-slate-100 text-slate-700",
        id: r.id
      }))
    : fallbackReviews;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-[#D4AF37]/20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-transparent to-[#D4AF37]/20" />
      <div className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(212,175,55,0.03) 40px, rgba(212,175,55,0.03) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(212,175,55,0.03) 40px, rgba(212,175,55,0.03) 41px)`
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-[#D4AF37]/30" />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-[#D4AF37]/80 font-black">
              Patron Reviews
            </span>
            <div className="w-8 h-px bg-[#D4AF37]/30" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-slate-950 mb-8 tracking-tight">
            Voices of{" "}
            <span className="italic text-[#D4AF37]">Authentic Luxury</span>
          </h2>
          
          <button 
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#0F172A] text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={14} /> Share Your Experience
          </button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {displayReviews.map((t, i) => (
                <motion.div
                  key={t.name + i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative bg-[#FBFAF7] p-10 border border-slate-100 hover:border-[#D4AF37]/30 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group rounded-[32px]"
                >
                  {/* Large quote mark */}
                  <Quote
                    size={48}
                    className="text-[#D4AF37]/10 absolute bottom-10 right-10 group-hover:text-[#D4AF37]/20 transition-colors duration-500"
                  />

                  {/* Stars */}
                  <div className="flex items-center gap-1.5 mb-8">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} className={`transition-colors ${j < t.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-slate-200"}`} />
                    ))}
                  </div>

                  {/* Text */}
                  <div className="min-h-[120px] mb-10">
                    <p className="font-body text-base text-slate-700 leading-relaxed italic line-clamp-5 group-hover:line-clamp-none transition-all duration-500 font-medium">
                      "{t.text}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-8 border-t border-slate-100 group-hover:border-[#D4AF37]/10 transition-colors">
                    <div
                      className={`w-14 h-14 rounded-2xl ${t.accentColor || "bg-slate-900 text-[#D4AF37]"} flex items-center justify-center font-display text-xl font-black shadow-inner`}
                    >
                      {t.initial}
                    </div>
                    <div>
                      <p className="font-display text-base text-slate-950 font-black tracking-tight">{t.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-black">{t.location}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Overall rating bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 bg-slate-50 border border-slate-100 p-10 rounded-[40px] max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-10 text-center shadow-inner"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={22} className="fill-[#D4AF37] text-[#D4AF37] drop-shadow-sm" />
              ))}
            </div>
            <p className="font-display text-slate-950 font-black text-3xl tracking-tighter">4.9/5 Average</p>
          </div>
          
          <div className="hidden sm:block w-px h-16 bg-slate-200" />
          
          <div className="space-y-2">
            <p className="text-[#D4AF37] font-black text-[12px] uppercase tracking-[0.3em] mb-1">Global Community</p>
            <p className="font-body text-slate-600 font-bold text-sm tracking-tight leading-relaxed">
              Serving <span className="text-slate-950 font-black">2,400+ Verified Patrons</span><br />
              Across 15+ Countries
            </p>
          </div>
        </motion.div>
      </div>

      <ReviewForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
};

export default TestimonialsSection;
