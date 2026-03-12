import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, ShoppingBag, Users, Settings,
    Bell, Search, Menu, X, LogOut, Loader2, Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "General Master", path: "/admin/general-master", icon: Database },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Settings", path: "/admin/settings", icon: Settings },
];

const API = "http://localhost:8000";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [admin, setAdmin] = useState<any>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const localUser = localStorage.getItem("admin_user");
                if (!localUser) throw new Error("No session");

                const res = await fetch(`${API}/auth/check.php`, { credentials: "include" });
                const json = await res.json();
                if (json.authenticated) {
                    setAdmin(json.admin);
                } else {
                    throw new Error("Session expired");
                }
            } catch (err) {
                localStorage.removeItem("admin_user");
                navigate("/admin/login");
            } finally {
                setAuthLoading(false);
            }
        };
        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch(`${API}/auth/logout.php`, { credentials: "include" });
            localStorage.removeItem("admin_user");
            navigate("/admin/login");
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    if (authLoading) return (
        <div className="min-h-screen bg-[#FBFAF7] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#B48C5E]" size={40} />
        </div>
    );

    return (
        <div className="layout-container min-h-screen bg-[#FBFAF7] font-['Inter',sans-serif]">
            {/* Sidebar */}
            <aside className={`sidebar bg-[#041E18] text-white flex flex-col z-50 ${!sidebarOpen ? 'collapsed' : ''}`}>
                <div className="h-24 px-8 flex items-center justify-between border-b border-white/5">
                    <AnimatePresence mode="wait">
                        {sidebarOpen ? (
                            <motion.div key="logo" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                className="font-['Poppins',sans-serif] text-xl font-semibold tracking-tight flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-[#D4AF37] to-[#B48C5E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-gold/20">L</div>
                                <span className="text-white/90">LuxeHaven <span className="text-[#D4AF37]">Admin</span></span>
                            </motion.div>
                        ) : (
                            <motion.div key="logo-s" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B48C5E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-gold/20 mx-auto font-bold">L</motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                    {adminLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        const Icon = link.icon;
                        return (
                            <Link key={link.path} to={link.path}
                                className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative ${isActive
                                    ? "bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-white border-l-4 border-[#D4AF37]"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}>
                                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? "bg-[#D4AF37] text-white shadow-lg shadow-gold/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                {sidebarOpen && (
                                    <span className={`text-sm tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>
                                        {link.name}
                                    </span>
                                )}
                                {isActive && sidebarOpen && (
                                    <motion.div layoutId="active-pill" className="absolute right-4 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 space-y-4">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all group">
                        <div className="p-2 bg-white/5 group-hover:bg-rose-500/10 rounded-xl transition-all">
                            <LogOut size={18} />
                        </div>
                        {sidebarOpen && <span className="text-sm font-semibold tracking-wide">Log Out</span>}
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 text-white/50"
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={`main-content flex flex-col min-h-screen ${!sidebarOpen ? 'expanded' : ''}`}>
                <header className="h-24 sticky top-0 z-40 px-10 flex items-center justify-between">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border-b border-[#041E18]/5" />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const query = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
                            if (query) navigate(`/admin/products?search=${encodeURIComponent(query)}`);
                        }}
                        className="relative z-10 hidden md:flex items-center bg-[#041E18]/5 border border-transparent rounded-2xl px-6 py-3 w-96 group focus-within:bg-white focus-within:border-[#D4AF37]/30 focus-within:shadow-xl focus-within:shadow-gold/5 transition-all"
                    >
                        <Search size={18} className="text-[#041E18]/20 group-focus-within:text-[#D4AF37] transition-colors" />
                        <input
                            name="search"
                            type="text"
                            placeholder="Universal search..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full ml-4 placeholder:text-gray-400 text-gray-700 font-medium"
                        />
                        <div className="hidden group-focus-within:flex items-center gap-1 ml-2">
                            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 text-[10px] text-gray-400 font-mono shadow-sm bg-white">ESC</kbd>
                        </div>
                    </form>

                    <div className="relative z-10 flex items-center gap-10">
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative group p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-[#D4AF37]"
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full shadow-sm" />
                            </button>

                            <AnimatePresence>
                                {notificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-0" onClick={() => setNotificationsOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
                                        >
                                            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-[#FBFAF7]/50">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-[#041E18]">Recent Syncs</h3>
                                                <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-black rounded-full">3 NEW</span>
                                            </div>
                                            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                                                {[
                                                    { title: "New Order Received", msg: "Order #8429 just placed by Priya S.", time: "2 mins ago", type: "order" },
                                                    { title: "Inventory Alert", msg: "Pure Silk Sarees are running low on stock.", time: "45 mins ago", type: "stock" },
                                                    { title: "System Synchronized", msg: "Cloud registry updated successfully.", time: "3 hours ago", type: "system" }
                                                ].map((n, i) => (
                                                    <div key={i} className="px-6 py-5 hover:bg-[#FBFAF7] transition-colors border-b border-gray-50 last:border-0 cursor-pointer group">
                                                        <p className="text-[11px] font-bold text-[#041E18] mb-1 group-hover:text-[#D4AF37] transition-colors">{n.title}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-2">{n.msg}</p>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">{n.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#041E18] hover:bg-gray-50 transition-all border-t border-gray-50">
                                                View All Activity
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-5 pl-10 border-l border-gray-100">
                            <div className="text-right flex flex-col justify-center">
                                <p className="text-sm font-bold text-[#041E18]">{admin?.name || "Admin Panel"}</p>
                                <p className="text-[10px] text-[#B48C5E] font-extrabold uppercase tracking-[0.15em]">{admin?.role?.replace("_", " ") || "Administrator"}</p>
                            </div>

                        </div>
                    </div>
                </header>

                <div className="p-[30px] w-full max-w-[1300px] mx-auto min-h-screen">
                    {children}
                </div>
            </main>

            <style>{`
                body {
                    overflow-x: hidden;
                }
                .layout-container {
                    display: flex;
                }
                .sidebar {
                    width: 260px;
                    position: fixed;
                    left: 0;
                    top: 0;
                    height: 100vh;
                    transition: transform 0.3s ease;
                }
                .main-content {
                    margin-left: 260px;
                    padding: 30px;
                    width: calc(100% - 260px);
                    transition: margin-left 0.3s ease, width 0.3s ease;
                }
                table {
                    width: 100%;
                }
                .table-container {
                    overflow-x: auto;
                }
                .actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    justify-content: flex-start;
                }
                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                @media (max-width: 1024px) {
                    .sidebar.collapsed {
                        transform: translateX(-100%);
                    }
                    .main-content.expanded {
                        margin-left: 0;
                        width: 100%;
                    }
                    .sidebar {
                        transform: translateX(-100%);
                    }
                    .main-content {
                        margin-left: 0;
                        width: 100%;
                    }
                    .sidebar:not(.collapsed) {
                        transform: translateX(0);
                    }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
};


export default AdminLayout;

