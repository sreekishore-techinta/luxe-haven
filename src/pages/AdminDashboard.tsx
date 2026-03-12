import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    TrendingUp, ShoppingBag, Users, DollarSign, ArrowUpRight,
    ArrowDownRight, Package, Calendar, Filter, Loader2, AlertCircle,
    ShoppingBasket, Clock
} from "lucide-react";

const API = "http://localhost:8000";

const iconMap: Record<string, any> = { DollarSign, ShoppingBag, Users, TrendingUp };

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

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API}/dashboard/index.php`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setData(json.data);
            else throw new Error(json.message);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Connection failed");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-8">
            <div className="relative">
                <Loader2 size={64} className="animate-spin text-[#B48C5E] opacity-20" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#B48C5E] rounded-full animate-pulse shadow-[0_0_15px_#B48C5E]" />
                </div>
            </div>
            <p className="font-['Poppins',sans-serif] text-xl font-light tracking-wide text-gray-400">Loading dashboard data...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-6 bg-white rounded-[32px] border border-rose-100 p-12 text-center max-w-2xl mx-auto mt-10 shadow-xl shadow-rose-500/5">
            <div className="p-5 bg-rose-50 rounded-2xl text-rose-500 border border-rose-100 shadow-inner">
                <AlertCircle size={40} strokeWidth={1.5} />
            </div>
            <div>
                <p className="font-['Poppins',sans-serif] text-2xl font-bold mb-2 text-rose-900 tracking-tight">Connection Error</p>
                <p className="text-sm text-rose-600/70 mb-8 max-w-sm mx-auto leading-relaxed font-medium">Could not connect to the server. Please check your PHP server status.</p>

                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 text-left mb-8 shadow-inner">
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 ml-1">Terminal Command</p>
                    <code className="text-[11px] font-mono text-rose-700 bg-white/50 px-3 py-2 rounded-lg block">php -S localhost:8000 -t api/</code>
                </div>

                <button onClick={fetchData} className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-[18px] font-bold uppercase tracking-[0.15em] text-[11px] transition-all shadow-lg shadow-rose-600/20 active:scale-95">Retry Connection</button>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="font-['Poppins',sans-serif] text-[42px] font-bold text-[#041E18] tracking-[-0.03em] leading-tight mb-2">Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#B48C5E] italic">Overview</span></h1>
                    <p className="font-['Inter',sans-serif] text-base text-gray-400 font-medium tracking-wide">View your store's performance and analytics.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-[24px] border border-[#041E18]/5 shadow-sm shadow-[#041E18]/5">
                    <div className="p-3.5 bg-gradient-to-br from-[#041E18] to-[#0D3B2E] rounded-2xl text-white shadow-lg shadow-[#041E18]/10"><Calendar size={20} strokeWidth={2} /></div>
                    <div className="pr-6">
                        <p className="text-[10px] font-extrabold text-[#B48C5E] uppercase tracking-[0.2em] mb-0.5">Overview</p>
                        <p className="text-sm font-bold text-[#041E18]">March 2026 Overview</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {data.stats.map((stat: any, i: number) => {
                    const Icon = iconMap[stat.icon] || DollarSign;
                    const pathMap: Record<string, string> = {
                        "Total Revenue": "/admin/orders",
                        "New Orders": "/admin/orders",
                        "Active Customers": "/admin/customers",
                        "Sales Velocity": "/admin/orders"
                    };
                    const path = pathMap[stat.title] || "/admin";

                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                            <Link to={path} className="group relative block bg-white p-7 rounded-[36px] border border-[#041E18]/5 hover:border-[#D4AF37]/30 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#B48C5E]/5">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/5 to-transparent rounded-bl-full transition-all group-hover:scale-110" />

                                <div className="relative z-10 flex items-start justify-between mb-8">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color.replace('bg-', 'from-').replace('text-', '')} text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}><Icon size={22} /></div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                        {stat.isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />} {stat.change}
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-1.5">{stat.title}</p>
                                    <p className="font-['Poppins',sans-serif] text-4xl font-bold text-[#041E18] group-hover:text-[#B48C5E] transition-colors tracking-tight">{stat.value}</p>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Orders */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-[#041E18] tracking-tight">Recent Orders</h2>
                            <p className="text-xs font-medium text-gray-400 mt-1 italic font-['Inter',sans-serif]">Latest orders from your store</p>
                        </div>
                        <Link to="/admin/orders" className="flex items-center gap-2 group p-4 pr-1">
                            <span className="text-[11px] font-bold text-[#B48C5E] uppercase tracking-[0.2em] group-hover:translate-x-[-4px] transition-transform">View All Orders</span>
                            <div className="w-8 h-8 rounded-full border border-[#B48C5E]/20 flex items-center justify-center text-[#B48C5E] group-hover:bg-[#B48C5E] group-hover:text-white transition-all">
                                <ArrowUpRight size={14} />
                            </div>
                        </Link>
                    </div>

                    <div className="card">
                        <div className="table-container">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#041E18]/5">
                                        {["Order ID", "Customer", "Amount", "Status"].map(h => (
                                            <th key={h} className="px-8 py-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#041E18]/5 font-['Inter',sans-serif]">
                                    {data.recent_orders.map((order: any, i: number) => (
                                        <tr key={i} className="hover:bg-[#FDFCF9] transition-colors group cursor-default">
                                            <td className="px-8 py-6 font-mono text-xs font-bold text-[#041E18] group-hover:text-[#B48C5E] transition-colors">{order.order_number}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-all">
                                                        {order.customer_name?.[0]}
                                                    </div>
                                                    <p className="text-xs font-bold text-[#041E18]">{order.customer_name}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-extrabold text-[#041E18] font-['Poppins',sans-serif]">₹{Number(order.total).toLocaleString('en-IN')}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm transition-all duration-300 group-hover:scale-105 inline-block ${statusBadge(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Inventory Status */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-[#041E18] tracking-tight">Inventory Status</h2>
                            <p className="text-xs font-medium text-gray-400 mt-1 italic font-['Inter',sans-serif]">Current stock levels</p>
                        </div>
                        <Link to="/admin/products" className="p-2 text-[#041E18]/20 hover:text-[#B48C5E] transition-colors"><TooltipTrigger label="Manage Catalog"><Filter size={20} /></TooltipTrigger></Link>
                    </div>

                    <div className="bg-[#041E18] p-8 rounded-[40px] shadow-2xl shadow-[#041E18]/30 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-125 transition-transform duration-1000" />

                        {data.inventory.map((item: any, i: number) => {
                            const percent = (item.in_stock / item.total_products) * 100;
                            const isLow = item.low_stock > 0;
                            const accentColor = isLow ? "#D4AF37" : "#10B981";

                            return (
                                <div key={i} className="relative z-10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-[0.25em]">{item.category}</p>
                                            <p className="text-sm font-bold text-white tracking-wide">{item.total_stock} Units in Stock</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-black uppercase italic ${isLow ? 'text-[#D4AF37]' : 'text-emerald-400'}`}>
                                                {Math.round(percent)}% <span className="opacity-50 font-normal ml-1">In Stock</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                                            className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-colors"
                                            style={{ backgroundColor: accentColor }}
                                        />
                                    </div>

                                    {isLow && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
                                            <AlertCircle size={12} className="text-[#D4AF37]" />
                                            <span className="text-[9px] font-extrabold text-[#D4AF37] uppercase tracking-widest leading-none mt-0.5">{item.low_stock} Low stock items</span>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="pt-4 mt-4 border-t border-white/5">
                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-extrabold text-white/50 uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                                <ShoppingBasket size={14} /> Generate Restock List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TooltipTrigger = ({ children, label }: { children: React.ReactNode, label: string }) => (
    <div className="relative group/tooltip">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-[#041E18] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            {label}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#041E18]" />
        </div>
    </div>
);


