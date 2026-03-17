import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Edit2, Trash2, X, Search, Loader2,
    CheckCircle, Camera, Image as LucideImage,
    Package, Filter, Eye, AlertCircle, Upload, ChevronLeft, ChevronRight, Layers
} from "lucide-react";

const API = "http://localhost:8000";

type Product = {
    id: number; sku: string; name: string; category: string;
    category_id: number | null;
    colour_id: number | null; fabric_id: number | null;
    size_id: number | null;
    saree_type_id: number | null;
    blouse_style_id: number | null;
    description: string; price: number; discount_price: number | null;
    fabric: string; stock_qty: number; status: string;
    is_new: number; is_bestseller: number;
    rating: number; review_count: number;
    primary_image: string | null; created_at: string;
};

type SareeType = {
    id: number; name: string; slug: string; image: string; hero_image: string | null; description: string | null; created_at: string;
};

const emptyProductForm = {
    name: "", category: "Sarees", category_id: "1", description: "", price: "",
    discount_price: "", fabric: "Pure Silk", stock_qty: "", is_new: 0, is_bestseller: 0,
    colour_id: "", fabric_id: "", size_id: "", saree_type_id: "", blouse_style_id: "",
};

const emptyTypeForm = { name: "", slug: "", image: "", hero_image: "", description: "" };

const STATUSES = ["All", "In Stock", "Low Stock", "Out of Stock"];

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        "In Stock": "bg-emerald-50 text-emerald-800 border-emerald-200 font-black",
        "Low Stock": "bg-amber-50 text-amber-800 border-amber-200 font-black",
        "Out of Stock": "bg-rose-50 text-rose-800 border-rose-200 font-black",
    };
    return map[s] ?? "bg-gray-50 text-gray-700 border-gray-200 font-black";
};

export default function AdminSareeManagement() {
    const [activeTab, setActiveTab] = useState<"products" | "types">("products");
    const [products, setProducts] = useState<Product[]>([]);
    const [sareeTypes, setSareeTypes] = useState<SareeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Pagination for products
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filter states
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal states
    const [showProductModal, setShowProductModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [editType, setEditType] = useState<SareeType | null>(null);
    const [productForm, setProductForm] = useState({ ...emptyProductForm });
    const [typeForm, setTypeForm] = useState({ ...emptyTypeForm });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // View product modal
    const [viewProduct, setViewProduct] = useState<(Product & { images: { image_path: string; is_primary: number }[] }) | null>(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Product Image upload
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const productFileInputRef = useRef<HTMLInputElement>(null);

    // Master data for product modal
    const [masters, setMasters] = useState<Record<string, any[]>>({
        categories: [], colours: [], fabric_types: [], sizes: [], saree_types: [], blouse_styles: []
    });

    const fetchMasters = async () => {
        const types = ["colours", "fabric_types", "sizes", "saree_types", "blouse_styles"];
        const results: Record<string, any[]> = {};
        for (const t of types) {
            try {
                let endpoint = "";
                if (t === 'saree_types') endpoint = 'public/saree_types.php';
                else if (t === 'blouse_styles') endpoint = 'masters/index.php?type=blouse_styles';
                else endpoint = 'masters/index.php?type=' + t;

                const res = await fetch(`${API}/${endpoint}`, { credentials: "include" });
                const json = await res.json();
                if (json.status === "success") {
                    results[t] = t === 'saree_types' ? json.data : json.data.filter((i: any) => i.status === 'Active');
                }
            } catch (e) { }
        }
        setMasters(prev => ({ ...prev, ...results }));
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({
                page: String(page),
                per_page: "10",
                category: "Sarees",
                ...(search ? { search } : {}),
                ...(statusFilter !== "All" ? { status: statusFilter } : {}),
            });
            const res = await fetch(`${API}/products/index.php?${q}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setProducts(json.data);
                setTotal(json.total);
                setTotalPages(json.total_pages);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/saree_types/index.php`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setSareeTypes(json.data);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasters();
    }, []);

    useEffect(() => {
        if (activeTab === "products") fetchProducts();
        else fetchTypes();
    }, [activeTab, page, search, statusFilter]);

    // ─── Product Actions ────────────────────────────────────────────────
    const openAddProduct = () => {
        setEditProduct(null);
        setProductForm({ ...emptyProductForm });
        setImageFiles([]);
        setSaveMsg(null);
        setShowProductModal(true);
    };

    const openEditProduct = (p: Product) => {
        setEditProduct(p);
        setProductForm({
            name: p.name, category: p.category, category_id: String(p.category_id || "1"),
            description: p.description,
            price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : "",
            fabric: p.fabric, stock_qty: String(p.stock_qty),
            is_new: p.is_new, is_bestseller: p.is_bestseller,
            colour_id: p.colour_id ? String(p.colour_id) : "",
            fabric_id: p.fabric_id ? String(p.fabric_id) : "",
            size_id: p.size_id ? String(p.size_id) : "",
            saree_type_id: p.saree_type_id ? String(p.saree_type_id) : "",
            blouse_style_id: p.blouse_style_id ? String(p.blouse_style_id) : "",
        });
        setImageFiles([]);
        setSaveMsg(null);
        setShowProductModal(true);
    };

    const handleSaveProduct = async () => {
        if (!productForm.name || !productForm.price || !productForm.stock_qty || !productForm.saree_type_id) {
            setSaveMsg("All required fields (*) must be filled.");
            return;
        }
        setSaving(true);
        setSaveMsg(null);
        try {
            let productId: number | null = null;
            const payload = {
                ...productForm,
                category_id: parseInt(productForm.category_id),
                price: parseFloat(productForm.price),
                discount_price: productForm.discount_price ? parseFloat(productForm.discount_price) : null,
                stock_qty: parseInt(productForm.stock_qty),
                colour_id: productForm.colour_id ? parseInt(productForm.colour_id) : null,
                fabric_id: productForm.fabric_id ? parseInt(productForm.fabric_id) : null,
                size_id: productForm.size_id ? parseInt(productForm.size_id) : null,
                saree_type_id: parseInt(productForm.saree_type_id),
                blouse_style_id: productForm.blouse_style_id ? parseInt(productForm.blouse_style_id) : null,
            };

            const url = editProduct ? `${API}/products/product.php?id=${editProduct.id}` : `${API}/products/index.php`;
            const method = editProduct ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (json.status !== "success") throw new Error(json.message);
            productId = editProduct ? editProduct.id : json.id;

            if (imageFiles.length > 0 && productId) {
                const fd = new FormData();
                fd.append("product_id", String(productId));
                fd.append("is_primary", "1");
                imageFiles.forEach(f => fd.append("images[]", f));
                await fetch(`${API}/products/upload_images.php`, { method: "POST", body: fd, credentials: "include" });
            }

            setSaveMsg("✓ Product saved successfully!");
            setTimeout(() => { setShowProductModal(false); fetchProducts(); }, 1000);
        } catch (e: any) {
            setSaveMsg(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Delete this product?")) return;
        try {
            const res = await fetch(`${API}/products/product.php?id=${id}`, { method: "DELETE", credentials: "include" });
            const json = await res.json();
            if (json.status === "success") fetchProducts();
        } catch (e: any) { alert(e.message); }
    };

    // ─── Saree Type Actions ──────────────────────────────────────────
    const openAddType = () => {
        setEditType(null);
        setTypeForm({ ...emptyTypeForm });
        setSaveMsg(null);
        setShowTypeModal(true);
    };

    const openEditType = (t: SareeType) => {
        setEditType(t);
        setTypeForm({ name: t.name, slug: t.slug, image: t.image, hero_image: t.hero_image || "", description: t.description || "" });
        setSaveMsg(null);
        setShowTypeModal(true);
    };

    const handleSaveType = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editType ? `${API}/admin/saree_types/index.php?id=${editType.id}` : `${API}/admin/saree_types/index.php`;
            const res = await fetch(url, {
                method: editType ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(typeForm)
            });
            const json = await res.json();
            if (json.status === "success") {
                setSaveMsg("✓ Saree type saved!");
                setTimeout(() => { setShowTypeModal(false); fetchTypes(); fetchMasters(); }, 1000);
            } else throw new Error(json.message);
        } catch (e: any) { alert(e.message); }
        finally { setSaving(false); }
    };

    const handleTypeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'hero_image' = 'image') => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append("image", file);
        try {
            const res = await fetch(`${API}/admin/saree_types/upload.php`, { method: "POST", credentials: "include", body: fd });
            const json = await res.json();
            if (json.status === "success") setTypeForm(f => ({ ...f, [field]: json.url }));
        } catch (e: any) { alert(e.message); }
        finally { setUploading(false); }
    };

    const handleDeleteType = async (id: number) => {
        if (!confirm("Delete this saree type?")) return;
        try {
            const res = await fetch(`${API}/admin/saree_types/index.php?id=${id}`, { method: "DELETE", credentials: "include" });
            const json = await res.json();
            if (json.status === "success") { fetchTypes(); fetchMasters(); }
        } catch (e: any) { alert(e.message); }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Saree <span className="text-[#D4AF37] italic font-serif">Management</span></h1>
                    <p className="text-slate-600 text-sm font-black mt-1">Control your premium saree collections and inventory.</p>
                </div>
                <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                    <button onClick={() => setActiveTab("products")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-950'}`}>Inventory</button>
                    <button onClick={() => setActiveTab("types")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'types' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-950'}`}>Collections</button>
                </div>
            </div>

            {/* View Switching List */}
            {activeTab === "products" ? (
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm">
                        <div className="relative flex-1 min-w-[300px] group">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" />
                            <input type="text" placeholder="Search sarees by name or SKU..." value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:bg-white border border-transparent focus:border-[#D4AF37]/30" />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="pl-5 pr-10 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none shadow-sm cursor-pointer">
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={openAddProduct} className="group flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl shadow-slate-200 hover:bg-slate-800 hover:shadow-slate-300 transition-all active:scale-95">
                            <Plus size={20} strokeWidth={3} className="text-[#D4AF37] group-hover:rotate-90 transition-transform duration-500" /> Add Saree
                        </button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-8 py-7 text-[10px] font-black text-slate-700 uppercase tracking-widest">Saree Details</th>
                                    <th className="px-8 py-7 text-[10px] font-black text-slate-700 uppercase tracking-widest">Type / Fabric</th>
                                    <th className="px-8 py-7 text-[10px] font-black text-slate-700 uppercase tracking-widest">Price</th>
                                    <th className="px-8 py-7 text-[10px] font-black text-slate-700 uppercase tracking-widest">Stock Status</th>
                                    <th className="px-8 py-7 text-[10px] font-black text-slate-700 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-24 text-center"><Loader2 size={40} className="animate-spin text-[#D4AF37] mx-auto opacity-30" /></td></tr>
                                ) : products.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm shrink-0">
                                                    {p.primary_image ? <img src={p.primary_image} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x300/f1f5f9/94a3b8?text=No+Image'; }} className="w-full h-full object-cover" /> : <LucideImage size={20} className="mx-auto mt-4 text-slate-300" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-950 text-sm group-hover:text-[#D4AF37] transition-colors">{p.name}</p>
                                                    <p className="text-[10px] font-black text-slate-500 mt-0.5">{p.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-950 shadow-sm">{p.fabric}</span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-slate-950 text-base">₹{p.price.toLocaleString()}</td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusBadge(p.status)}`}>
                                                <div className={`w-1 h-1 rounded-full ${p.status === 'In Stock' ? 'bg-emerald-500 animate-pulse' : p.status === 'Low Stock' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                                {p.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button onClick={() => openEditProduct(p)} className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl bg-white border border-slate-100 transition-all"><Edit2 size={15} strokeWidth={2.5} /></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl bg-white border border-slate-100 transition-all"><Trash2 size={15} strokeWidth={2.5} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Total</p>
                                <span className="text-slate-950 text-sm font-black px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">{total}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2.5 border border-slate-200 rounded-xl disabled:opacity-20 hover:bg-slate-50 bg-white transition-all text-slate-950"><ChevronLeft size={16} strokeWidth={3} /></button>
                                <span className="text-xs font-black px-4 text-slate-950">Page {page} of {totalPages}</span>
                                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2.5 border border-slate-200 rounded-xl disabled:opacity-20 hover:bg-slate-50 bg-white transition-all text-slate-950"><ChevronRight size={16} strokeWidth={3} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm">
                        <div className="relative flex-1 max-w-md group">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" />
                            <input type="text" placeholder="Search saree collections..." value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border border-transparent focus:border-[#D4AF37]/30 focus:bg-white transition-all placeholder:text-slate-400" />
                        </div>
                        <button onClick={openAddType} className="group flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-[0.25em] text-[13px] shadow-2xl shadow-slate-200 hover:bg-slate-800 hover:shadow-slate-300 transition-all active:scale-95">
                            <Plus size={20} strokeWidth={3} className="text-[#D4AF37] group-hover:rotate-90 transition-transform duration-500" /> Add Saree Type
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sareeTypes.map((type) => (
                            <div key={type.id} className="group bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-500">
                                <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden mb-5 bg-slate-100">
                                    {type.image ? <img src={type.image} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/f1f5f9/94a3b8?text=Collection'; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <LucideImage size={40} className="m-auto text-slate-200" />}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                                        <button onClick={() => openEditType(type)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-blue-500 shadow-lg hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteType(type.id)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-rose-500 shadow-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-[#D4AF37] transition-colors">{type.name}</h3>
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">/{type.slug}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Product Modal (Copied Design from AdminProducts) ────────── */}
            <AnimatePresence>
                {showProductModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/60 backdrop-blur-md z-[110] flex items-center justify-center p-6"
                        onClick={() => setShowProductModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[#041E18]/5"
                            onClick={e => e.stopPropagation()}>

                            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-slate-50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">{editProduct ? "Edit Saree" : "Add New Saree"}</h2>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mt-1">Saree Inventory Portal</p>
                                </div>
                                <button onClick={() => setShowProductModal(false)} className="p-3 text-slate-400 hover:text-rose-500 bg-white border border-slate-200 rounded-2xl transition-all"><X size={20} strokeWidth={3} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Product Name *</label>
                                        <input type="text" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all" placeholder="e.g. Royal Banarasi Silk" />
                                    </div>

                                    <div className="md:col-span-2 py-4 flex items-center gap-4">
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                        <span className="text-[9px] font-black text-[#B48C5E] uppercase tracking-[0.4em] whitespace-nowrap">Classification</span>
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Saree Type *</label>
                                        <select value={productForm.saree_type_id} onChange={e => setProductForm(f => ({ ...f, saree_type_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Saree Type</option>
                                            {masters.saree_types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Blouse Style</label>
                                        <select value={productForm.blouse_style_id} onChange={e => setProductForm(f => ({ ...f, blouse_style_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Blouse Style</option>
                                            {masters.blouse_styles?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Fabric *</label>
                                        <select value={productForm.fabric_id} onChange={e => {
                                            const val = e.target.value;
                                            const name = masters.fabric_types?.find(f => String(f.id) === val)?.name || "Pure Silk";
                                            setProductForm(f => ({ ...f, fabric_id: val, fabric: name }));
                                        }}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Fabric</option>
                                            {masters.fabric_types?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Colour</label>
                                        <select value={productForm.colour_id} onChange={e => setProductForm(f => ({ ...f, colour_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Colour</option>
                                            {masters.colours?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Units in Stock *</label>
                                        <input type="number" value={productForm.stock_qty} onChange={e => setProductForm(f => ({ ...f, stock_qty: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all" placeholder="50" />
                                    </div>

                                    <div className="md:col-span-2 py-4 flex items-center gap-4">
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                        <span className="text-[9px] font-black text-[#B48C5E] uppercase tracking-[0.4em] whitespace-nowrap">Pricing</span>
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Regular Price (₹) *</label>
                                        <input type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-extrabold text-slate-950 outline-none transition-all" placeholder="12500" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Discount Price (₹)</label>
                                        <input type="number" value={productForm.discount_price} onChange={e => setProductForm(f => ({ ...f, discount_price: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-extrabold text-slate-950 outline-none transition-all" placeholder="Optional" />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Description</label>
                                        <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                                            rows={4} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all resize-none shadow-inner"
                                            placeholder="Detail the craftsmanship..." />
                                    </div>

                                    <div className="md:col-span-2 flex items-center gap-8 pt-6">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${productForm.is_new === 1 ? 'bg-[#D4AF37]' : 'bg-slate-200'}`}>
                                                <motion.div animate={{ x: productForm.is_new === 1 ? 16 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </div>
                                            <input type="checkbox" checked={productForm.is_new === 1} onChange={e => setProductForm(f => ({ ...f, is_new: e.target.checked ? 1 : 0 }))} className="hidden" />
                                            <span className="text-[11px] font-black uppercase text-slate-950 tracking-widest group-hover:text-[#D4AF37] transition-colors">Mark as New</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${productForm.is_bestseller === 1 ? 'bg-slate-950' : 'bg-slate-200'}`}>
                                                <motion.div animate={{ x: productForm.is_bestseller === 1 ? 16 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </div>
                                            <input type="checkbox" checked={productForm.is_bestseller === 1} onChange={e => setProductForm(f => ({ ...f, is_bestseller: e.target.checked ? 1 : 0 }))} className="hidden" />
                                            <span className="text-[11px] font-black uppercase text-slate-950 tracking-widest group-hover:text-[#D4AF37] transition-colors">Bestseller</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Visual Documentation</label>
                                        <div onClick={() => productFileInputRef.current?.click()}
                                            className="group/upload border-2 border-dashed border-slate-200 rounded-[24px] p-10 text-center cursor-pointer hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all duration-500 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                                            <div className="relative z-10 space-y-4">
                                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mx-auto group-hover/upload:scale-110 transition-transform text-slate-300 group-hover/upload:text-[#D4AF37]">
                                                    <Upload size={32} strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-950 font-black">Import Visual Assets</p>
                                                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-1">High fidelity JPG, PNG, or WebP</p>
                                                </div>
                                                {imageFiles.length > 0 && (
                                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 p-3 bg-white border border-[#D4AF37]/20 rounded-xl shadow-lg">
                                                        <div className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center"><CheckCircle size={14} /></div>
                                                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{imageFiles.length} Archives Staged</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                        <input ref={productFileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="hidden"
                                            onChange={e => setImageFiles(Array.from(e.target.files ?? []))} />
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                                <button onClick={() => setShowProductModal(false)} className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:text-rose-500 transition-all">Abandon</button>
                                <button onClick={handleSaveProduct} disabled={saving}
                                    className="flex-[2] px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B48C5E] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group">
                                    {saving ? "Synchronizing..." : editProduct ? "Save Changes" : "Add Saree"}
                                </button>
                            </div>
                            {saveMsg && (
                                <div className={`absolute bottom-32 left-10 right-10 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl border ${saveMsg.startsWith("✓") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"} z-50 animate-in fade-in slide-in-from-bottom-5`}>
                                    <AlertCircle size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">{saveMsg}</span>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Saree Type Modal (Redesigned to match Product Modal style) ── */}
            <AnimatePresence>
                {showTypeModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/60 backdrop-blur-md z-[110] flex items-center justify-center p-6"
                        onClick={() => setShowTypeModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-[#041E18]/5"
                            onClick={e => e.stopPropagation()}>

                            <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950">{editType ? 'Edit' : 'Add'} Saree Type</h2>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mt-1">Classification Suite</p>
                                </div>
                                <button onClick={() => setShowTypeModal(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSaveType} className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Type Name *</label>
                                    <input type="text" required value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border-none focus:ring-2 focus:ring-[#D4AF37]/20 shadow-inner" placeholder="e.g. Banarasi Saree" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Slug (URL) *</label>
                                    <input type="text" required value={typeForm.slug} onChange={(e) => setTypeForm({ ...typeForm, slug: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border-none focus:ring-2 focus:ring-[#D4AF37]/20 shadow-inner" placeholder="e.g. banarasi-saree" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Editorial Description</label>
                                    <textarea value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border-none focus:ring-2 focus:ring-[#D4AF37]/20 shadow-inner min-h-[100px] resize-none" placeholder="Timeless luxury woven in tradition..." />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Thumbnail Identity</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-32 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shadow-inner">
                                            {typeForm.image ? <img src={typeForm.image} className="w-full h-full object-cover" /> : <LucideImage size={32} />}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input type="file" id="type-image-upload" className="hidden" accept="image/*" onChange={(e) => handleTypeImageUpload(e, 'image')} />
                                            <label htmlFor="type-image-upload" className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm text-slate-950">
                                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                                {uploading ? 'Negotiating...' : 'Upload Thumbnail'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Hero Banner Image</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="w-full h-40 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shadow-inner">
                                            {typeForm.hero_image ? <img src={typeForm.hero_image} className="w-full h-full object-cover" /> : <LucideImage size={32} />}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input type="file" id="type-hero-upload" className="hidden" accept="image/*" onChange={(e) => handleTypeImageUpload(e, 'hero_image')} />
                                            <label htmlFor="type-hero-upload" className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm text-slate-950">
                                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                                {uploading ? 'Negotiating...' : 'Upload Hero Banner'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={saving} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all disabled:opacity-50">
                                    {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : (editType ? 'Save Changes' : 'Add Saree Type')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
