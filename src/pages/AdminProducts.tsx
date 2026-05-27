import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Search, Filter, Edit2, Trash2, Plus, ChevronLeft,
    ChevronRight, Eye, Loader2, AlertCircle, X, Upload, CheckCircle, Image as LucideImage
} from "lucide-react";

import { BASE_URL, API_URL as API } from "@/api_config";

const STATUSES = ["All", "In Stock", "Low Stock", "Out of Stock"];

type Product = {
    id: number; sku: string; name: string; category: string;
    category_id: number | null;
    saree_type_id: number | null;
    category_name?: string; fabric_name?: string;
    saree_type_name?: string;
    colour_id: number | null; fabric_id: number | null;
    size_id: number | null;
    description: string; price: number; discount_price: number | null;
    fabric: string; stock_qty: number; status: string;
    is_new: number; is_bestseller: number;
    rating: number; review_count: number;
    primary_image: string | null; created_at: string;
};

const emptyForm = {
    name: "", category_id: "", saree_type_id: "", description: "", price: "",
    discount_price: "", stock_qty: "50", is_new: 1, is_bestseller: 0,
    colour_id: "", fabric_id: "", size_id: "",
};

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        "In Stock": "bg-emerald-50 text-emerald-600 border-emerald-100",
        "Low Stock": "bg-amber-50 text-amber-600 border-amber-100",
        "Out of Stock": "bg-rose-50 text-rose-600 border-rose-100",
    };
    return map[s] ?? "bg-gray-50 text-gray-500 border-gray-100";
};

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // Filters
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [fabric, setFabric] = useState("All");
    const [statusFilter, setStatus] = useState("All");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // View modal
    const [viewProduct, setViewProduct] = useState<(Product & { gallery: { image_path: string; is_primary: number; image_url?: string }[] }) | null>(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Image upload
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Master data
    const [masters, setMasters] = useState<Record<string, any[]>>({
        categories: [], colours: [], fabric_types: [], sizes: [], saree_types: []
    });

    const fetchMasters = async () => {
        const types = ['categories', 'colours', 'fabric_types', 'sizes', 'saree_types'];
        const results: Record<string, any[]> = {};
        for (const t of types) {
            try {
                const res = await fetch(`${API}/masters/index.php?type=${t}&per_page=100&_t=${Date.now()}`, { credentials: "include", cache: "no-store" });
                const json = await res.json();
                if (json.status === "success") {
                    results[t] = json.data.filter((i: any) => t === 'saree_types' || t === 'blouse_styles' ? true : i.status === 'Active');
                }
            } catch (e) { }
        }
        setMasters(results);
    };

    useEffect(() => { fetchMasters(); }, []);

    // Delete confirm
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = async () => {
        setLoading(true); setError(null);
        try {
            const q = new URLSearchParams({
                page: String(page), per_page: "10",
                ...(debouncedSearch ? { search: debouncedSearch } : {}),
                ...(category !== "All" ? { category } : {}),
                ...(fabric !== "All" ? { fabric } : {}),
                ...(statusFilter !== "All" ? { status: statusFilter } : {}),
            });
            const res = await fetch(`${API}/products/index.php?${q}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setProducts(json.data);
                setTotal(json.total);
                setTotalPages(json.total_pages);
            } else throw new Error(json.message);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Connection failed. Start PHP server.");
        } finally { setLoading(false); }
    };

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const query = searchParams.get("search");
        if (query) {
            setSearch(query);
            setDebouncedSearch(query);
        }
    }, [searchParams]);

    useEffect(() => { fetchProducts(); }, [page, debouncedSearch, category, fabric, statusFilter]);

    const [isViewMode, setIsViewMode] = useState(false);
    const openAdd = () => navigate("/admin/products/new");
    const openEdit = (p: Product) => navigate(`/admin/products/edit/${p.id}`);

    // Open view modal
    const openView = (p: Product) => {
        setIsViewMode(true);
        setEditProduct(p);
        setForm({
            name: p.name, category_id: p.category_id ? String(p.category_id) : "",
            saree_type_id: p.saree_type_id ? String(p.saree_type_id) : "",
            description: p.description,
            price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : "",
            stock_qty: String(p.stock_qty),
            is_new: p.is_new, is_bestseller: p.is_bestseller,
            colour_id: p.colour_id ? String(p.colour_id) : "",
            fabric_id: p.fabric_id ? String(p.fabric_id) : "",
            size_id: p.size_id ? String(p.size_id) : "",
        });
        setImageFiles([]); setSaveMsg(null); setShowModal(true);
    };

    // Save (add or edit)
    const handleSave = async () => {
        if (!form.name || !form.price || !form.stock_qty) { setSaveMsg("Name, price and stock are required."); return; }
        setSaving(true); setSaveMsg(null);
        try {
            let productId: number | null = null;

            const payload = {
                ...form,
                price: parseFloat(form.price) || 0,
                mrp_price: form.discount_price ? parseFloat(form.discount_price) : (parseFloat(form.price) || 0),
                discount: 0,
                stock: parseInt(form.stock_qty) || 0,
                stock_quantity: parseInt(form.stock_qty) || 50,
                category_id: form.category_id ? parseInt(form.category_id) : null,
                saree_type_id: form.saree_type_id ? parseInt(form.saree_type_id) : null,
                colour_id: form.colour_id ? parseInt(form.colour_id) : null,
                fabric_id: form.fabric_id ? parseInt(form.fabric_id) : null,
                size_id: form.size_id ? parseInt(form.size_id) : null,
                is_new: Number(form.is_new),
                is_new_arrival: Number(form.is_new),
                is_bestseller: Number(form.is_bestseller),
                status: "Active",
            };

            if (editProduct) {
                const res = await fetch(`${API}/products/product.php?id=${editProduct.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (json.status !== "success") throw new Error(json.message || "Update failed");
                productId = editProduct.id;
            } else {
                const res = await fetch(`${API}/products/index.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (json.status !== "success") throw new Error(json.message || "Create failed");
                productId = json.id;
            }

            if (imageFiles.length > 0 && productId) {
                const fd = new FormData();
                fd.append("product_id", String(productId));
                fd.append("is_primary", "1");
                imageFiles.forEach(f => fd.append("images[]", f));
                await fetch(`${API}/products/upload_images.php`, { method: "POST", body: fd, credentials: "include" });
            }

            setSaveMsg("\u2713 Product saved successfully!");
            setTimeout(() => { setShowModal(false); fetchProducts(); }, 1000);
        } catch (e: unknown) {
            setSaveMsg(e instanceof Error ? e.message : "Save failed");
        } finally { setSaving(false); }
    };

    // Delete
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API}/products/product.php?id=${deleteId}`, { method: "DELETE", credentials: "include" });
            const json = await res.json();
            if (json.status === "success") { setDeleteId(null); fetchProducts(); }
            else throw new Error(json.message);
        } finally { setDeleting(false); }
    };

    if (loading && products.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
            <Loader2 size={48} className="animate-spin" strokeWidth={1} />
            <p className="font-display text-2xl italic">Loading products...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-4 bg-rose-50 rounded-2xl border border-rose-100 p-8 text-center max-w-2xl mx-auto mt-10">
            <AlertCircle size={48} strokeWidth={1} />
            <p className="font-display text-2xl font-semibold mb-2 italic">Error Loading Data</p>
            <p className="text-sm opacity-80 mb-4">Ensure PHP server is running at {API} using:<code className="block mt-2 bg-rose-200/50 p-2 rounded text-xs">php -S localhost:8000 -t api/</code></p>
            <button onClick={fetchProducts} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px]">Retry Connection</button>
        </div>
    );


    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shrink-0 pt-2">
                <div className="space-y-1">
                    <h1 className="font-['Poppins',sans-serif] text-[32px] font-bold text-[#041E18] tracking-[-0.03em] leading-tight flex items-center gap-3">
                        All <span className="text-[#D4AF37] italic">Products</span>
                    </h1>
                    <p className="font-['Inter',sans-serif] text-sm text-gray-500 font-medium">Total products: <span className="text-[#041E18] font-black">{total}</span></p>
                </div>
                <button onClick={openAdd} className="group relative flex items-center justify-center gap-4 px-10 py-5 bg-gradient-to-br from-[#D4AF37] via-[#B48C5E] to-[#8C6B3E] text-white rounded-[24px] font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-gold/20 hover:shadow-gold/40 transition-all duration-500 hover:-translate-y-1 active:scale-95 overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                    <span className="relative z-10">Add New Product</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-5 rounded-[24px] border border-[#041E18]/5 shadow-sm mb-6 shrink-0 transition-all duration-300">
                <div className="relative flex-1 min-w-[300px] group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-all duration-300">
                        <Search size={18} strokeWidth={2.5} />
                    </div>
                    <input type="text" placeholder="Search products..."
                        className="w-full pl-16 pr-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-[#041E18] outline-none transition-all placeholder:text-gray-400"
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                        className="pl-6 pr-10 py-4 bg-white border border-[#041E18]/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#041E18] outline-none focus:border-[#D4AF37]/30 transition-all cursor-pointer hover:bg-gray-50 appearance-none shadow-sm min-w-[160px]">
                        <option value="All">All Categories</option>
                        {masters.categories?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>

                    <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
                        className="pl-6 pr-10 py-4 bg-white border border-[#041E18]/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#041E18] outline-none focus:border-[#D4AF37]/30 transition-all cursor-pointer hover:bg-gray-50 appearance-none shadow-sm min-w-[160px]">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <button onClick={() => { setSearch(""); setCategory("All"); setFabric("All"); setStatus("All"); setPage(1); }}
                        className="p-4 bg-white border border-[#041E18]/5 text-[#041E18]/30 hover:text-rose-500 rounded-2xl hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm flex items-center justify-center">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[32px] border border-[#041E18]/5 shadow-xl shadow-[#041E18]/5 overflow-hidden mb-4">
                <div className="overflow-x-auto custom-scrollbar relative">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="sticky top-0 z-20 bg-[#FBFAF7]/95 backdrop-blur-sm shadow-sm">
                            <tr className="border-b border-[#041E18]/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Product Info</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Category</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Fabric</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Price</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Stock</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#041E18]/5 font-['Inter',sans-serif]">
                            {products.map((p: any, i) => (
                                <motion.tr key={p.combination_id ? `${p.id}-${p.combination_id}` : p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                                    className="hover:bg-[#FBFAF7] transition-all duration-300 group cursor-default">
                                    <td className="px-8 py-3">
                                        <div className="flex items-center gap-5">
                                            <div className="relative w-12 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 shadow-sm border border-[#041E18]/5 group-hover:shadow-lg transition-all duration-500">
                                                {p.primary_image
                                                    ? <img src={p.primary_image.startsWith('http') ? p.primary_image : `${BASE_URL}/${p.primary_image}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                                    : <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><LucideImage size={20} strokeWidth={1.5} /></div>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#041E18] mb-1 group-hover:text-[#D4AF37] transition-colors duration-300">{p.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-mono font-black text-gray-400 uppercase tracking-widest">{p.sku}</span>
                                                    {p.is_new === 1 && <span className="text-[8px] font-black uppercase text-emerald-600 tracking-tighter">New</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="px-3 py-1 bg-white border border-[#041E18]/5 rounded-lg text-[9px] font-black text-[#041E18] uppercase tracking-[0.1em] shadow-sm w-fit">
                                                {p.category_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-3"><p className="text-[10px] font-black text-gray-500 italic tracking-wide">{p.fabric_name}</p></td>
                                    <td className="px-8 py-3">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-black text-[#041E18] font-['Poppins',sans-serif]">₹{p.price.toLocaleString('en-IN')}</p>
                                            {p.discount_price && <p className="text-[10px] text-rose-500/50 font-black line-through">₹{p.discount_price.toLocaleString('en-IN')}</p>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3">
                                        <div className="space-y-1.5">
                                            <p className="text-[11px] font-black text-[#041E18] tracking-tight">{p.stock_qty} <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest ml-1">Pcs</span></p>
                                            <div className={`w-fit px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.1em] border shadow-sm ${statusBadge(p.status)}`}>{p.status}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-3">
                                        <div className="flex items-center justify-end gap-1 opacity-100 transition-all duration-300">
                                            {/* Navigate to live product page as requested */}
                                            <button onClick={() => openView(p)} title="Preview Card" className="p-2.5 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-xl transition-all"><Eye size={16} strokeWidth={3} /></button>
                                            <button onClick={() => openEdit(p)} title="Edit Details" className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} strokeWidth={3} /></button>
                                            <button onClick={() => setDeleteId(p.id)} title="Remove Product" className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} strokeWidth={3} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-10 py-5 border-t border-[#041E18]/5 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.25em]">Manifest Result <span className="text-[#041E18] text-xs ml-2">{(page - 1) * 10 + 1}—{(page - 1) * 10 + products.length}</span> / {total}</p>
                    <div className="flex items-center gap-3">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center text-[#041E18]/40 hover:text-[#D4AF37] border border-[#041E18]/10 rounded-xl disabled:opacity-30 bg-white shadow-sm transition-all hover:bg-gray-50"><ChevronLeft size={16} strokeWidth={3} /></button>
                        <div className="flex items-center gap-1 bg-white border border-[#041E18]/10 p-1 rounded-xl shadow-sm">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${n === page ? 'bg-[#041E18] text-white shadow-xl shadow-[#041E18]/20' : 'text-gray-400 hover:text-[#041E18] hover:bg-gray-50'}`}>{n}</button>
                            ))}
                        </div>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center text-[#041E18]/40 hover:text-[#D4AF37] border border-[#041E18]/10 rounded-xl disabled:opacity-30 bg-white shadow-sm transition-all hover:bg-gray-50"><ChevronRight size={16} strokeWidth={3} /></button>
                    </div>
                </div>
            </div>

            {/* ── Add / Edit Modal ────────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[#041E18]/5"
                            onClick={e => e.stopPropagation()}>

                            <div className="flex items-center justify-between px-10 py-8 border-b border-[#041E18]/5 bg-[#FBFAF7]">
                                <div>
                                    <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-[#041E18] tracking-tight">
                                        {isViewMode ? "View Product Details" : editProduct ? "Edit Product" : "Add New Product"}
                                    </h2>
                                    <p className="text-[10px] font-extrabold text-[#B48C5E] uppercase tracking-[0.2em] mt-1">
                                        {isViewMode ? "Inventory status & specifications" : "Update product details"}
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 text-gray-400 hover:text-rose-500 bg-white border border-[#041E18]/5 rounded-2xl transition-all shadow-sm"><X size={20} strokeWidth={2.5} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Product Name *</label>
                                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed" placeholder="e.g. Royal Kanjivaram Brocade Silk" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Primary Class *</label>
                                        <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                                            <option value="">Select Category</option>
                                            {masters.categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Saree Style / Type</label>
                                        <select value={form.saree_type_id} onChange={e => setForm(f => ({ ...f, saree_type_id: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                                            <option value="">Select Saree Style</option>
                                            {masters.saree_types?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Colour</label>
                                        <select value={form.colour_id} onChange={e => setForm(f => ({ ...f, colour_id: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                                            <option value="">Select Colour</option>
                                            {masters.colours?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Size</label>
                                        <select value={form.size_id} onChange={e => setForm(f => ({ ...f, size_id: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                                            <option value="">Standard Size</option>
                                            {masters.sizes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Fabric</label>
                                        <select value={form.fabric_id} onChange={e => setForm(f => ({ ...f, fabric_id: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                                            <option value="">Select Fabric</option>
                                            {masters.fabric_types?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Regular Price (₹) *</label>
                                        <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-extrabold text-[#041E18] outline-none transition-all font-['Poppins',sans-serif] disabled:opacity-70 disabled:cursor-not-allowed" placeholder="12500" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Discount Price (₹)</label>
                                        <input type="number" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-extrabold text-[#041E18] outline-none transition-all font-['Poppins',sans-serif] disabled:opacity-70 disabled:cursor-not-allowed" placeholder="Institutional Price" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Units in Stock *</label>
                                        <input type="number" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))}
                                            disabled={isViewMode}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed" placeholder="50" />
                                    </div>

                                    <div className="flex items-center gap-8 pt-6">
                                        <label className={`flex items-center gap-3 ${isViewMode ? 'cursor-default' : 'cursor-pointer'} group`}>
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${form.is_new === 1 ? 'bg-[#D4AF37]' : 'bg-gray-200'}`}>
                                                <motion.div animate={{ x: form.is_new === 1 ? 16 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </div>
                                            <input type="checkbox" disabled={isViewMode} checked={form.is_new === 1} onChange={e => setForm(f => ({ ...f, is_new: e.target.checked ? 1 : 0 }))} className="hidden" />
                                            <span className="text-[11px] font-black uppercase text-[#041E18] tracking-widest group-hover:text-[#D4AF37] transition-colors">Mark as New</span>
                                        </label>
                                        <label className={`flex items-center gap-3 ${isViewMode ? 'cursor-default' : 'cursor-pointer'} group`}>
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${form.is_bestseller === 1 ? 'bg-[#041E18]' : 'bg-gray-200'}`}>
                                                <motion.div animate={{ x: form.is_bestseller === 1 ? 16 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </div>
                                            <input type="checkbox" disabled={isViewMode} checked={form.is_bestseller === 1} onChange={e => setForm(f => ({ ...f, is_bestseller: e.target.checked ? 1 : 0 }))} className="hidden" />
                                            <span className="text-[11px] font-black uppercase text-[#041E18] tracking-widest group-hover:text-[#D4AF37] transition-colors">Bestseller</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Description</label>
                                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            disabled={isViewMode}
                                            rows={4} className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-medium text-[#041E18] outline-none transition-all resize-none shadow-inner disabled:opacity-70 disabled:cursor-not-allowed"
                                            placeholder="Narrate the soul of this masterpiece..." />
                                    </div>

                                    {!isViewMode && (
                                        <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Visual Documentation</label>
                                            <div onClick={() => fileInputRef.current?.click()}
                                                className="group/upload border-2 border-dashed border-[#041E18]/10 rounded-[24px] p-10 text-center cursor-pointer hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all duration-500 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                                                <div className="relative z-10 space-y-4">
                                                    <div className="w-16 h-16 bg-white border border-[#041E18]/5 rounded-2xl shadow-sm flex items-center justify-center mx-auto group-hover/upload:scale-110 transition-transform text-gray-300 group-hover/upload:text-[#D4AF37]">
                                                        <Upload size={32} strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-[#041E18] font-bold">Import Visual Assets</p>
                                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">High fidelity JPG, PNG, or WebP</p>
                                                    </div>
                                                    {imageFiles.length > 0 && (
                                                        <div className="space-y-4">
                                                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 p-3 bg-white border border-[#D4AF37]/20 rounded-xl shadow-lg">
                                                                <div className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center"><CheckCircle size={14} /></div>
                                                                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{imageFiles.length} Archives Staged</span>
                                                            </motion.div>

                                                            <div className="flex flex-wrap gap-3 justify-center">
                                                                {imageFiles.map((file, i) => (
                                                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                                                        className="w-16 h-16 rounded-xl border border-[#D4AF37]/20 overflow-hidden shadow-sm">
                                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="hidden"
                                                onChange={e => setImageFiles(Array.from(e.target.files ?? []))} />
                                        </div>
                                    )}
                                </div>

                                {editProduct?.primary_image && (
                                    <div className="space-y-4 pt-10 border-t border-[#041E18]/5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                                            {isViewMode ? "Inventory Visual" : "Current Primary Image"}
                                        </label>
                                        <div className="w-full h-64 rounded-[32px] overflow-hidden border border-[#041E18]/10 bg-gray-50 flex items-center justify-center">
                                            <img
                                                src={editProduct.primary_image.startsWith('http') ? editProduct.primary_image : `${BASE_URL}/${editProduct.primary_image}`}
                                                alt={editProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-10 py-8 bg-[#FBFAF7] border-t border-[#041E18]/5 flex gap-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 bg-white border border-[#041E18]/10 text-[#041E18]/40 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-50 transition-all hover:text-rose-500">
                                    {isViewMode ? "Close Panel" : "Abandon"}
                                </button>
                                {!isViewMode && (
                                    <button onClick={handleSave} disabled={saving}
                                        className="flex-[2] px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B48C5E] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group">
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />}
                                        {saving ? "Synchronizing..." : editProduct ? "Authorize Revision" : "Finalize Commission"}
                                    </button>
                                )}
                            </div>
                            {saveMsg && (
                                <AnimatePresence>
                                    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className={`absolute bottom-32 left-10 right-10 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl border ${saveMsg.startsWith("✓") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"} z-50`}>
                                        <AlertCircle size={18} />
                                        <span className="text-xs font-black uppercase tracking-widest">{saveMsg}</span>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirm ──────────────────────────────────────────── */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/60 backdrop-blur-xl z-[70] flex items-center justify-center p-6"
                        onClick={() => setDeleteId(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ type: "spring", stiffness: 340, damping: 28 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden"
                            onClick={e => e.stopPropagation()}>

                            {/* Icon + Text */}
                            <div className="flex flex-col items-center pt-10 pb-6 px-8">
                                <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
                                    <Trash2 size={28} className="text-rose-500" strokeWidth={2} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Delete Product?</h3>
                                <p className="text-sm text-slate-400 font-medium text-center leading-relaxed">
                                    This will permanently delete this product.<br />This action cannot be undone.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="px-8 pb-8 space-y-3">
                                <button onClick={handleDelete} disabled={deleting}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300 active:scale-[0.98] disabled:opacity-60">
                                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={3} />}
                                    {deleting ? "Deleting..." : "DELETE"}
                                </button>
                                <button onClick={() => setDeleteId(null)}
                                    className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-700 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all">
                                    CANCEL
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
