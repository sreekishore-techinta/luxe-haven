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
    const [selectedOrder, setSelectedOrder] = useState<(Order & { items: any[] }) | null>(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [shipStatus, setShipStatus] = useState("");
    const [shipDate, setShipDate] = useState("");
    const [shipDetails, setShipDetails] = useState("");
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

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

    const handleViewOrder = async (id: number) => {
        setViewLoading(true);
        try {
            const res = await fetch(`${API}/orders/order.php?id=${id}`);
            const json = await res.json();
            if (json.status === "success") {
                setSelectedOrder(json.data);
            }
        } catch (e) {
            toast.error("Failed to load order details");
        } finally {
            setViewLoading(false);
        }
    };

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
                                        <button onClick={() => handleViewOrder(o.id)}
                                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all">
                                            {viewLoading && selectedOrder?.id !== o.id ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                                        </button>
                                        <button onClick={() => setDeleteTargetId(o.id)}
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

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">

                            {/* Modal Header */}
                            <div className="shrink-0 px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">Order #{selectedOrder.order_number}</h2>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.25em] mt-1">Order Registry Analysis</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100"><X size={20} strokeWidth={3} /></button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                                <div className="grid md:grid-cols-2 gap-10">
                                    {/* Customer & Payment Info */}
                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Customer Credentials</h3>
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#D4AF37] border border-slate-200 font-black shadow-sm text-lg">{selectedOrder.customer_name[0]}</div>
                                                    <div>
                                                        <p className="text-base font-black text-slate-950">{selectedOrder.customer_name}</p>
                                                        <p className="text-xs font-bold text-slate-500">{selectedOrder.customer_email}</p>
                                                        <p className="text-xs font-bold text-slate-500">{selectedOrder.customer_phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Payment Intelligence</h3>
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Method</p>
                                                    <p className="text-sm font-black text-slate-950">{selectedOrder.payment_method}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                                    <p className="text-sm font-black text-slate-950">{selectedOrder.payment_status}</p>
                                                </div>
                                                <div className="col-span-2 pt-4 border-t border-slate-200">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Payment ID</p>
                                                    <p className="text-xs font-bold font-mono text-slate-700">{selectedOrder.payment_id || "NOT PROVIDED"}</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Logistics & Manifest */}
                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Logistics Manifest</h3>
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                        <Truck size={10} /> Destination
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-950 leading-relaxed italic">{selectedOrder.shipping_address}</p>
                                                    <p className="text-sm font-black text-slate-950 mt-1">{selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}</p>
                                                </div>
                                                <div className="pt-4 border-t border-slate-200">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pipeline Status</span>
                                                        {statusBadge(selectedOrder.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Order Summary</h3>
                                            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
                                                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span>Subtotal</span>
                                                    <span>₹{(Number(selectedOrder.total) - 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest">
                                                    <span>Logistics</span>
                                                    <span>₹0</span>
                                                </div>
                                                <div className="pt-3 border-t border-white/10 flex justify-between items-center mt-2">
                                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Total Amount</span>
                                                    <span className="text-2xl font-black">₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                {/* Items Registry */}
                                <section className="pt-10 border-t border-slate-100">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Inventory Manifest</h3>
                                    <div className="bg-slate-50 rounded-[32px] border border-slate-200 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-white border-b border-slate-200">
                                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Asset</th>
                                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Item Name</th>
                                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center">Qty</th>
                                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-white transition-colors">
                                                        <td className="px-8 py-4">
                                                            <div className="w-12 h-16 rounded-lg bg-slate-200 overflow-hidden border border-slate-200 shadow-inner">
                                                                {item.image_path ? (
                                                                    <img src={`http://localhost/luxe-haven/${item.image_path}`} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-400"><Package size={16} /></div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <p className="text-sm font-black text-slate-950">{item.product_name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 font-mono italic">{item.product_sku}</p>
                                                        </td>
                                                        <td className="px-8 py-4 text-center text-sm font-black text-slate-950">x {item.quantity}</td>
                                                        <td className="px-8 py-4 text-right text-sm font-black text-slate-950">₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTargetId !== null && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteTargetId(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ type: "spring", stiffness: 340, damping: 28 }}
                            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            {/* Icon */}
                            <div className="flex flex-col items-center pt-10 pb-6 px-8">
                                <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
                                    <Trash2 size={28} className="text-rose-500" strokeWidth={2} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Delete Order?</h2>
                                <p className="text-sm text-slate-400 font-medium text-center leading-relaxed">
                                    This will permanently delete this order record.<br />This action cannot be undone.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="px-8 pb-8 space-y-3">
                                <button
                                    onClick={() => { handleDeleteOrder(deleteTargetId!); setDeleteTargetId(null); }}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300 active:scale-[0.98]"
                                >
                                    <Trash2 size={14} strokeWidth={3} /> DELETE
                                </button>
                                <button
                                    onClick={() => setDeleteTargetId(null)}
                                    className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-700 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
