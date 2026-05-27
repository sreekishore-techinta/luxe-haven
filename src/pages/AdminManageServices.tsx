import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trash2, Edit2, Plus, Loader2, Search, ArrowUpDown, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { API_URL as API } from "@/api_config";

interface Service {
    id: number;
    title: string;
    image_url: string;
    tag: string;
    display_order: number;
    is_active: number | boolean;
    created_at: string;
}

export default function AdminManageServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API}/admin/services/list.php`);
            const json = await res.json();
            if (json.status === "success") {
                setServices(json.data);
            }
        } catch (err) {
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this service category? This action cannot be undone.")) return;
        
        try {
            const res = await fetch(`${API}/admin/services/delete.php`, {
                method: "POST", // Using POST for delete if DELETE method issues on some servers
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const json = await res.json();
            if (json.status === "success") {
                setServices(services.filter(s => s.id !== id));
                toast.success("Service category deleted successfully!");
            }
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const toggleStatus = async (service: Service) => {
        const newStatus = service.is_active ? 0 : 1;
        try {
            const res = await fetch(`${API}/admin/services/update.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...service, is_active: newStatus })
            });
            const json = await res.json();
            if (json.status === "success") {
                setServices(services.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s));
                toast.success(`Category ${newStatus ? 'activated' : 'deactivated'}`);
            }
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (s.tag && s.tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterStatus === "all" || 
                             (filterStatus === "active" && s.is_active) || 
                             (filterStatus === "inactive" && !s.is_active);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="font-display text-4xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                        <Sparkles className="text-[#D4AF37]" size={32} />
                        Curated Lookbook
                    </h1>
                    <p className="text-slate-500 font-bold mt-1">Manage and moderate the Curated Lookbook layout.</p>
                </div>
                <Link
                    to="/admin/services/add"
                    className="inline-flex items-center gap-2 px-6 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-slate-200 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
                    Compose Category
                </Link>
            </header>

            {/* Filters & Search */}
            <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by title or tag..." 
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 text-sm font-black focus:ring-4 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    {(["all", "active", "inactive"] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterStatus(type)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === type ? "bg-[#0F172A] text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-white"}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Compiling catalog...</p>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="bg-white rounded-[40px] p-24 text-center border border-dashed border-slate-200 space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <Sparkles size={48} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-display text-2xl font-black text-slate-950">No Categories Found</h3>
                        <p className="text-slate-500 font-bold max-w-xs mx-auto">Either start by adding one or try a different filter.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredServices.map((service, index) => (
                            <motion.div
                                key={service.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="group relative bg-white border border-slate-100 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
                            >
                                {/* Active Badge */}
                                <div className="absolute top-4 left-4 z-10">
                                    <button 
                                        onClick={() => toggleStatus(service)}
                                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 transition-all ${service.is_active ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${service.is_active ? "bg-white animate-pulse" : "bg-slate-400"}`} />
                                        {service.is_active ? "Live" : "Draft"}
                                    </button>
                                </div>

                                {/* Main Image Content */}
                                <div className="p-6">
                                    <div className="relative aspect-square rounded-full border-4 border-slate-50 shadow-inner overflow-hidden mb-6 group-hover:scale-[1.03] transition-transform duration-500">
                                        <img 
                                            src={service.image_url.startsWith('http') ? service.image_url : (service.image_url.startsWith('/') ? service.image_url : `/${service.image_url}`)} 
                                            alt={service.title} 
                                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://placehold.co/400x400/f8fafc/cbd5e1?text=Image+Missing";
                                            }}
                                        />
                                        {service.tag && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-xl">
                                                {service.tag}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center space-y-1 mb-6">
                                        <h3 className="font-display text-xl font-black text-slate-950 tracking-tight">{service.title}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order: {service.display_order}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link 
                                            to={`/admin/services/edit/${service.id}`}
                                            className="flex-1 h-12 bg-slate-50 hover:bg-[#F8FAFC] text-slate-950 border border-slate-100 rounded-2xl flex items-center justify-center transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(service.id)}
                                            className="flex-1 h-12 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
