import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    TrendingUp, ShoppingBag, Users, DollarSign, ArrowUpRight,
    ArrowDownRight, Package, Calendar, Filter, Loader2, AlertCircle,
    ShoppingBasket, Clock
} from "lucide-react";

const API = "http://localhost/luxe-haven/api";

const iconMap: Record<string, any> = { DollarSign, ShoppingBag, Users, TrendingUp };

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
            <p className="font-['Poppins',sans-serif] text-xl font-black tracking-wide text-slate-800">Loading dashboard data...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-6 bg-white rounded-[32px] border border-rose-100 p-12 text-center max-w-2xl mx-auto mt-10 shadow-xl shadow-rose-500/5">
            <div className="p-5 bg-rose-50 rounded-2xl text-rose-500 border border-rose-100 shadow-inner">
                <AlertCircle size={40} strokeWidth={1.5} />
            </div>
            <div>
                <p className="font-['Poppins',sans-serif] text-2xl font-black mb-2 text-rose-950 tracking-tight">Connection Error</p>
                <p className="text-sm text-rose-700 mb-8 max-w-sm mx-auto leading-relaxed font-black">Could not connect to the server. Please check your PHP server status.</p>

                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 text-left mb-8 shadow-inner">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 ml-1">Terminal Command</p>
                    <code className="text-[11px] font-mono font-black text-rose-800 bg-white/50 px-3 py-2 rounded-lg block">php -S localhost:8000 -t api/</code>
                </div>

                <button onClick={fetchData} className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-[18px] font-bold uppercase tracking-[0.15em] text-[11px] transition-all shadow-lg shadow-rose-600/20 active:scale-95">Retry Connection</button>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-800 mt-1 font-black italic">Welcome back to your command center.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                    <Calendar size={18} className="text-slate-500" strokeWidth={2.5} />
                    <span className="text-sm font-black text-slate-950">March 17, 2026</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {data.stats.map((stat: any, i: number) => {
                    const Icon = iconMap[stat.icon] || DollarSign;
                    const pathMap: Record<string, string> = {
                        "Total Revenue": "/admin/orders",
                        "New Orders": "/admin/orders",
                        "Active Customers": "/admin/customers",
                        "Total Products": "/admin/products"
                    };
                    const path = pathMap[stat.title] || "/admin";

                    const colorMap: Record<string, string> = {
                        'bg-blue-50 text-blue-600': 'text-blue-600 bg-blue-50',
                        'bg-emerald-50 text-emerald-600': 'text-emerald-600 bg-emerald-50',
                        'bg-orange-50 text-orange-600': 'text-orange-600 bg-orange-50',
                        'bg-purple-50 text-purple-600': 'text-purple-600 bg-purple-50',
                    };
                    const colorClass = colorMap[stat.color] || 'text-slate-600 bg-slate-50';

                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <Link to={path} className="block group bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#D4AF37]/40 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-xl ${colorClass}`}>
                                        <Icon size={22} />
                                    </div>
                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${stat.isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                        {stat.isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                                        {stat.change}
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">{stat.title}</p>
                                    <p className="text-2xl font-black text-slate-950 mt-1">{stat.value}</p>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Main Content Scroll Area */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pt-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-950">Recent Transactions</h2>
                        <Link to="/admin/orders" className="text-xs font-black text-[#D4AF37] hover:underline uppercase tracking-widest">View All Orders</Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-950">Order ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-950">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-950">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-950">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.recent_orders.map((order: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-black text-slate-950">{order.order_number}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-[#D4AF37]">
                                                        {order.customer_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-950">{order.customer_name}</p>
                                                        <p className="text-[10px] text-slate-700 font-extrabold">{order.customer_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-black text-slate-950">
                                                ₹{Number(order.total).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusBadge(order.status)}`}>
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

                {/* Stock Analytics */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-950">Inventory Health</h2>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                        {data.inventory.map((item: any, i: number) => {
                            const percent = (item.in_stock / item.total_products) * 100;
                            const isLow = item.low_stock > 0;

                            return (
                                <div key={i} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{item.category}</p>
                                            <p className="text-sm font-black text-slate-950 mt-0.5">{item.total_stock} Units</p>
                                        </div>
                                        <span className={`text-xs font-black ${isLow ? 'text-amber-600' : 'text-emerald-700'}`}>
                                            {Math.round(percent)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        />
                                    </div>
                                    {isLow && (
                                        <div className="flex items-center gap-2 text-amber-700 pb-1">
                                            <AlertCircle size={10} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{item.low_stock} entries low in stock</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <Link to="/admin/products" className="w-full py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 translate-y-2">
                            Manage Inventory
                        </Link>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}


