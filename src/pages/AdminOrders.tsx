import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronLeft, ChevronRight, Eye, Loader2, AlertCircle,
    Download, X, Package, MapPin, Phone, Mail, CheckCircle, Users
} from "lucide-react";

const API = "http://localhost:8000";

type Order = {
    id: number; order_number: string; customer_name: string; customer_email: string;
    customer_phone: string; shipping_address: string; shipping_city: string;
    shipping_state: string; total: number; subtotal: number;
    payment_method: string; payment_status: string; status: string;
    tracking_number: string | null; notes: string | null;
    item_count: number; items_summary: string; created_at: string;
};

type OrderDetail = Order & {
    items: { id: number; product_name: string; product_sku: string; quantity: number; unit_price: number; total_price: number; image_path: string | null }[];
};

const ORDER_STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

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

const payBadge = (s: string) => {
    const m: Record<string, string> = {
        Paid: "bg-emerald-50 text-emerald-700",
        Pending: "bg-amber-50 text-amber-700",
        Failed: "bg-rose-50 text-rose-700",
        Refunded: "bg-purple-50 text-purple-700",
    };
    return m[s] ?? "bg-gray-50 text-gray-600";
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");

    // Detail modal
    const [detail, setDetail] = useState<OrderDetail | null>(null);
    const [detailLoading, setDLoad] = useState(false);

    // Status update
    const [updateStatus, setUpdateStatus] = useState("");
    const [trackingNum, setTrackingNum] = useState("");
    const [updateMsg, setUpdateMsg] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchOrders = async () => {
        setLoading(true); setError(null);
        try {
            const q = new URLSearchParams({
                page: String(page), per_page: "15",
                ...(search ? { search } : {}),
                ...(statusFilter !== "All" ? { status: statusFilter } : {}),
            });
            const res = await fetch(`${API}/orders/index.php?${q}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setOrders(json.data);
                setTotal(json.total);
                setTotalPages(json.total_pages);
            } else throw new Error(json.message);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Connection failed");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [page, search, statusFilter]);

    const openDetail = async (o: Order) => {
        setDLoad(true); setDetail(null); setUpdateMsg(null);
        setUpdateStatus(o.status); setTrackingNum(o.tracking_number ?? "");
        try {
            const res = await fetch(`${API}/orders/order.php?id=${o.id}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setDetail(json.data);
        } finally { setDLoad(false); }
    };

    const handleUpdateStatus = async () => {
        if (!detail) return;
        setSaving(true); setUpdateMsg(null);
        try {
            const res = await fetch(`${API}/orders/order.php?id=${detail.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: updateStatus, tracking_number: trackingNum }),
            });
            const json = await res.json();
            if (json.status === "success") {
                setUpdateMsg("✓ Order status updated!");
                fetchOrders();
                setTimeout(() => setUpdateMsg(null), 2000);
            } else throw new Error(json.message);
        } catch (e: unknown) {
            setUpdateMsg(e instanceof Error ? e.message : "Update failed");
        } finally { setSaving(false); }
    };

    const exportCSV = () => {
        const headers = ["Order ID", "Customer", "Email", "Total", "Status", "Date"];
        const rows = orders.map(o => [o.order_number, o.customer_name, o.customer_email, `₹${o.total}`, o.status, o.created_at.slice(0, 10)]);
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        a.download = "orders.csv"; a.click();
    };

    if (loading && orders.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
            <Loader2 size={48} className="animate-spin" strokeWidth={1} />
            <p className="font-display text-2xl italic">Loading orders...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-4 bg-rose-50 rounded-2xl border border-rose-100 p-8 text-center max-w-2xl mx-auto mt-10">
            <AlertCircle size={48} strokeWidth={1} />
            <p className="font-display text-2xl font-semibold mb-2 italic">Orders Sync Failed</p>
            <p className="text-sm opacity-80 mb-4">Ensure PHP server is running at {API}<code className="block mt-2 bg-rose-200/50 p-2 rounded text-xs">php -S localhost:8000 -t api/</code></p>
            <button onClick={fetchOrders} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px]">Retry</button>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="page-header mb-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-white border border-[#041E18]/5 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-sm">
                            <Package size={24} strokeWidth={2} />
                        </div>
                        <h1 className="font-['Poppins',sans-serif] text-[42px] font-bold text-[#041E18] tracking-[-0.03em] leading-tight italic">Order <span className="text-[#D4AF37]">Management</span></h1>
                    </div>
                    <p className="font-['Inter',sans-serif] text-base text-gray-400 font-medium tracking-wide border-l-2 border-[#D4AF37]/20 pl-4 max-w-xl">Manage all your store orders and fulfillment. <span className="text-[#041E18] font-bold">{total} total orders</span> recorded.</p>
                </div>

                <button
                    onClick={exportCSV}
                    className="group relative flex items-center gap-3 px-10 py-5 bg-white border border-[#041E18]/5 text-[#041E18] rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:shadow-2xl hover:border-[#D4AF37]/20 transition-all duration-500 hover:-translate-y-1 active:scale-95"
                >
                    <Download size={18} strokeWidth={2.5} className="text-[#D4AF37] group-hover:bounce" />
                    Export to CSV
                </button>
            </div>

            {/* Filter Suite */}
            <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-[32px] border border-[#041E18]/5 shadow-sm">
                <div className="relative flex-1 min-w-[340px] group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#041E18]/5 text-[#041E18]/30 group-focus-within:text-[#D4AF37] group-focus-within:bg-[#D4AF37]/10 transition-all duration-300">
                        <Search size={16} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by order ID, customer name or email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-16 pr-6 py-4 bg-[#041E18]/[0.02] rounded-[20px] border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all placeholder:text-gray-300"
                    />
                </div>

                <div className="relative min-w-[200px]">
                    <select
                        className="w-full appearance-none px-6 py-4 bg-[#041E18]/[0.02] rounded-[20px] border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-xs font-black uppercase tracking-widest text-[#041E18] outline-none transition-all cursor-pointer"
                        value={statusFilter}
                        onChange={e => { setStatus(e.target.value); setPage(1); }}
                    >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s} Status</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D4AF37] rotate-90 pointer-events-none" />
                </div>
            </div>

            {/* Data Table */}
            <div className="card">
                <div className="table-container">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#041E18]/5">
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Order ID</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Customer Info</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Order Date</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Items</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Total Amount</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Payment</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Status</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#041E18]/5 font-['Inter',sans-serif]">
                            {orders.map((o, i) => (
                                <motion.tr
                                    key={o.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-[#FBFAF7] transition-all duration-300 group cursor-default"
                                >
                                    <td className="px-10 py-7">
                                        <p className="text-[11px] font-black text-[#041E18] font-mono tracking-tighter">#{o.order_number}</p>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-[#041E18] group-hover:text-[#D4AF37] transition-colors">{o.customer_name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium tracking-wide">{o.customer_email}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                                            {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                        <p className="text-[9px] text-gray-300 font-mono mt-1">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#041E18]/10" />
                                            <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{o.item_count} Items</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <p className="text-sm font-black text-[#041E18] font-['Poppins',sans-serif]">₹{Number(o.total).toLocaleString()}</p>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="space-y-1">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm ${payBadge(o.payment_status)}`}>
                                                {o.payment_status}
                                            </span>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter ml-1">{o.payment_method}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm ${statusBadge(o.status)}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-7 text-right">
                                        <button
                                            onClick={() => openDetail(o)}
                                            className="p-3 text-[#041E18]/40 hover:text-[#D4AF37] hover:bg-white border border-transparent hover:border-[#D4AF37]/20 rounded-2xl transition-all shadow-sm group-hover:shadow-md"
                                        >
                                            <Eye size={18} strokeWidth={2.5} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Suite */}
                <div className="px-10 py-8 border-t border-[#041E18]/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 bg-[#FBFAF7] px-6 py-3 rounded-2xl border border-[#041E18]/5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Showing Results</p>
                        <div className="w-1 h-3 bg-[#D4AF37]/30 rounded-full" />
                        <p className="text-[11px] font-black text-[#041E18] uppercase tracking-widest">Showing {orders.length} of {total}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-4 text-[#D4AF37] disabled:text-gray-200 bg-white border border-[#041E18]/5 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-90"
                        >
                            <ChevronLeft size={18} strokeWidth={3} />
                        </button>

                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#041E18]/5 shadow-inner">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all duration-500 ${n === page ? 'bg-[#041E18] text-white shadow-xl shadow-[#041E18]/20 scale-110' : 'text-gray-400 hover:text-[#041E18] hover:bg-[#FBFAF7]'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-4 text-[#D4AF37] disabled:text-gray-200 bg-white border border-[#041E18]/5 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-90"
                        >
                            <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Order Detail Modal ──────────────────────────────────────── */}
            <AnimatePresence>
                {(detail || detailLoading) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-[#041E18]">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetail(null)} className="absolute inset-0 bg-[#041E18]/60 backdrop-blur-md" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden border border-[#041E18]/5 max-h-[90vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {detailLoading ? (
                                <div className="py-40 text-center space-y-6">
                                    <Loader2 size={48} className="animate-spin mx-auto text-[#D4AF37]" strokeWidth={2.5} />
                                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em]">Loading order details...</p>
                                </div>
                            ) : detail && (
                                <>
                                    <div className="px-10 py-10 bg-[#FBFAF7] border-b border-[#041E18]/5 flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white border border-[#041E18]/5 rounded-3xl flex items-center justify-center text-[#D4AF37] shadow-sm">
                                                <Package size={28} strokeWidth={2} />
                                            </div>
                                            <div>
                                                <h2 className="font-['Poppins',sans-serif] text-[32px] font-bold text-[#041E18] tracking-tight leading-none mb-2 italic">#{detail.order_number}</h2>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{new Date(detail.created_at).toLocaleString("en-IN")}</p>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm ${statusBadge(detail.status)}`}>{detail.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setDetail(null)} className="p-4 bg-white border border-[#041E18]/5 text-gray-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm"><X size={24} strokeWidth={2.5} /></button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                            {/* Left Column: Intelligence */}
                                            <div className="space-y-10">
                                                <div className="bg-[#FBFAF7] rounded-[32px] p-8 border border-[#041E18]/5 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                                                        <Users size={80} />
                                                    </div>
                                                    <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 border-b border-[#041E18]/5 pb-4">Customer Details</h3>
                                                    <div className="space-y-5 relative z-10">
                                                        <p className="text-xl font-bold text-[#041E18]">{detail.customer_name}</p>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 text-sm font-bold text-[#041E18]/70"><div className="p-2 bg-white rounded-lg shadow-sm"><Mail size={14} className="text-[#D4AF37]" /></div> {detail.customer_email}</div>
                                                            {detail.customer_phone && <div className="flex items-center gap-3 text-sm font-bold text-[#041E18]/70"><div className="p-2 bg-white rounded-lg shadow-sm"><Phone size={14} className="text-[#D4AF37]" /></div> {detail.customer_phone}</div>}
                                                            <div className="flex items-start gap-3 text-sm font-bold text-[#041E18]/70">
                                                                <div className="p-2 bg-white rounded-lg shadow-sm mt-1"><MapPin size={14} className="text-[#D4AF37]" /></div>
                                                                <span className="leading-relaxed">{detail.shipping_address}{detail.shipping_city ? `, ${detail.shipping_city}` : ""}{detail.shipping_state ? `, ${detail.shipping_state}` : ""}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">Order Items <div className="h-px flex-1 bg-gray-100" /></h3>
                                                    <div className="space-y-4">
                                                        {detail.items?.map(item => (
                                                            <div key={item.id} className="group flex items-center gap-6 p-4 bg-white hover:bg-[#FBFAF7] border border-[#041E18]/5 rounded-[24px] transition-all duration-300 shadow-sm hover:shadow-md">
                                                                <div className="w-16 h-16 bg-[#041E18]/5 rounded-2xl overflow-hidden shrink-0 border border-[#041E18]/5">
                                                                    {item.image_path ? <img src={`${API}/${item.image_path}`} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <Package size={20} className="m-auto text-gray-300 mt-5" />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-[13px] font-bold text-[#041E18] leading-tight mb-1">{item.product_name}</p>
                                                                    <div className="flex items-center gap-3">
                                                                        <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.1em]">{item.product_sku}</p>
                                                                        <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                                        <p className="text-[10px] font-bold text-gray-400">Qty: {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm font-black text-[#041E18] font-['Poppins',sans-serif]">₹{Number(item.total_price).toLocaleString()}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Decisions */}
                                            <div className="space-y-10">
                                                <div className="bg-white rounded-[32px] p-8 border border-[#041E18]/5 shadow-sm space-y-6">
                                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Payment Summary</h3>
                                                    <div className="space-y-4 font-['Inter',sans-serif]">
                                                        <div className="flex justify-between text-sm font-medium text-gray-400"><span>Subtotal</span><span className="font-bold text-[#041E18]">₹{Number(detail.subtotal).toLocaleString()}</span></div>
                                                        <div className="flex justify-between items-center py-4 border-y border-[#041E18]/5">
                                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                                                            <span className="text-2xl font-black text-[#041E18] font-['Poppins',sans-serif] italic">₹{Number(detail.total).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center bg-[#FBFAF7] p-4 rounded-2xl">
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                                                                <p className="text-[11px] font-bold text-[#041E18]">{detail.payment_method}</p>
                                                            </div>
                                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${payBadge(detail.payment_status).replace('bg-', 'bg-white border border-[#041E18]/5 ').replace('text-', 'text-')}`}>
                                                                {detail.payment_status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-[#041E18] to-[#041E18]/90 text-white rounded-[40px] p-8 space-y-8 shadow-2xl shadow-[#041E18]/20">
                                                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                                        <div className="w-12 h-12 bg-[#D4AF37] text-[#041E18] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                                                            <CheckCircle size={24} strokeWidth={2.5} />
                                                        </div>
                                                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Update Status</h3>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Order Status</label>
                                                            <div className="relative group">
                                                                <select
                                                                    value={updateStatus}
                                                                    onChange={e => setUpdateStatus(e.target.value)}
                                                                    className="w-full appearance-none px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white outline-none transition-all cursor-pointer"
                                                                >
                                                                    {ORDER_STATUSES.filter(s => s !== "All").map(s => <option key={s} value={s} className="text-[#041E18]">{s}</option>)}
                                                                </select>
                                                                <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D4AF37] rotate-90" />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Tracking Number</label>
                                                            <input
                                                                type="text"
                                                                value={trackingNum}
                                                                onChange={e => setTrackingNum(e.target.value)}
                                                                placeholder="Optional Ref..."
                                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-[#D4AF37]/30 focus:bg-white/10 rounded-2xl text-[13px] font-bold text-white outline-none transition-all placeholder:text-gray-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    {updateMsg && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex items-center gap-4 p-5 rounded-[24px] border ${updateMsg.startsWith("✓") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${updateMsg.startsWith("✓") ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"}`}>
                                                                {updateMsg.startsWith("✓") ? <CheckCircle size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
                                                            </div>
                                                            <span className="text-[11px] font-black uppercase tracking-widest">{updateMsg}</span>
                                                        </motion.div>
                                                    )}

                                                    <button
                                                        onClick={handleUpdateStatus}
                                                        disabled={saving}
                                                        className="w-full py-5 bg-gradient-to-r from-[#D4AF37] to-[#B48C5E] text-white rounded-[24px] font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-gold/30 hover:shadow-gold/50 transition-all duration-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                                                    >
                                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Package size={18} className="group-hover:scale-110 transition-transform" strokeWidth={2.5} />}
                                                        {saving ? "Saving..." : "Save Changes"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
