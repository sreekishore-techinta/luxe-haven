import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Search, Filter, Edit2, Trash2, Plus, ChevronLeft,
    ChevronRight, Eye, Loader2, AlertCircle, X, Upload, CheckCircle, Image as LucideImage
} from "lucide-react";

const API = "http://localhost:8000";

// Categories are now dynamic via fetchMasters()
const FABRICS = ["All", "Pure Silk", "Kanjivaram Silk", "Banarasi", "Chanderi", "Organza", "Raw Silk", "Brocade Silk", "Tussar"];
const STATUSES = ["All", "In Stock", "Low Stock", "Out of Stock"];

type Product = {
    id: number; sku: string; name: string; category: string;
    colour_id: number | null; fabric_id: number | null;
    size_id: number | null;
    description: string; price: number; discount_price: number | null;
    fabric: string; stock_qty: number; status: string;
    is_new: number; is_bestseller: number;
    rating: number; review_count: number;
    primary_image: string | null; created_at: string;
};

const emptyForm = {
    name: "", category: "Sarees", description: "", price: "",
    discount_price: "", fabric: "Pure Silk", stock_qty: "", is_new: 0, is_bestseller: 0,
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
    const [viewProduct, setViewProduct] = useState<(Product & { images: { image_path: string; is_primary: number }[] }) | null>(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Image upload
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Master data
    const [masters, setMasters] = useState<Record<string, any[]>>({
        categories: [], colours: [], fabric_types: [], sizes: []
    });

    const fetchMasters = async () => {
        const types = Object.keys(masters);
        const results: Record<string, any[]> = {};
        for (const t of types) {
            try {
                const res = await fetch(`${API}/masters/index.php?type=${t}`, { credentials: "include" });
                const json = await res.json();
                if (json.status === "success") results[t] = json.data.filter((i: any) => i.status === 'Active');
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
                page: String(page), per_page: "20",
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

    // Open add modal
    const openAdd = () => { setEditProduct(null); setForm({ ...emptyForm }); setImageFiles([]); setSaveMsg(null); setShowModal(true); };

    // Open edit modal
    const openEdit = (p: Product) => {
        setEditProduct(p);
        setForm({
            name: p.name, category: p.category, description: p.description,
            price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : "",
            fabric: p.fabric, stock_qty: String(p.stock_qty),
            is_new: p.is_new, is_bestseller: p.is_bestseller,
            colour_id: p.colour_id ? String(p.colour_id) : "",
            fabric_id: p.fabric_id ? String(p.fabric_id) : "",
            size_id: p.size_id ? String(p.size_id) : "",
        });
        setImageFiles([]); setSaveMsg(null); setShowModal(true);
    };

    // Open view modal
    const openView = async (p: Product) => {
        setViewLoading(true); setViewProduct(null);
        try {
            const res = await fetch(`${API}/products/product.php?id=${p.id}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setViewProduct(json.data);
        } finally { setViewLoading(false); }
    };

    // Save (add or edit)
    const handleSave = async () => {
        if (!form.name || !form.price || !form.stock_qty) { setSaveMsg("Name, price and stock are required."); return; }
        setSaving(true); setSaveMsg(null);
        try {
            let productId: number | null = null;

            const payload = {
                ...form,
                price: parseFloat(form.price),
                discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
                stock_qty: parseInt(form.stock_qty),
                colour_id: form.colour_id ? parseInt(form.colour_id) : null,
                fabric_id: form.fabric_id ? parseInt(form.fabric_id) : null,
                size_id: form.size_id ? parseInt(form.size_id) : null,
            };

            if (editProduct) {
                // PUT update
                const res = await fetch(`${API}/products/product.php?id=${editProduct.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (json.status !== "success") throw new Error(json.message);
                productId = editProduct.id;
            } else {
                // POST create
                const res = await fetch(`${API}/products/index.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (json.status !== "success") throw new Error(json.message);
                productId = json.id;
            }

            // Upload images if any
            if (imageFiles.length > 0 && productId) {
                const fd = new FormData();
                fd.append("product_id", String(productId));
                fd.append("is_primary", "1");
                imageFiles.forEach(f => fd.append("images[]", f));
                await fetch(`${API}/products/upload_images.php`, { method: "POST", body: fd, credentials: "include" });
            }

            setSaveMsg("✓ Product saved successfully!");
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
            <p className="font-display text-2xl italic">Loading inventory...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-4 bg-rose-50 rounded-2xl border border-rose-100 p-8 text-center max-w-2xl mx-auto mt-10">
            <AlertCircle size={48} strokeWidth={1} />
            <p className="font-display text-2xl font-semibold mb-2 italic">Backend Connection Failed</p>
            <p className="text-sm opacity-80 mb-4">Ensure PHP server is running at {API} using:<code className="block mt-2 bg-rose-200/50 p-2 rounded text-xs">php -S localhost:8000 -t api/</code></p>
            <button onClick={fetchProducts} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px]">Retry Connection</button>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="page-header mb-8">
                <div className="space-y-2">
                    <h1 className="font-['Poppins',sans-serif] text-[42px] font-bold text-[#041E18] tracking-[-0.03em] leading-tight">Products <span className="text-[#D4AF37] italic">Inventory</span></h1>
                    <p className="font-['Inter',sans-serif] text-base text-gray-400 font-medium">Showing <span className="text-[#041E18] font-bold">{total}</span> total products</p>
                </div>
                <button onClick={openAdd} className="group relative flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-[#D4AF37] via-[#B48C5E] to-[#8C6B3E] text-white rounded-[20px] font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-gold/20 hover:shadow-gold/40 transition-all duration-500 hover:-translate-y-1 active:scale-95 overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                    <span className="relative z-10">Add New Product</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-[32px] border border-[#041E18]/5 shadow-sm shadow-[#041E18]/5">
                <div className="relative flex-1 min-w-[340px] group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#041E18]/5 text-[#041E18]/30 group-focus-within:text-[#D4AF37] group-focus-within:bg-[#D4AF37]/10 transition-all duration-300">
                        <Search size={16} strokeWidth={2.5} />
                    </div>
                    <input type="text" placeholder="Search by name, SKU or fabric..."
                        className="w-full pl-16 pr-6 py-4 bg-[#041E18]/[0.02] rounded-[20px] border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-medium text-[#041E18] outline-none transition-all placeholder:text-gray-300"
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>

                <div className="flex items-center gap-3">
                    <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                        className="pl-6 pr-10 py-4 bg-white border border-[#041E18]/5 rounded-[20px] text-[11px] font-extrabold uppercase tracking-widest text-[#041E18] outline-none focus:border-[#D4AF37]/30 transition-all cursor-pointer hover:bg-gray-50 appearance-none shadow-sm">
                        <option value="All">All Categories</option>
                        {masters.categories?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>

                    <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
                        className="pl-6 pr-10 py-4 bg-white border border-[#041E18]/5 rounded-[20px] text-[11px] font-extrabold uppercase tracking-widest text-[#041E18] outline-none focus:border-[#D4AF37]/30 transition-all cursor-pointer hover:bg-gray-50 appearance-none shadow-sm">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <button onClick={() => { setSearch(""); setCategory("All"); setFabric("All"); setStatus("All"); setPage(1); }}
                        className="p-4 bg-white border border-[#041E18]/5 text-[#041E18]/30 hover:text-rose-500 rounded-[20px] hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-container">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#041E18]/5">
                                <th className="px-10 py-8 text-[10px] font-extrabold uppercase tracking-[0.25em] text-gray-400">Product Info</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold uppercase tracking-[0.25em] text-gray-400">Category</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold uppercase tracking-[0.25em] text-gray-400">Fabric</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold uppercase tracking-[0.25em] text-gray-400">Price</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold uppercase tracking-[0.25em] text-gray-400">Stock</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold uppercase tracking-[0.25em] text-gray-400 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#041E18]/5 font-['Inter',sans-serif]">
                            {products.map((p, i) => (
                                <motion.tr key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                                    className="hover:bg-[#FBFAF7] transition-all duration-300 group cursor-default">
                                    <td className="px-10 py-7">
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-16 h-20 bg-gray-50 rounded-[18px] overflow-hidden shrink-0 shadow-sm border border-[#041E18]/5 group-hover:shadow-xl group-hover:shadow-gold/10 transition-all duration-500">
                                                {p.primary_image
                                                    ? <img src={`${API}/${p.primary_image}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                                    : <div className="w-full h-full flex items-center justify-center bg-[#041E18]/5 text-[#B48C5E]"><LucideImage size={24} strokeWidth={1.5} /></div>}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#041E18]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#041E18] mb-1 group-hover:text-[#D4AF37] transition-colors duration-300">{p.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">{p.sku}</span>
                                                    {p.is_new === 1 && <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100 tracking-tighter">New arrival</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <span className="px-4 py-1.5 bg-white border border-[#041E18]/5 rounded-xl text-[10px] font-black text-[#041E18] uppercase tracking-[0.1em] shadow-sm">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-10 py-7"><p className="text-[11px] font-bold text-gray-400 italic italic tracking-wide">{p.fabric}</p></td>
                                    <td className="px-10 py-7">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-[#041E18] font-['Poppins',sans-serif]">₹{p.price.toLocaleString('en-IN')}</p>
                                            {p.discount_price && <p className="text-[10px] text-rose-400 font-bold line-through opacity-60">₹{p.discount_price.toLocaleString('en-IN')}</p>}
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-[#041E18] tracking-tight">{p.stock_qty} <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">Pieces</span></p>
                                            <div className={`w-fit px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border shadow-sm ${statusBadge(p.status)}`}>{p.status}</div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="actions sm:opacity-0 group-hover:opacity-100 sm:translate-x-4 group-hover:translate-x-0 transition-all duration-500 justify-end">
                                            <button onClick={() => openView(p)} className="p-3 text-[#041E18]/30 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-2xl transition-all shadow-sm bg-white border border-[#041E18]/5"><Eye size={16} strokeWidth={2.5} /></button>
                                            <button onClick={() => openEdit(p)} className="p-3 text-[#041E18]/30 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white border border-[#041E18]/5"><Edit2 size={16} strokeWidth={2.5} /></button>
                                            <button onClick={() => setDeleteId(p.id)} className="p-3 text-[#041E18]/30 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm bg-white border border-[#041E18]/5"><Trash2 size={16} strokeWidth={2.5} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-10 py-8 border-t border-[#041E18]/5 flex items-center justify-between bg-[#FDFCF9]/50">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.25em]">Showing Results <span className="text-[#041E18] text-xs ml-2">{(page - 1) * 20 + 1}—{(page - 1) * 20 + products.length}</span> of {total}</p>
                    <div className="flex items-center gap-3">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-4 text-[#041E18]/40 hover:text-[#D4AF37] border border-[#041E18]/10 rounded-2xl disabled:opacity-10 bg-white shadow-sm transition-all hover:bg-gray-50"><ChevronLeft size={16} strokeWidth={3} /></button>
                        <div className="flex items-center gap-1 bg-white border border-[#041E18]/10 p-1.5 rounded-2xl shadow-sm">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => setPage(n)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${n === page ? 'bg-[#041E18] text-white shadow-xl shadow-[#041E18]/20' : 'text-gray-400 hover:text-[#041E18] hover:bg-gray-50'}`}>{n}</button>
                            ))}
                        </div>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-4 text-[#041E18]/40 hover:text-[#D4AF37] border border-[#041E18]/10 rounded-2xl disabled:opacity-10 bg-white shadow-sm transition-all hover:bg-gray-50"><ChevronRight size={16} strokeWidth={3} /></button>
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
                                    <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-[#041E18] tracking-tight">{editProduct ? "Edit Product" : "Add New Product"}</h2>
                                    <p className="text-[10px] font-extrabold text-[#B48C5E] uppercase tracking-[0.2em] mt-1">Update product details</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 text-gray-400 hover:text-rose-500 bg-white border border-[#041E18]/5 rounded-2xl transition-all shadow-sm"><X size={20} strokeWidth={2.5} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Product Name *</label>
                                            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all" placeholder="e.g. Royal Kanjivaram Brocade Silk" />
                                        </div>

                                        <div className="md:col-span-2 py-4 flex items-center gap-4">
                                            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                            <span className="text-[9px] font-black text-[#B48C5E] uppercase tracking-[0.4em] whitespace-nowrap">Classification</span>
                                            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Primary Class *</label>
                                            <select value={form.category} onChange={e => {
                                                const val = e.target.value;
                                                setForm(f => ({ ...f, category: val }));
                                            }}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer">
                                                {masters.categories?.length > 0 ? masters.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>) : <option>Sarees</option>}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Colour</label>
                                            <select value={form.colour_id} onChange={e => setForm(f => ({ ...f, colour_id: e.target.value }))}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer">
                                                <option value="">Select Colour</option>
                                                {masters.colours?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Size</label>
                                            <select value={form.size_id} onChange={e => setForm(f => ({ ...f, size_id: e.target.value }))}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer">
                                                <option value="">Standard Size</option>
                                                {masters.sizes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Fabric</label>
                                            <select value={form.fabric_id} onChange={e => setForm(f => ({ ...f, fabric_id: e.target.value }))}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer">
                                                <option value="">Select Fabric</option>
                                                {masters.fabric_types?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2 py-4 flex items-center gap-4">
                                            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                            <span className="text-[9px] font-black text-[#B48C5E] uppercase tracking-[0.4em] whitespace-nowrap">Pricing</span>
                                            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Regular Price (₹) *</label>
                                            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-extrabold text-[#041E18] outline-none transition-all font-['Poppins',sans-serif]" placeholder="12500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Discount Price (₹)</label>
                                            <input type="number" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-extrabold text-[#041E18] outline-none transition-all font-['Poppins',sans-serif]" placeholder="Institutional Price" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Units in Stock *</label>
                                            <input type="number" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all" placeholder="50" />
                                        </div>
                                        <div className="flex items-center gap-8 pt-6">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-10 h-6 rounded-full p-1 transition-all ${form.is_new === 1 ? 'bg-[#D4AF37]' : 'bg-gray-200'}`}>
                                                    <motion.div animate={{ x: form.is_new === 1 ? 16 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                                </div>
                                                <input type="checkbox" checked={form.is_new === 1} onChange={e => setForm(f => ({ ...f, is_new: e.target.checked ? 1 : 0 }))} className="hidden" />
                                                <span className="text-[11px] font-black uppercase text-[#041E18] tracking-widest group-hover:text-[#D4AF37] transition-colors">Mark as New</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-10 h-6 rounded-full p-1 transition-all ${form.is_bestseller === 1 ? 'bg-[#041E18]' : 'bg-gray-200'}`}>
                                                    <motion.div animate={{ x: form.is_bestseller === 1 ? 16 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                                </div>
                                                <input type="checkbox" checked={form.is_bestseller === 1} onChange={e => setForm(f => ({ ...f, is_bestseller: e.target.checked ? 1 : 0 }))} className="hidden" />
                                                <span className="text-[11px] font-black uppercase text-[#041E18] tracking-widest group-hover:text-[#D4AF37] transition-colors">Bestseller</span>
                                            </label>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Description</label>
                                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                                rows={4} className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-medium text-[#041E18] outline-none transition-all resize-none shadow-inner"
                                                placeholder="Narrate the soul of this masterpiece..." />
                                        </div>

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
                                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 p-3 bg-white border border-[#D4AF37]/20 rounded-xl shadow-lg">
                                                            <div className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center"><CheckCircle size={14} /></div>
                                                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{imageFiles.length} Archives Staged</span>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                            <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="hidden"
                                                onChange={e => setImageFiles(Array.from(e.target.files ?? []))} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-8 bg-[#FBFAF7] border-t border-[#041E18]/5 flex gap-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 bg-white border border-[#041E18]/10 text-[#041E18]/40 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-50 transition-all hover:text-rose-500">Abandon</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-[2] px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B48C5E] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />}
                                    {saving ? "Synchronizing..." : editProduct ? "Authorize Revision" : "Finalize Commission"}
                                </button>
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

            {/* ── View Modal ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {(viewProduct || viewLoading) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/80 backdrop-blur-xl z-[60] flex items-center justify-center p-6"
                        onClick={() => setViewProduct(null)}>
                        <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20"
                            onClick={e => e.stopPropagation()}>
                            {viewLoading ? (
                                <div className="p-20 text-center">
                                    <div className="relative inline-block">
                                        <Loader2 size={64} className="animate-spin text-[#D4AF37] opacity-20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 bg-[#D4AF37] rounded-full animate-ping" />
                                        </div>
                                    </div>
                                    <p className="mt-8 text-[11px] font-black uppercase text-[#D4AF37] tracking-[0.4em]">Loading product...</p>
                                </div>
                            ) : viewProduct && (
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="w-full md:w-[45%] h-full min-h-[400px] relative bg-gray-50 group">
                                        {viewProduct.images?.[0]
                                            ? <img src={`${API}/${viewProduct.images[0].image_path}`} alt={viewProduct.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            : <div className="w-full h-full flex items-center justify-center text-gray-200"><LucideImage size={64} strokeWidth={1} /></div>}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#041E18]/60 to-transparent pointer-events-none" />
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                                                <p className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Live View</p>
                                            </div>
                                            <p className="text-white/60 text-[9px] font-mono font-bold tracking-tighter">REF_{viewProduct.sku}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-10 flex flex-col justify-between space-y-8 bg-white overflow-y-auto max-h-[90vh] custom-scrollbar">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <span className="px-3 py-1 bg-[#041E18]/5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-[#041E18]">{viewProduct.category}</span>
                                                <button onClick={() => setViewProduct(null)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors"><X size={24} /></button>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="font-['Poppins',sans-serif] text-[32px] font-black text-[#041E18] leading-[0.95] tracking-tight">{viewProduct.name}</h3>
                                                <p className="text-[#D4AF37] text-sm font-bold italic tracking-wide">{viewProduct.fabric} Collection</p>
                                            </div>

                                            <p className="text-xs text-gray-500 font-medium leading-relaxed font-['Inter',sans-serif] border-l-2 border-[#D4AF37]/20 pl-4">{viewProduct.description || "No description available."}</p>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 rounded-3xl bg-[#FBFAF7] border border-[#041E18]/5 group/item">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 group-hover/item:text-[#D4AF37] transition-colors">Price</p>
                                                    <p className="font-['Poppins',sans-serif] text-xl font-bold text-[#041E18]">₹{viewProduct.price.toLocaleString('en-IN')}</p>
                                                </div>
                                                <div className="p-5 rounded-3xl bg-[#FBFAF7] border border-[#041E18]/5 group/item">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 group-hover/item:text-[#D4AF37] transition-colors">Stock</p>
                                                    <div className="flex items-end gap-1">
                                                        <p className="font-['Poppins',sans-serif] text-xl font-bold text-[#041E18]">{viewProduct.stock_qty}</p>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Pcs</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button onClick={() => { setViewProduct(null); openEdit(viewProduct); }}
                                                className="flex-1 px-8 py-5 bg-[#041E18] text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#0D3B2E] transition-all shadow-xl shadow-[#041E18]/20 active:scale-95">
                                                Edit Product
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirm ──────────────────────────────────────────── */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/80 backdrop-blur-xl z-[70] flex items-center justify-center p-6"
                        onClick={() => setDeleteId(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm p-10 text-center relative overflow-hidden border border-[#041E18]/5"
                            onClick={e => e.stopPropagation()}>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />

                            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100 group">
                                <Trash2 size={32} className="text-rose-500 group-hover:shake" strokeWidth={2.5} />
                            </div>
                            <h3 className="font-['Poppins',sans-serif] text-2xl font-bold text-[#041E18] mb-2 tracking-tight">Delete Product?</h3>
                            <p className="text-xs text-gray-400 font-medium mb-10 leading-relaxed font-['Inter',sans-serif]">This will permanently delete this product. This action cannot be undone.</p>

                            <div className="flex flex-col gap-3">
                                <button onClick={handleDelete} disabled={deleting}
                                    className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={3} />}
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                                <button onClick={() => setDeleteId(null)} className="w-full py-5 bg-[#FBFAF7] text-gray-400 hover:text-[#041E18] rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all border border-[#041E18]/5 active:scale-95">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}

