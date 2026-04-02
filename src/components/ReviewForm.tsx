import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "@/api_config";

interface ReviewFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReviewForm({ isOpen, onClose }: ReviewFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/reviews/submit.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, rating, message })
            });
            const json = await res.json();
            if (json.status === "success") {
                setSuccess(true);
                toast.success(json.message);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setName(""); setEmail(""); setMessage(""); setRating(5);
                }, 3000);
            } else {
                toast.error(json.message);
            }
        } catch (err) {
            toast.error("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl z-10 border border-slate-100"
                >
                    {/* Header */}
                    <div className="bg-[#FBFAF7] px-8 py-12 text-center relative overflow-hidden border-b border-slate-100">
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-slate-900 transition-colors bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                            <X size={18} />
                        </button>
                        <h2 className="font-display text-3xl font-black text-slate-950 mb-3 tracking-tight">Share Your Experience</h2>
                        <p className="font-body text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-black">Your feedback fuels our craftsmanship.</p>
                    </div>

                    <div className="p-8 lg:p-12">
                        {success ? (
                            <div className="py-12 text-center space-y-6">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
                                    <CheckCircle size={48} />
                                </motion.div>
                                <div className="space-y-2">
                                    <h3 className="font-display text-3xl font-black text-slate-950 tracking-tight">Thank You!</h3>
                                    <p className="font-body text-sm text-slate-500 leading-relaxed max-w-xs mx-auto font-medium">
                                        Your review has been submitted and will be visible on our website after moderation.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <label className="font-body text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] block mb-4 font-black">Overall Rating</label>
                                        <div className="flex items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="p-1.5 transition-all active:scale-90 hover:scale-110"
                                                >
                                                    <Star 
                                                        size={36} 
                                                        className={`transition-all duration-300 ${
                                                            (hoverRating || rating) >= star 
                                                            ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-md" 
                                                            : "text-slate-100"
                                                        }`} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-5 pt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="font-body text-[10px] uppercase tracking-widest text-slate-500 ml-1 font-bold">Full Name</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="e.g. Aditi Sharma"
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:ring-4 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-300"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="font-body text-[10px] uppercase tracking-widest text-slate-500 ml-1 font-bold">Email <span className="opacity-40 italic text-xs">(Optional)</span></label>
                                                <input 
                                                    type="email" 
                                                    placeholder="aditi@example.com"
                                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:ring-4 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-300"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="font-body text-[10px] uppercase tracking-widest text-slate-500 ml-1 font-bold">Your Thoughts</label>
                                            <textarea 
                                                required
                                                rows={4}
                                                placeholder="Tell us what you loved about our collection..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-sm font-bold focus:ring-4 focus:ring-slate-100 outline-none transition-all resize-none placeholder:text-slate-300 min-h-[140px]"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full py-5 bg-[#0F172A] hover:bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-70 group"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>Submit Masterpiece Review</>
                                        )}
                                    </button>
                                    <p className="text-[10px] text-center text-slate-400 mt-6 uppercase tracking-widest leading-relaxed font-bold">
                                        Quality verified by <span className="text-[#D4AF37]">LuxeHaven</span>
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
