import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronLeft, ChevronRight, Eye, Loader2, AlertCircle,
    Mail, Phone, MapPin, ShoppingBag, X, TrendingUp
} from "lucide-react";

const API = "http://localhost:8000";

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
        Delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Processing: "bg-blue-50 text-blue-600 border-blue-100",
        Shipped: "bg-purple-50 text-purple-600 border-purple-100",
        Pending: "bg-amber-50 text-amber-600 border-amber-100",
        Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    };
    return m[s] ?? "bg-gray-50 text-gray-500 border-gray-100";
};

const getTier = (spent: number) => {
    if (spent >= 50000) return { label: "Platinum", cls: "bg-purple-50 text-purple-600 border-purple-100" };
    if (spent >= 25000) return { label: "Gold", cls: "bg-amber-50 text-amber-600 border-amber-100" };
    if (spent >= 10000) return { label: "Silver", cls: "bg-blue-50 text-blue-600 border-blue-100" };
    return { label: "Regular", cls: "bg-gray-50 text-gray-500 border-gray-100" };
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

    useEffect(() => { fetchCustomers(); }, [page, search]);

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-display text-4xl font-semibold mb-2">Customer Database</h1>
                    <p className="text-sm text-gray-400 font-medium">{total} registered customers</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search by name, email or phone..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 text-sm focus:ring-0 focus:border-[#B48C5E] transition-all"
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                {["Customer", "Contact", "Location", "Orders", "Lifetime Value", "Tier", "Action"].map(h => (
                                    <th key={h} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 italic ${h === "Action" ? "text-right" : ""}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {customers.map((c, i) => {
                                const tier = getTier(Number(c.lifetime_value) || 0);
                                const initials = c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                return (
                                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B48C5E] to-[#8B6B43] flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 group-hover:text-[#B48C5E] transition-colors">{c.name}</p>
                                                    <p className="text-[10px] text-gray-400">Since {new Date(c.created_at).getFullYear()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><Mail size={11} className="text-gray-400" />{c.email}</div>
                                                {c.phone && <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><Phone size={11} className="text-gray-400" />{c.phone}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.city && <p className="text-[11px] text-gray-600 font-medium">{c.city}{c.state ? `, ${c.state}` : ""}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-gray-900">{c.order_count ?? c.total_orders}</p>
                                            {c.last_order_date && <p className="text-[10px] text-gray-400">Last: {new Date(c.last_order_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-gray-900 font-display italic">₹{Number(c.lifetime_value || c.total_spent || 0).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${tier.cls}`}>{tier.label}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openDetail(c)} className="p-2.5 text-gray-400 hover:text-[#B48C5E] hover:bg-[#B48C5E]/10 rounded-lg transition-all"><Eye size={15} /></button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">Showing {customers.length} of {total}</p>
                    <div className="flex items-center gap-2">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2.5 text-gray-400 hover:text-[#B48C5E] border border-gray-100 rounded-xl disabled:opacity-30"><ChevronLeft size={16} /></button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                            <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-xl text-xs font-bold ${n === page ? 'bg-[#B48C5E] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>{n}</button>
                        ))}
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2.5 text-gray-400 hover:text-[#B48C5E] border border-gray-100 rounded-xl disabled:opacity-30"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* ── Customer Detail Modal ───────────────────────────────────── */}
            <AnimatePresence>
                {(detail || dLoading) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDetail(null)}>
                        <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            {dLoading ? (
                                <div className="p-16 text-center"><Loader2 size={32} className="animate-spin mx-auto text-gray-400" /></div>
                            ) : detail && (() => {
                                const tier = getTier(Number(detail.lifetime_value || 0));
                                const initials = detail.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                return (
                                    <>
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B48C5E] to-[#8B6B43] flex items-center justify-center text-white font-bold">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <h2 className="font-display text-xl font-semibold">{detail.name}</h2>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.cls}`}>{tier.label} Member</span>
                                                </div>
                                            </div>
                                            <button onClick={() => setDetail(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X size={20} /></button>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {/* Contact */}
                                            <div className="bg-gray-50 rounded-xl p-5 space-y-2">
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Contact Info</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} className="text-gray-400" />{detail.email}</div>
                                                {detail.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} className="text-gray-400" />{detail.phone}</div>}
                                                {detail.city && <div className="flex items-start gap-2 text-sm text-gray-600"><MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />{detail.address ? `${detail.address}, ` : ""}{detail.city}{detail.state ? `, ${detail.state}` : ""}{detail.pincode ? ` - ${detail.pincode}` : ""}</div>}
                                            </div>
                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#B48C5E]/5 rounded-xl p-4 text-center">
                                                    <ShoppingBag size={20} className="mx-auto text-[#B48C5E] mb-2" />
                                                    <p className="text-2xl font-bold font-display">{detail.orders?.length ?? 0}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Total Orders</p>
                                                </div>
                                                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                                    <TrendingUp size={20} className="mx-auto text-emerald-600 mb-2" />
                                                    <p className="text-2xl font-bold font-display text-emerald-700">₹{Number(detail.lifetime_value || 0).toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Lifetime Value</p>
                                                </div>
                                            </div>
                                            {/* Order History */}
                                            {detail.orders?.length > 0 && (
                                                <div>
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Order History</h3>
                                                    <div className="space-y-2">
                                                        {detail.orders.map(o => (
                                                            <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-900">{o.order_number}</p>
                                                                    <p className="text-[10px] text-gray-400">{new Date(o.created_at).toLocaleDateString("en-IN")} · {o.item_count} items · {o.payment_method}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs font-bold font-display text-gray-900">₹{Number(o.total).toLocaleString()}</p>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(o.status)}`}>{o.status}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
