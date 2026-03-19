import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronLeft, ChevronRight, Eye, Loader2, AlertCircle,
    Mail, Phone, MapPin, ShoppingBag, X, TrendingUp
} from "lucide-react";

const API = "http://localhost/luxe-haven/api";

type Customer = {
    id: number; name: string; email: string; phone: string;
    address: string; city: string; state: string; pincode: string;
    total_orders: number; total_spent: number;
    order_count: number; lifetime_value: number;
    last_order_date: string | null; created_at: string;
};

type CustomerDetail = Customer & {
    orders: { id: number; order_number: string; total: number; status: string; payment_method: string; created_at: string; item_count: number }[];
};

const statusBadge = (s: string) => {
    const m: Record<string, string> = {
        Delivered: "bg-emerald-50 text-emerald-800 border-emerald-200 font-black",
        Processing: "bg-blue-50 text-blue-800 border-blue-200 font-black",
        Shipped: "bg-purple-50 text-purple-800 border-purple-200 font-black",
        Pending: "bg-amber-50 text-amber-800 border-amber-200 font-black",
        Cancelled: "bg-rose-50 text-rose-800 border-rose-200 font-black",
    };
    return m[s] ?? "bg-gray-50 text-gray-700 border-gray-200 font-black";
};

const getTier = (spent: number) => {
    if (spent >= 50000) return { label: "Platinum", cls: "bg-purple-50 text-purple-800 border-purple-200 font-black" };
    if (spent >= 25000) return { label: "Gold", cls: "bg-amber-50 text-amber-800 border-amber-200 font-black" };
    if (spent >= 10000) return { label: "Silver", cls: "bg-blue-50 text-blue-800 border-blue-200 font-black" };
    return { label: "Regular", cls: "bg-gray-50 text-gray-700 border-gray-200 font-black" };
};

export default function AdminCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    // Detail modal
    const [detail, setDetail] = useState<CustomerDetail | null>(null);
    const [dLoading, setDLoading] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true); setError(null);
        try {
            const q = new URLSearchParams({
                page: String(page), per_page: "15",
                ...(search ? { search } : {}),
            });
            const res = await fetch(`${API}/customers/index.php?${q}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setCustomers(json.data);
                setTotal(json.total);
                setTotalPages(json.total_pages);
            } else throw new Error(json.message);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Connection failed");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchCustomers();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page, search]);

    const openDetail = async (c: Customer) => {
        setDLoading(true); setDetail(null);
        try {
            const res = await fetch(`${API}/customers/customer.php?id=${c.id}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setDetail(json.data);
        } finally { setDLoading(false); }
    };

    if (loading && customers.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
            <Loader2 size={48} className="animate-spin" strokeWidth={1} />
            <p className="font-display text-2xl italic">Loading customers...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-4 bg-rose-50 rounded-2xl border border-rose-100 p-8 text-center max-w-2xl mx-auto mt-10">
            <AlertCircle size={48} strokeWidth={1} />
            <p className="font-display text-2xl font-semibold mb-2 italic">Database Connection Failed</p>
            <p className="text-sm opacity-80 mb-4">Start PHP server: <code className="block mt-2 bg-rose-200/50 p-2 rounded text-xs">php -S localhost:8000 -t api/</code></p>
            <button onClick={fetchCustomers} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px]">Retry</button>
        </div>
    );

    return (
        <div className="w-full">
            {/* Header */}
            <div className="shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Customer Database</h1>
                    <p className="text-xs font-black text-slate-600 mt-2">
                        {total} REGISTERED CLIENTS IN CATALOGUE
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-[#D4AF37]/50 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-950 placeholder:text-slate-400 w-full sm:w-80"
                            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* Data Manifest Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><ShoppingBag size={18} /></div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Client Registry</h2>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar relative">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Customer</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Contact Details</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Location</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm text-center">Orders</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Spending</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Tier</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.map((c, i) => {
                                const tier = getTier(Number(c.lifetime_value) || 0);
                                const initials = c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-lg">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-950 group-hover:text-[#D4AF37] transition-colors">{c.name}</p>
                                                    <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">Client since {new Date(c.created_at).getFullYear()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-black text-slate-700"><Mail size={12} className="text-slate-600" />{c.email}</div>
                                                {c.phone && <div className="flex items-center gap-2 text-xs font-black text-slate-700"><Phone size={12} className="text-slate-600" />{c.phone}</div>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {c.city && <p className="text-xs font-black text-slate-700">{c.city}{c.state ? `, ${c.state}` : ""}</p>}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <p className="text-sm font-black text-slate-950">{c.order_count ?? c.total_orders}</p>
                                            {c.last_order_date && <p className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest">Last: {new Date(c.last_order_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-slate-950">₹{Number(c.lifetime_value || c.total_spent || 0).toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${tier.cls}`}>{tier.label}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => openDetail(c)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"><Eye size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Entry Manifest <span className="text-slate-400 mx-2">|</span> {page} <span className="text-slate-400 mx-1">/</span> {totalPages}</p>
                    <div className="flex items-center gap-1.5">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-950 transition-all disabled:opacity-20 shadow-sm">
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-inner">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => setPage(n)} 
                                    className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${n === page ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'}`}>
                                    {n}
                                </button>
                            ))}
                        </div>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-950 transition-all disabled:opacity-20 shadow-sm">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Detail Modal */}
            <AnimatePresence>
                {(detail || dLoading) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetail(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200"
                            onClick={e => e.stopPropagation()}>
                            {dLoading ? (
                                <div className="p-24 text-center"><Loader2 size={32} className="animate-spin mx-auto text-slate-300" /></div>
                            ) : detail && (() => {
                                const tier = getTier(Number(detail.lifetime_value || 0));
                                const initials = detail.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                return (
                                    <>
                                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-[#D4AF37] font-black shadow-lg">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black text-slate-950">{detail.name}</h2>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border mt-1 inline-block ${tier.cls}`}>{tier.label} Member</span>
                                                </div>
                                            </div>
                                            <button onClick={() => setDetail(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={20} /></button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 bg-[#F8FAFC] custom-scrollbar">
                                            {/* Contact Cards */}
                                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect Identity</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><Mail size={14} className="text-slate-400" />{detail.email}</div>
                                                    {detail.phone && <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><Phone size={14} className="text-slate-400" />{detail.phone}</div>}
                                                    {detail.city && <div className="flex items-start gap-3 text-sm font-semibold text-slate-700"><MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />{detail.address ? `${detail.address}, ` : ""}{detail.city}{detail.state ? `, ${detail.state}` : ""}{detail.pincode ? ` - ${detail.pincode}` : ""}</div>}
                                                </div>
                                            </div>

                                            {/* Metrics */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800 text-white">
                                                    <ShoppingBag size={20} className="text-slate-500 mb-3" />
                                                    <p className="text-2xl font-black">{detail.orders?.length ?? 0}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Order Volume</p>
                                                </div>
                                                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm text-amber-900 text-center">
                                                    <TrendingUp size={20} className="text-amber-500 mb-3 mx-auto" />
                                                    <p className="text-2xl font-black">₹{Number(detail.lifetime_value || 0).toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1 text-center">Lifetime Spending</p>
                                                </div>
                                            </div>

                                            {/* Activity Logs */}
                                            {detail.orders?.length > 0 && (
                                                <div className="space-y-4">
                                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction History</h3>
                                                    <div className="space-y-3">
                                                        {detail.orders.map(o => (
                                                            <div key={o.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#D4AF37]/30 transition-all group">
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#D4AF37] transition-colors">{o.order_number}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(o.created_at).toLocaleDateString("en-IN")} · {o.item_count} items</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs font-bold text-slate-900">₹{Number(o.total).toLocaleString()}</p>
                                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border inline-block mt-1 ${statusBadge(o.status)}`}>{o.status}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end">
                                            <button onClick={() => setDetail(null)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">Dismiss Profile</button>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </div>
        );
}
