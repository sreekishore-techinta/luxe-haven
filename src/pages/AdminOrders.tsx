import { useState, useEffect } from "react";
import {
    Search, Eye, Trash2, Check, Filter, Loader2, Edit3, ShoppingBag, Package,
    Truck, CheckCircle, XCircle, AlertTriangle, X, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const API = "http://localhost/luxe-haven/api";

type Order = {
    id: number;
    order_number: string;
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_pincode: string;
    total: number;
    payment_method: string;
    payment_status: string;
    payment_id: string | null;
    payment_notes: string | null;
    status: string;
    tracking_number: string | null;
    shipping_phone: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    shipping_date: string | null;
    shipping_details?: string;
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");

    // For shipping update form in the table
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [shipStatus, setShipStatus] = useState("");
    const [shipDate, setShipDate] = useState("");
    const [shipDetails, setShipDetails] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const url = statusFilter !== "All"
                ? `${API}/orders/index.php?status=${statusFilter}`
                : `${API}/orders/index.php`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.status === "success") {
                setOrders(json.data);
            }
        } catch (e) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleConfirmShipping = async (orderId: number) => {
        try {
            const res = await fetch(`${API}/orders/order.php?id=${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: shipStatus,
                    shipping_date: shipDate, // We'll need to handle these in the backend
                    tracking_number: shipDetails
                })
            });
            const json = await res.json();
            if (json.status === "success") {
                toast.success("Order status updated");
                setUpdatingId(null);
                fetchOrders();
            }
        } catch (e) {
            toast.error("Update failed");
        }
    };

    const handleDeleteOrder = async (id: number) => {
        try {
            const res = await fetch(`${API}/orders/order.php?id=${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.status === "success") {
                toast.success("Order record purged successfully");
                fetchOrders();
            }
        } catch (e) {
            toast.error("Operation failed");
        }
    };

    const statusBadge = (s: string) => {
        const m: Record<string, { cls: string, icon: any }> = {
            Delivered: { cls: "bg-emerald-50 text-emerald-800 border-emerald-200 font-black", icon: CheckCircle },
            Processing: { cls: "bg-blue-50 text-blue-800 border-blue-200 font-black", icon: Package },
            Shipped: { cls: "bg-purple-50 text-purple-800 border-purple-200 font-black", icon: Truck },
            Pending: { cls: "bg-amber-50 text-amber-800 border-amber-200 font-black", icon: AlertTriangle },
            Cancelled: { cls: "bg-rose-50 text-rose-800 border-rose-200 font-black", icon: XCircle },
        };
        const res = m[s] ?? { cls: "bg-gray-50 text-gray-700 border-gray-200 font-black", icon: ShoppingBag };
        const Icon = res.icon;
        return (
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${res.cls}`}>
                <Icon size={12} strokeWidth={3} /> {s}
            </span>
        );
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Order Fulfillment</h1>
                    <div className="flex items-center gap-2 mt-2 text-xs font-black text-slate-600">
                        <Link to="/admin" className="hover:text-[#D4AF37] transition-colors">DASHBOARD</Link>
                        <ChevronRight size={14} className="opacity-70" strokeWidth={3} />
                        <span className="text-slate-950">ORDERS</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Filter Suite */}
                    <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm mb-6">
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-[#D4AF37]/50 transition-all">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-950 placeholder:text-slate-400 w-full sm:w-64"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-[#0F172A] text-white border-none rounded-2xl pl-6 pr-12 py-3 text-xs font-bold uppercase tracking-widest focus:ring-0 cursor-pointer shadow-lg shadow-slate-200 hover:bg-[#1E293B] transition-all"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <Filter size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Manifest Section */}
            <div className="bg-white rounded-[40px] border border-[#041E18]/5 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><ShoppingBag size={18} /></div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Order Pipeline</h2>
                    </div>
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                        {orders.length} ACTIVE RECORDS
                    </span>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar relative">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Order ID</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Date & Payment</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Customer</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm">Total Price</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm text-center">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50/95 backdrop-blur-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={6} className="py-32 text-center text-slate-400 italic text-sm">No orders found.</td></tr>
                            ) : orders.map((o, i) => (
                                <tr key={o.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-8">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ID: #{o.id}</p>
                                        <p className="text-sm font-black text-slate-950">{o.order_number}</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="text-xs font-black text-slate-700 mb-2">
                                            {new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded inline-block border border-slate-200">{o.payment_id || "OFFLINE"}</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="text-sm font-black text-slate-950">{o.customer_name}</p>
                                                <p className="text-xs font-bold text-slate-500">{o.customer_email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-base font-black text-slate-950">₹{Number(o.total).toLocaleString('en-IN')}</p>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{o.payment_method}</span>
                                    </td>
                                    <td className="px-8 py-8">
                                        {updatingId === o.id ? (
                                            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 min-w-[200px] shadow-xl">
                                                <select value={shipStatus} onChange={e => setShipStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#D4AF37]">
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                                <input type="date" value={shipDate} onChange={e => setShipDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleConfirmShipping(o.id)} className="flex-1 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all">Update</button>
                                                    <button onClick={() => setUpdatingId(null)} className="px-3 py-2 bg-slate-100 text-slate-400 rounded-lg"><X size={14} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {statusBadge(o.status)}
                                                <button onClick={() => { setUpdatingId(o.id); setShipStatus(o.status); setShipDetails(o.tracking_number || ""); setShipDate(o.shipping_date || ""); }}
                                                    className="flex items-center gap-1.5 text-[10px] font-black text-[#D4AF37] uppercase tracking-widest hover:text-slate-950 transition-colors">
                                                    <Edit3 size={10} strokeWidth={3} /> Update Status
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-8 text-right space-x-2">
                                        <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all"><Eye size={16} /></button>
                                        <button onClick={() => { if (window.confirm("Purge this record?")) handleDeleteOrder(o.id); }}
                                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Pagination (Draft) */}
            <div className="px-8 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">End of pipeline</p>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Records shown: {orders.length}</span>
                </div>
            </div>
        </div>
    );
}
