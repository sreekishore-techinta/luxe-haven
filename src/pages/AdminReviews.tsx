import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Star, CheckCircle, XCircle, Trash2, Filter, 
    Search, MessageSquare, Clock, User, Mail, MoreVertical,
    Check, X, AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "@/api_config";

interface Review {
    id: number;
    name: string;
    email: string | null;
    rating: number;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const url = `${API}/admin/reviews/list.php${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`;
            const res = await fetch(url, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setReviews(json.data);
            } else {
                toast.error(`Fetch error: ${json.message}`);
            }
        } catch (err: any) {
            console.error("Fetch Error:", err);
            toast.error(`Fetch failed: ${err.message || 'Check if the reviews table exists'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [filterStatus]);

    const handleUpdateStatus = async (id: number, status: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`${API}/admin/reviews/update_status.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
                credentials: "include"
            });
            const json = await res.json();
            if (json.status === "success") {
                toast.success(`Review ${status} successfully`);
                fetchReviews();
            }
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        setActionLoading(id);
        try {
            const res = await fetch(`${API}/admin/reviews/delete.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
                credentials: "include"
            });
            const json = await res.json();
            if (json.status === "success") {
                toast.success("Review deleted");
                fetchReviews();
            }
        } catch (err) {
            toast.error("Deletion failed");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredReviews = reviews.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                        <MessageSquare className="text-[#D4AF37]" size={32} />
                        Customer Feedback
                    </h1>
                    <p className="text-slate-600 mt-1 font-bold italic">Manage and moderate customer reviews and testimonials.</p>
                </div>
            </div>

            {/* toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or message..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-slate-400 mr-2" size={18} />
                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                filterStatus === s 
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
                    <p className="text-slate-500 font-bold italic">Fetching feedback...</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] border-2 border-dashed border-slate-100 italic text-slate-400">
                    <AlertCircle size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">No feedback found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredReviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden"
                            >
                                {/* Header */}
                                <div className="p-6 pb-4 flex items-start justify-between bg-slate-50/50 border-b border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-[#D4AF37] font-black text-lg shadow-lg shadow-slate-200">
                                            {review.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 leading-tight">{review.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Clock size={10} /> {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(review.status)}`}>
                                        {review.status}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star 
                                                key={star} 
                                                size={16} 
                                                className={star <= review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-slate-200"} 
                                            />
                                        ))}
                                    </div>
                                    
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative min-h-[100px]">
                                        <p className="text-sm font-bold text-slate-700 italic leading-relaxed">
                                            "{review.message}"
                                        </p>
                                    </div>

                                    {review.email && (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Mail size={12} />
                                            <span className="text-[10px] font-bold italic">{review.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                                    <div className="flex gap-2">
                                        {review.status !== 'approved' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(review.id, 'approved')}
                                                disabled={actionLoading === review.id}
                                                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                                title="Approve"
                                            >
                                                {actionLoading === review.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} strokeWidth={3} />}
                                            </button>
                                        )}
                                        {review.status !== 'rejected' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                                disabled={actionLoading === review.id}
                                                className="w-10 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
                                                title="Reject"
                                            >
                                                {actionLoading === review.id ? <Loader2 className="animate-spin" size={16} /> : <X size={18} strokeWidth={3} />}
                                            </button>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(review.id)}
                                        disabled={actionLoading === review.id}
                                        className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-all disabled:opacity-50"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
