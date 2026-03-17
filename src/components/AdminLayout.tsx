import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, ShoppingBag, Users, Settings,
    Bell, Search, Menu, X, LogOut, Loader2, Database, Camera, Layers,
    ChevronsLeft, ChevronsRight, PanelLeftClose, ChevronDown, ChevronRight, List, Tag, Palette, Scissors, Maximize
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    {
        name: "General Master",
        path: "/admin/general-master",
        icon: Database,
        subItems: [
            { name: "Categories", path: "/admin/general-master?type=categories", icon: List },
            { name: "Saree Styles", path: "/admin/general-master?type=saree_types", icon: Tag },
            { name: "Colours", path: "/admin/general-master?type=colours", icon: Palette },
            { name: "Fabric Types", path: "/admin/general-master?type=fabric_types", icon: Scissors },
            { name: "Sizes", path: "/admin/general-master?type=sizes", icon: Maximize },
        ]
    },
    { name: "Product Master", path: "/admin/products", icon: Package },
    { name: "Blouse Styles", path: "/admin/blouse-styles", icon: Camera },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Settings", path: "/admin/settings", icon: Settings },
];

const API = "http://localhost:8000";

const SidebarLink = ({ link, sidebarOpen, onCloseMobile }: { link: any, sidebarOpen: boolean, onCloseMobile?: () => void }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = location.pathname === link.path || (link.path !== "/admin" && location.pathname.startsWith(link.path));
    const Icon = link.icon;
    const hasSubItems = link.subItems && link.subItems.length > 0;

    useEffect(() => {
        if (isActive && hasSubItems) setIsOpen(true);
    }, [isActive, hasSubItems]);

    const handleClick = (e: React.MouseEvent) => {
        if (hasSubItems && sidebarOpen) {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else {
            onCloseMobile?.();
        }
    };

    return (
        <div className="w-full">
            <Link
                to={link.path}
                onClick={handleClick}
                className={`group flex items-center rounded-xl transition-all duration-200 ${sidebarOpen ? "px-4 py-3 gap-3" : "p-2.5 justify-center"
                    } ${isActive && !hasSubItems
                        ? "bg-[#0F172A] text-white shadow-lg shadow-slate-200"
                        : isActive && hasSubItems
                            ? "bg-slate-50 text-slate-900"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}>
                <div className={`p-1.5 rounded-lg ${isActive ? "text-[#D4AF37]" : "group-hover:text-slate-950 text-slate-500"}`}>
                    <Icon size={20} strokeWidth={isActive ? 3 : 2.5} />
                </div>
                {sidebarOpen && (
                    <>
                        <span className={`text-sm tracking-tight ${isActive ? "font-black text-slate-950" : "font-black text-slate-700 hover:text-slate-950"}`}>
                            {link.name}
                        </span>
                        {hasSubItems && (
                            <div className="ml-auto text-slate-500 group-hover:text-slate-950">
                                {isOpen ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
                            </div>
                        )}
                    </>
                )}
                {isActive && sidebarOpen && !hasSubItems && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                )}
            </Link>

            {/* Sub Items */}
            <AnimatePresence>
                {hasSubItems && isOpen && sidebarOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-1 ml-4 space-y-1 border-l border-slate-100"
                    >
                        {link.subItems.map((sub: any) => {
                            const isSubActive = location.pathname + location.search === sub.path;
                            const SubIcon = sub.icon;
                            return (
                                <Link
                                    key={sub.path}
                                    to={sub.path}
                                    onClick={onCloseMobile}
                                    className={`flex items-center gap-3 px-6 py-2 rounded-lg text-xs transition-all ${isSubActive
                                        ? "text-slate-950 font-black"
                                        : "text-slate-700 font-bold hover:text-slate-950 hover:bg-slate-50"
                                        }`}
                                >
                                    <SubIcon size={14} strokeWidth={3} className={isSubActive ? "text-[#D4AF37]" : "text-slate-400 opacity-60"} />
                                    {sub.name}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [admin, setAdmin] = useState<any>(null);
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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-500" size={40} strokeWidth={3} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif] flex" style={{ overflowAnchor: 'none' }}>
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-[70] transition-[width] duration-300 lg:sticky top-0 h-screen ${sidebarOpen ? "w-72" : "w-20"} ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} shrink-0`}>
                <div className={`h-28 flex flex-col border-b border-slate-100 bg-white p-4 transition-all ${sidebarOpen ? "items-stretch" : "items-center"}`}>
                    <div className={`flex items-center gap-3 ${sidebarOpen ? "justify-between" : "justify-center mb-4"}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-[#D4AF37] font-bold shadow-sm shrink-0">L</div>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-black text-slate-950 tracking-tight whitespace-nowrap"
                                >
                                    LuxeHaven Admin
                                </motion.span>
                            )}
                        </div>

                        {/* Mobile Close Button */}
                        <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                            <X size={20} strokeWidth={3} />
                        </button>

                        {/* Desktop Toggle (visible when open) */}
                        {sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                title="Collapse Sidebar"
                            >
                                <ChevronsLeft size={18} strokeWidth={3} />
                            </button>
                        )}
                    </div>

                    {/* Desktop Toggle (visible when closed) */}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="hidden lg:flex w-full h-10 items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-[#D4AF37]"
                            title="Expand Sidebar"
                        >
                            <ChevronsRight size={18} strokeWidth={3} />
                        </button>
                    )}
                </div>

                <div className={`flex-1 flex flex-col h-[calc(100%-160px)] ${sidebarOpen ? "p-4" : "p-2"}`}>
                    <div className="space-y-1.5 pt-4">
                        {adminLinks.map((link) => (
                            <SidebarLink key={link.path} link={link} sidebarOpen={sidebarOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
                        ))}
                    </div>

                    <div className="mt-auto space-y-1.5 pt-8 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-black ${sidebarOpen ? "px-4 py-3 gap-3" : "p-2 justify-center"}`}
                            title="Logout"
                        >
                            <LogOut size={20} strokeWidth={3} />
                            {sidebarOpen && <span className="text-sm">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden" style={{ contain: 'layout' }}>
                {/* Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-700">
                            <Menu size={24} strokeWidth={3} />
                        </button>
                        <div className="hidden md:flex items-center bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 w-80 group focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 transition-all">
                            <Search size={18} strokeWidth={3} className="text-slate-500 group-focus-within:text-slate-800" />
                            <input type="text" placeholder="Search archives..." className="bg-transparent border-none focus:ring-0 text-sm font-black text-slate-950 w-full ml-3 placeholder:text-slate-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="relative">
                            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2.5 rounded-xl border border-slate-300 text-slate-950 hover:bg-slate-50 relative">
                                <Bell size={20} strokeWidth={3} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
                            </button>
                            <AnimatePresence>
                                {notificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-0" onClick={() => setNotificationsOpen(false)} />
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden z-10"
                                        >
                                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                                <h3 className="font-black text-sm text-slate-950">Notifications</h3>
                                                <span className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-md">3 New</span>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer">
                                                        <p className="text-sm font-black text-slate-950">New order #842{i}</p>
                                                        <p className="text-xs font-black text-slate-600 mt-0.5">March 17, 2026 • 2:3{i} PM</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-slate-200" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-950">{admin?.name}</p>
                                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{admin?.role?.replace("_", " ")}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-[#D4AF37]">
                                {admin?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar-light p-6 lg:p-10">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar-light::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
};

export default AdminLayout;
