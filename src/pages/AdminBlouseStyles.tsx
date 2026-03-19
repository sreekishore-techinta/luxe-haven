import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Edit2, Trash2, X, Search, Loader2,
    CheckCircle, Camera, Image as LucideImage,
    Package, Filter, Eye, AlertCircle, Upload, ChevronLeft, ChevronRight, Layers
} from "lucide-react";

const API = "http://localhost/luxe-haven/api";

type Product = {
    id: number; sku: string; name: string; category: string;
    category_id: number | null;
    colour_id: number | null; fabric_id: number | null;
    size_id: number | null;
    blouse_style_id: number | null;
    sleeve_type_id: number | null;
    neck_type_id: number | null;
    description: string; price: number; discount_price: number | null;
    fabric: string; stock_qty: number; status: string;
    is_new: number; is_bestseller: number;
    rating: number; review_count: number;
    primary_image: string | null; created_at: string;
};

type BlouseStyle = {
    id: number; name: string; description: string; price: number; category: string; image: string; created_at: string;
};

const emptyProductForm = {
    name: "", category: "Blouses", category_id: "2", description: "", price: "",
    discount_price: "", fabric: "Raw Silk", stock_qty: "", is_new: 0, is_bestseller: 0,
    colour_id: "", fabric_id: "", size_id: "", blouse_style_id: "",
    sleeve_type_id: "", neck_type_id: "",
};

const emptyStyleForm = { name: "", description: "", price: "", category: "Designer", image: "" };

const STATUSES = ["All", "In Stock", "Low Stock", "Out of Stock"];

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        "In Stock": "bg-emerald-50 text-emerald-800 border-emerald-200 font-black",
        "Low Stock": "bg-amber-50 text-amber-800 border-amber-200 font-black",
        "Out of Stock": "bg-rose-50 text-rose-800 border-rose-200 font-black",
    };
    return map[s] ?? "bg-slate-50 text-slate-700 border-slate-200 font-black";
};

export default function AdminBlouseStyles() {
    const [activeTab, setActiveTab] = useState<"inventory" | "styles" | "attributes">("inventory");
    const [activeAttr, setActiveAttr] = useState<"sleeve_types" | "neck_types">("sleeve_types");
    const [products, setProducts] = useState<Product[]>([]);
    const [styles, setStyles] = useState<BlouseStyle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("All");

    const [showProductModal, setShowProductModal] = useState(false);
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [editStyle, setEditStyle] = useState<BlouseStyle | null>(null);
    const [productForm, setProductForm] = useState({ ...emptyProductForm });
    const [styleForm, setStyleForm] = useState({ ...emptyStyleForm });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    const [viewProduct, setViewProduct] = useState<(Product & { images: { image_path: string; is_primary: number }[] }) | null>(null);
    const [viewLoading, setViewLoading] = useState(false);

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const productFileInputRef = useRef<HTMLInputElement>(null);

    const [masters, setMasters] = useState<Record<string, any[]>>({
        colours: [], fabric_types: [], sizes: [], blouse_styles: [],
        sleeve_types: [], neck_types: []
    });
    const [attrs, setAttrs] = useState<any[]>([]);
    const [showAttrModal, setShowAttrModal] = useState(false);
    const [editAttr, setEditAttr] = useState<any | null>(null);
    const [attrForm, setAttrForm] = useState({ name: "", status: "Active", sort_order: 0 });

    useEffect(() => {
        fetchMasters();
    }, []);

    useEffect(() => {
        if (activeTab === "inventory") fetchProducts();
        else if (activeTab === "styles") fetchStyles();
        else fetchAttrs();
    }, [activeTab, page, statusFilter, search, activeAttr]);

    const fetchMasters = async () => {
        const types = ["colours", "fabric_types", "sizes", "blouse_styles", "sleeve_types", "neck_types"];
        const results: Record<string, any[]> = {};
        for (const t of types) {
            try {
                const endpoint = t === 'blouse_styles' ? 'public/blouse_styles.php' : `masters/index.php?type=${t}&status=Active&per_page=100`;
                const res = await fetch(`${API}/${endpoint}`, { credentials: "include" });
                const json = await res.json();
                if (json.status === "success") {
                    results[t] = json.data;
                }
            } catch (e) { }
        }
        setMasters(prev => ({ ...prev, ...results }));
    };

    const fetchAttrs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type: activeAttr,
                search,
                per_page: "50"
            });
            const res = await fetch(`${API}/masters/index.php?${params.toString()}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setAttrs(json.data);
        } catch (err) {
            setError("Failed to fetch attributes.");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                category: "2",
                page: String(page),
                per_page: "12",
                search,
                status: statusFilter
            });
            const res = await fetch(`${API}/products/index.php?${params.toString()}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setProducts(json.data);
                setTotal(json.total);
                setTotalPages(json.total_pages);
            }
        } catch (err) {
            setError("Failed to synchronize with inventory.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStyles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/blouse_styles/index.php`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setStyles(json.data);
        } catch (err) {
            setError("Failed to fetch design styles.");
        } finally {
            setLoading(false);
        }
    };

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
            name: p.name, category: p.category, category_id: String(p.category_id || "2"),
            description: p.description || "",
            price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : "",
            fabric: p.fabric || "Raw Silk", stock_qty: String(p.stock_qty),
            is_new: p.is_new, is_bestseller: p.is_bestseller,
            colour_id: p.colour_id ? String(p.colour_id) : "",
            fabric_id: p.fabric_id ? String(p.fabric_id) : "",
            size_id: p.size_id ? String(p.size_id) : "",
            blouse_style_id: p.blouse_style_id ? String(p.blouse_style_id) : "",
            sleeve_type_id: p.sleeve_type_id ? String(p.sleeve_type_id) : "",
            neck_type_id: p.neck_type_id ? String(p.neck_type_id) : "",
        });
        setImageFiles([]);
        setSaveMsg(null);
        setShowProductModal(true);
    };

    const handleSaveProduct = async () => {
        if (!productForm.name || !productForm.price || !productForm.stock_qty || !productForm.blouse_style_id) {
            setSaveMsg("All required fields (*) must be filled.");
            return;
        }
        setSaving(true);
        setSaveMsg(null);
        try {
            let productId: number | null = null;
            const payload = {
                ...productForm,
                category_id: 2,
                price: parseFloat(productForm.price),
                discount_price: productForm.discount_price ? parseFloat(productForm.discount_price) : null,
                stock_qty: parseInt(productForm.stock_qty),
                colour_id: productForm.colour_id ? parseInt(productForm.colour_id) : null,
                fabric_id: productForm.fabric_id ? parseInt(productForm.fabric_id) : null,
                size_id: productForm.size_id ? parseInt(productForm.size_id) : null,
                blouse_style_id: parseInt(productForm.blouse_style_id),
                sleeve_type_id: productForm.sleeve_type_id ? parseInt(productForm.sleeve_type_id) : null,
                neck_type_id: productForm.neck_type_id ? parseInt(productForm.neck_type_id) : null,
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
        if (!confirm("Delete this blouse?")) return;
        try {
            const res = await fetch(`${API}/products/product.php?id=${id}`, { method: "DELETE", credentials: "include" });
            const json = await res.json();
            if (json.status === "success") fetchProducts();
        } catch (e: any) { alert(e.message); }
    };

    const openAddStyle = () => {
        setEditStyle(null);
        setStyleForm({ ...emptyStyleForm });
        setSaveMsg(null);
        setShowStyleModal(true);
    };

    const openEditStyle = (s: BlouseStyle) => {
        setEditStyle(s);
        setStyleForm({ name: s.name, description: s.description, price: String(s.price), category: s.category, image: s.image });
        setSaveMsg(null);
        setShowStyleModal(true);
    };

    const handleSaveStyle = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveMsg(null);
        try {
            const url = editStyle ? `${API}/admin/blouse_styles/index.php?id=${editStyle.id}` : `${API}/admin/blouse_styles/index.php`;
            const method = editStyle ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(styleForm),
            });
            const json = await res.json();
            if (json.status === "success") {
                setSaveMsg("✓ Style saved successfully!");
                setTimeout(() => { setShowStyleModal(false); fetchStyles(); fetchMasters(); }, 1000);
            } else throw new Error(json.message);
        } catch (e: any) {
            setSaveMsg(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStyle = async (id: number) => {
        if (!confirm("Are you sure? This will remove the style from database.")) return;
        try {
            const res = await fetch(`${API}/admin/blouse_styles/index.php?id=${id}`, { method: "DELETE", credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                fetchStyles();
                fetchMasters();
            }
        } catch (e: any) { alert(e.message); }
    };

    const handleStyleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append("image", file);
        try {
            const res = await fetch(`${API}/admin/blouse_styles/upload.php`, { method: "POST", body: fd, credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setStyleForm(f => ({ ...f, image: json.url }));
        } catch (e) { alert("Upload failed."); } finally { setUploading(false); }
    };

    const handleSaveAttr = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveMsg(null);
        try {
            const url = editAttr ? `${API}/masters/index.php?type=${activeAttr}&id=${editAttr.id}` : `${API}/masters/index.php?type=${activeAttr}`;
            const method = editAttr ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(attrForm),
            });
            const json = await res.json();
            if (json.status === "success") {
                setSaveMsg("✓ Attribute saved!");
                setTimeout(() => { setShowAttrModal(false); fetchAttrs(); fetchMasters(); }, 1000);
            } else throw new Error(json.message);
        } catch (e: any) { setSaveMsg(e.message); } finally { setSaving(false); }
    };

    const handleDeleteAttr = async (id: number) => {
        if (!confirm("Remove this attribute?")) return;
        try {
            const res = await fetch(`${API}/masters/index.php?type=${activeAttr}&id=${id}`, { method: "DELETE", credentials: "include" });
            const json = await res.json();
            if (json.status === "success") { fetchAttrs(); fetchMasters(); }
        } catch (e: any) { alert(e.message); }
    };

    return (
        <div className="w-full">

                {/* Header */}
                <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-950 tracking-tight">Blouse <span className="text-[#D4AF37] italic font-serif">Atelier</span></h1>
                        <p className="text-slate-600 text-sm font-black mt-1 uppercase tracking-widest opacity-80">Design house management &amp; inventory control.</p>
                    </div>

                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
                        <button onClick={() => { setActiveTab("inventory"); setPage(1); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'}`}>Inventory</button>
                        <button onClick={() => { setActiveTab("styles"); setPage(1); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'styles' ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'}`}>Styles</button>
                        <button onClick={() => { setActiveTab("attributes"); setPage(1); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'attributes' ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'}`}>Attributes</button>
                    </div>
                </div>

                {activeTab === "inventory" ? (
                    <div className="w-full">
                        <div className="shrink-0 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm mb-6">
                            <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
                                <div className="relative flex-1 max-w-md group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} strokeWidth={2.5} />
                                    <input type="text" placeholder="Search archives..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border border-transparent focus:border-[#D4AF37]/30 focus:bg-white transition-all placeholder:text-slate-400" />
                                </div>
                                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-950 outline-none shadow-sm cursor-pointer hover:border-slate-300 transition-all">
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button onClick={openAddProduct} className="group w-full lg:w-auto flex items-center justify-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all">
                                <Plus size={16} strokeWidth={3.5} className="text-[#D4AF37] group-hover:rotate-90 transition-transform duration-500" /> Add Blouse
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <Loader2 className="animate-spin text-[#D4AF37] opacity-60" size={48} strokeWidth={3} />
                                <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.25em]">Synchronizing Inventory...</p>
                            </div>
                        ) : (
                            <div className="pb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
                                    {products.map((p) => (
                                        <div key={p.id} className="group bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-500">
                                            <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
                                                {p.primary_image ? (
                                                    <img src={p.primary_image} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x300/f1f5f9/94a3b8?text=No+Image'; }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={48} /></div>
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border backdrop-blur-md ${statusBadge(p.status)}`}>{p.status}</span>
                                                </div>
                                                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                                                    <button onClick={() => openEditProduct(p)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-blue-500 shadow-lg hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-rose-500 shadow-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">#{p.sku}</span>
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{p.fabric}</span>
                                                </div>
                                                <h3 className="font-black text-slate-950 text-base mb-3 truncate group-hover:text-[#D4AF37] transition-colors">{p.name}</h3>
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                    <p className="text-xl font-black text-slate-950">₹{p.price.toLocaleString()}</p>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{p.stock_qty} Units</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="shrink-0 flex items-center justify-center gap-4 mt-4 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit mx-auto">
                                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2.5 border border-slate-200 rounded-xl disabled:opacity-20 hover:bg-slate-50 bg-white transition-all text-slate-950"><ChevronLeft size={16} strokeWidth={3} /></button>
                                <span className="text-xs font-black px-4 text-slate-950">Page {page} of {totalPages}</span>
                                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2.5 border border-slate-200 rounded-xl disabled:opacity-20 hover:bg-slate-50 bg-white transition-all text-slate-950"><ChevronRight size={16} strokeWidth={3} /></button>
                            </div>
                        )}
                    </div>
                ) : activeTab === "styles" ? (
                    <div className="w-full">
                        <div className="shrink-0 flex justify-between items-center bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm mb-6">
                            <h2 className="text-xl font-black text-slate-950">Blouse Style Catalogue</h2>
                            <button onClick={openAddStyle} className="group flex items-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">
                                <Plus size={16} strokeWidth={3.5} className="text-[#D4AF37] group-hover:rotate-90 transition-transform duration-500" /> New Style
                            </button>
                        </div>
                        <div className="pb-8 px-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {styles.map((style) => (
                                    <div key={style.id} className="group bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-500">
                                        <div className="aspect-[3/4] rounded-[24px] overflow-hidden mb-5 relative bg-slate-100">
                                            <img src={style.image} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/f1f5f9/94a3b8?text=Style'; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                                                <button onClick={() => openEditStyle(style)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-blue-500 shadow-lg hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteStyle(style.id)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-rose-500 shadow-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="px-2 pb-2">
                                            <h3 className="font-black text-slate-950 mb-1 group-hover:text-[#D4AF37] transition-colors">{style.name}</h3>
                                            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{style.category}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="shrink-0 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm mb-6">
                            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <button onClick={() => setActiveAttr("sleeve_types")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeAttr === 'sleeve_types' ? 'bg-white text-slate-950 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-950 hover:bg-white'}`}>Sleeves</button>
                                <button onClick={() => setActiveAttr("neck_types")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeAttr === 'neck_types' ? 'bg-white text-slate-950 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-950 hover:bg-white'}`}>Necks</button>
                            </div>
                            <button onClick={() => { setEditAttr(null); setAttrForm({ name: "", status: "Active", sort_order: 0 }); setShowAttrModal(true); }} className="group flex items-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">
                                <Plus size={16} strokeWidth={3.5} className="text-[#D4AF37] group-hover:rotate-90 transition-transform duration-500" /> New {activeAttr === 'sleeve_types' ? 'Sleeve' : 'Neck'} Type
                            </button>
                        </div>

                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
                        <div className="overflow-x-auto custom-scrollbar relative">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                                            <th className="px-8 py-7 text-[10px] font-black text-slate-600 uppercase tracking-widest">Type Name</th>
                                            <th className="px-8 py-7 text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-7 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {attrs.map((a) => (
                                            <tr key={a.id} className="hover:bg-slate-50/70 transition-colors group">
                                                <td className="px-8 py-6 font-black text-slate-950 group-hover:text-[#D4AF37] transition-colors">{a.name}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${a.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${a.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                                        {a.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <button onClick={() => { setEditAttr(a); setAttrForm({ name: a.name, status: a.status, sort_order: a.sort_order }); setShowAttrModal(true); }} className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl bg-white border border-slate-100 transition-all"><Edit2 size={15} strokeWidth={2.5} /></button>
                                                        <button onClick={() => handleDeleteAttr(a.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl bg-white border border-slate-100 transition-all"><Trash2 size={15} strokeWidth={2.5} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

            {/* ─── Product Modal (Identical to AdminProducts) ────────────────── */}
            <AnimatePresence>
                {showProductModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/60 backdrop-blur-md z-[110] flex items-center justify-center p-6"
                        onClick={() => setShowProductModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[#041E18]/5"
                            onClick={e => e.stopPropagation()}>

                            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-[#FBFAF7]">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">{editProduct ? "Edit Blouse" : "Add New Blouse"}</h2>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mt-1">Design House Registry</p>
                                </div>
                                <button onClick={() => setShowProductModal(false)} className="p-3 text-slate-400 hover:text-rose-500 bg-white border border-slate-200 rounded-2xl transition-all"><X size={20} strokeWidth={3} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Design Name *</label>
                                        <input type="text" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Royal Velvet V-Cut" />
                                    </div>

                                    <div className="md:col-span-2 py-4 flex items-center gap-4">
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                        <span className="text-[9px] font-black text-[#B48C5E] uppercase tracking-[0.4em] whitespace-nowrap">Classification</span>
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Style Pattern *</label>
                                        <select value={productForm.blouse_style_id} onChange={e => setProductForm(f => ({ ...f, blouse_style_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Style Pattern</option>
                                            {masters.blouse_styles?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Fabric *</label>
                                        <select value={productForm.fabric_id} onChange={e => setProductForm(f => ({ ...f, fabric_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Fabric</option>
                                            {masters.fabric_types?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Primary Colour</label>
                                        <select value={productForm.colour_id} onChange={e => setProductForm(f => ({ ...f, colour_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Colour</option>
                                            {masters.colours?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Standard Size</label>
                                        <select value={productForm.size_id} onChange={e => setProductForm(f => ({ ...f, size_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Size</option>
                                            {masters.sizes?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Sleeve Type</label>
                                        <select value={productForm.sleeve_type_id} onChange={e => setProductForm(f => ({ ...f, sleeve_type_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Sleeve</option>
                                            {masters.sleeve_types?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Neck Type</label>
                                        <select value={productForm.neck_type_id} onChange={e => setProductForm(f => ({ ...f, neck_type_id: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer">
                                            <option value="">Select Neck</option>
                                            {masters.neck_types?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 py-4 flex items-center gap-4">
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                        <span className="text-[9px] font-black text-[#B48C5E] uppercase tracking-[0.4em] whitespace-nowrap">Commercials</span>
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent flex-1" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Regular Price (₹) *</label>
                                        <input type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all font-['Poppins',sans-serif] placeholder:text-slate-400" placeholder="4990" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Discount Price (₹)</label>
                                        <input type="number" value={productForm.discount_price} onChange={e => setProductForm(f => ({ ...f, discount_price: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all font-['Poppins',sans-serif] placeholder:text-slate-400" placeholder="Optional" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Units in Stock *</label>
                                        <input type="number" value={productForm.stock_qty} onChange={e => setProductForm(f => ({ ...f, stock_qty: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all placeholder:text-slate-400" placeholder="25" />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Style Narrative</label>
                                        <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                                            rows={4} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all resize-none shadow-inner placeholder:text-slate-400"
                                            placeholder="Detail the narrative of this piece..." />
                                    </div>

                                    <div className="md:col-span-2 flex items-center gap-8 pt-6">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${productForm.is_new === 1 ? 'bg-[#D4AF37]' : 'bg-slate-200'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${productForm.is_new === 1 ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                            <input type="checkbox" checked={productForm.is_new === 1} onChange={e => setProductForm(f => ({ ...f, is_new: e.target.checked ? 1 : 0 }))} className="hidden" />
                                            <span className="text-[11px] font-black uppercase text-slate-950 tracking-widest group-hover:text-[#D4AF37] transition-colors">Mark as New</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${productForm.is_bestseller === 1 ? 'bg-slate-950' : 'bg-slate-200'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${productForm.is_bestseller === 1 ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                            <input type="checkbox" checked={productForm.is_bestseller === 1} onChange={e => setProductForm(f => ({ ...f, is_bestseller: e.target.checked ? 1 : 0 }))} className="hidden" />
                                            <span className="text-[11px] font-black uppercase text-slate-950 tracking-widest group-hover:text-[#D4AF37] transition-colors">Bestseller</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Creative Assets</label>
                                        <div onClick={() => productFileInputRef.current?.click()}
                                            className="group/upload border-2 border-dashed border-slate-200 rounded-[24px] p-10 text-center cursor-pointer hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all duration-500 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                                            <div className="relative z-10 space-y-4">
                                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mx-auto group-hover/upload:scale-110 transition-transform text-slate-300 group-hover/upload:text-[#D4AF37]">
                                                    <Upload size={32} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-950 font-black">Import Visual Mastery</p>
                                                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-1">Studio Shots (JPG, PNG, WebP)</p>
                                                </div>
                                                {imageFiles.length > 0 && (
                                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 p-3 bg-white border border-[#D4AF37]/20 rounded-xl shadow-lg">
                                                        <div className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center"><CheckCircle size={14} /></div>
                                                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{imageFiles.length} Frames Staged</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                        <input ref={productFileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="hidden"
                                            onChange={e => setImageFiles(Array.from(e.target.files ?? []))} />
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-8 bg-[#FBFAF7] border-t border-slate-100 flex gap-4">
                                <button onClick={() => setShowProductModal(false)} className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:text-rose-600 transition-all">Abandon</button>
                                <button onClick={handleSaveProduct} disabled={saving}
                                    className="flex-[2] px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B48C5E] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                    {saving ? "Synchronizing..." : editProduct ? "Authorize Revision" : "Finalize Concept"}
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

            {/* ─── Style Modal (matches Product Modal design) ────────── */}
            <AnimatePresence>
                {showStyleModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/60 backdrop-blur-md z-[110] flex items-center justify-center p-6"
                        onClick={() => setShowStyleModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-[#041E18]/5"
                            onClick={e => e.stopPropagation()}>

                            <div className="px-10 py-8 bg-[#FBFAF7] border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950">{editStyle ? 'Edit' : 'Add'} Blouse Style</h2>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mt-1">Design Blueprint</p>
                                </div>
                                <button onClick={() => setShowStyleModal(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-all"><X size={24} strokeWidth={3} /></button>
                            </div>

                            <form onSubmit={handleSaveStyle} className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Pattern Name *</label>
                                    <input type="text" required value={styleForm.name} onChange={(e) => setStyleForm({ ...styleForm, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border-none focus:ring-2 focus:ring-[#D4AF37]/20 shadow-inner placeholder:text-slate-400" placeholder="e.g. Royal Velvet V-Cut" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Market Segment</label>
                                    <select value={styleForm.category} onChange={e => setStyleForm({ ...styleForm, category: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border-none focus:ring-2 focus:ring-[#D4AF37]/20 shadow-inner cursor-pointer">
                                        <option>Designer</option>
                                        <option>Bridal</option>
                                        <option>Festive</option>
                                        <option>Casual</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Visual Identity</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-32 rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-300 shadow-inner">
                                            {styleForm.image ? <img src={styleForm.image} className="w-full h-full object-cover" /> : <LucideImage size={32} strokeWidth={2.5} />}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input type="file" id="style-image-upload" className="hidden" accept="image/*" onChange={handleStyleImageUpload} />
                                            <label htmlFor="style-image-upload" className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} strokeWidth={2.5} />}
                                                {uploading ? 'Negotiating...' : 'Upload Reference'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={saving} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all disabled:opacity-50">
                                    {saving ? <Loader2 className="animate-spin mx-auto" size={18} strokeWidth={3} /> : (editStyle ? 'Authorize Revision' : 'Finalize Pattern')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ─── Attribute Modal ────────────────────────────────────────── */}
            <AnimatePresence>
                {showAttrModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#041E18]/60 backdrop-blur-md z-[110] flex items-center justify-center p-6"
                        onClick={() => setShowAttrModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-[#041E18]/5"
                            onClick={e => e.stopPropagation()}>
                            <div className="px-10 py-8 bg-[#FBFAF7] border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950">{editAttr ? 'Edit' : 'Add'} {activeAttr === 'sleeve_types' ? 'Sleeve' : 'Neck'}</h2>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mt-1">Design Blueprint</p>
                                </div>
                                <button onClick={() => setShowAttrModal(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-all"><X size={24} strokeWidth={3} /></button>
                            </div>
                            <form onSubmit={handleSaveAttr} className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Type Name *</label>
                                    <input type="text" required value={attrForm.name} onChange={(e) => setAttrForm({ ...attrForm, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border-none focus:ring-2 focus:ring-[#D4AF37]/20 shadow-inner placeholder:text-slate-400" placeholder="e.g. Elbow Length" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Lifecycle Status</label>
                                    <select value={attrForm.status} onChange={e => setAttrForm({ ...attrForm, status: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-black text-slate-950 outline-none border-none focus:ring-2 focus:ring-[#D4AF37]/20 shadow-inner cursor-pointer">
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={saving} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                    {saving ? <Loader2 className="animate-spin" size={18} strokeWidth={3} /> : <CheckCircle size={18} strokeWidth={3} />}
                                    {saving ? 'Synchronizing...' : (editAttr ? 'Authorize Revision' : 'Confirm Type')}
                                </button>
                            </form>
                            {saveMsg && (
                                <div className={`mx-10 mb-8 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl border ${saveMsg.startsWith("✓") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"} animate-in fade-in slide-in-from-bottom-5`}>
                                    <AlertCircle size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">{saveMsg}</span>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
