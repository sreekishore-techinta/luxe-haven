import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Database, Search, Plus, Edit2, Trash2, X, AlertCircle, Loader2,
    CheckCircle, List, Tag, ShoppingBasket, Palette, Scissors, Maximize, Layers,
    Mic, Heart, PenTool, Image as LucideImage, ChevronLeft, ChevronRight, LayoutGrid, Upload
} from "lucide-react";

const BASE_URL = "http://localhost/luxe-haven";
const API = "http://localhost/luxe-haven/api";

type MasterType = {
    id: string;
    label: string;
    icon: any;
};

const MASTER_TYPES: MasterType[] = [
    { id: "categories", label: "Categories", icon: List },
    { id: "saree_types", label: "Saree Styles", icon: Tag },
    { id: "colours", label: "Colours", icon: Palette },
    { id: "fabric_types", label: "Fabric Types", icon: Scissors },
    { id: "sizes", label: "Sizes", icon: Maximize },
];

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    return createPortal(children, document.body);
};

export default function AdminGeneralMaster() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeType = searchParams.get("type") || "categories";
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const [form, setForm] = useState<any>({
        name: "",
        status: "Active",
        sort_order: 0,
        slug: "",
        image: "",
        description: "",
        is_featured: 0,
        show_on_menu: 0,
        category_id: "",
        hex_code: "#000000",
        meta_title: "",
        meta_description: "",
        chest_size: "",
        waist_size: "",
        hip_size: "",
        shoulder_size: "",
        length: "",
        sleeve_length: "",
        neck_depth: "",
        inseam: "",
    });

    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        if (activeType === 'sub_categories' || activeType === 'sizes') {
            fetchCategories();
        }
        fetchData();
    }, [activeType, page, search]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API}/masters/index.php?type=categories&limit=1000`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setCategories(json.data);
        } catch (e) {}
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/masters/index.php?type=${activeType}&page=${page}&search=${search}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setData(json.data);
                setTotalPages(json.pagination.total_pages);
                setTotal(json.pagination.total_items);
            }
        } catch (e) {
            setError("Connection to master registry failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setSelectedId(null);
        setError(null);
        setForm({
            name: "", status: "Active", sort_order: 0, slug: "", image: "", hero_image: "",
            description: "", is_featured: 0, show_on_menu: 0, category_id: categories[0]?.id || "",
            hex_code: "#000000", meta_title: "", meta_description: "",
            chest_size: "", waist_size: "", hip_size: "", shoulder_size: "", length: "",
            sleeve_length: "", neck_depth: "", inseam: "",
        });
        setShowModal(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditMode(true);
        setSelectedId(item.id);
        setError(null);
        setForm({ ...item, is_featured: parseInt(item.is_featured) || 0, show_on_menu: parseInt(item.show_on_menu) || 0 });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API}/masters/index.php?type=${activeType}&id=${id}`, { method: "DELETE", credentials: "include" });
            const json = await res.json();
            if (json.status === "success") fetchData();
        } catch (e) {}
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editMode ? "PUT" : "POST";
            const body = editMode ? { ...form, id: selectedId } : form;
            const res = await fetch(`${API}/masters/index.php?type=${activeType}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include"
            });
            const json = await res.json();
            if (json.status === "success") {
                setSaveMsg(`✓ Entry successfully ${editMode ? 'updated' : 'instated'}`);
                setTimeout(() => { setShowModal(false); setSaveMsg(null); fetchData(); }, 1500);
            } else {
                setError(json.message);
            }
        } catch (e) {
            setError("Master broadcast failed.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", activeType);
        formData.append("field", field);
        if (editMode && selectedId) formData.append("id", selectedId);
        try {
            const res = await fetch(`${API}/masters/upload_image.php`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            const json = await res.json();
            if (json.status === "success") {
                setForm((prev: any) => ({ ...prev, [field]: json.url }));
            } else {
                setError(json.message || "Image upload failed.");
            }
        } catch (e) {
            setError("Image upload failed. Check server.");
        }
    };

    const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, item: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const field = (activeType === 'categories' || activeType === 'saree_types') ? 'hero_image' : 'image';
        setUploadingId(item.id);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", activeType);
        formData.append("field", field);
        formData.append("id", String(item.id));
        try {
            const res = await fetch(`${API}/masters/upload_image.php`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            const json = await res.json();
            if (json.status === "success") {
                fetchData(); // refresh table to show new image
            } else {
                alert("Upload failed: " + (json.message || "Unknown error"));
            }
        } catch {
            alert("Upload failed. Check server.");
        } finally {
            setUploadingId(null);
            e.target.value = ""; // reset input
        }
    };

    const getFullUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}/${path}`;
    };

    const ActiveIcon = MASTER_TYPES.find(m => m.id === activeType)?.icon || List;

    return (
        <div className="w-full">
            {/* Header & Action Bar */}
            <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-sm">
                            <ActiveIcon size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-950 tracking-tight">{MASTER_TYPES.find(m => m.id === activeType)?.label}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Master Classification Archive</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="group flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl shadow-slate-200 hover:bg-slate-800 hover:shadow-slate-300 transition-all active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} className="text-[#D4AF37] group-hover:rotate-90 transition-transform duration-500" /> Add {MASTER_TYPES.find(m => m.id === activeType)?.label}
                </button>
            </div>

            {/* Filter & Intelligence Suite */}
            <div className="shrink-0 flex flex-wrap items-center gap-4 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm mb-6">
                <div className="relative flex-1 min-w-[320px] group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors">
                        <Search size={18} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${activeType.replace('_', ' ')} archives...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">Census Population</p>
                    <div className="w-1 h-4 bg-[#D4AF37] rounded-full opacity-30"></div>
                    <p className="text-sm font-black text-slate-950">{total}</p>
                </div>
            </div>

            {/* Data Manifest Table Section */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden mb-8">
                <div className="overflow-x-auto custom-scrollbar relative p-1">
                    {loading ? (
                        <div className="py-40 text-center space-y-6">
                            <div className="relative inline-block">
                                <Loader2 size={64} className="animate-spin text-[#D4AF37] opacity-20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full shadow-[0_0_15px_#D4AF37]" />
                                </div>
                            </div>
                            <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">Deciphering Registry...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="z-20">
                                <tr className="border-b border-slate-100 shadow-sm">
                                    <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[15%] bg-white z-30 shadow-sm border-b border-slate-100">Registry ID</th>
                                    <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[25%] bg-white z-30 shadow-sm border-b border-slate-100">Designation</th>
                                    {(activeType === 'sub_categories' || activeType === 'sizes') && <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[20%] bg-white z-30 shadow-sm border-b border-slate-100">Origin</th>}
                                    {(activeType === 'categories' || activeType === 'sub_categories' || activeType === 'saree_types') && <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[15%] text-center bg-white z-30 shadow-sm border-b border-slate-100">Asset</th>}
                                    {activeType === 'colours' && <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[15%] bg-white z-30 shadow-sm border-b border-slate-100">Spectrum</th>}
                                    <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[20%] bg-white z-30 shadow-sm border-b border-slate-100">Status</th>
                                    <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] text-right w-[15%] min-w-[120px] bg-white z-30 shadow-sm border-b border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.map((item, i) => (
                                    <tr key={item.id}
                                        className="hover:bg-slate-50/50 transition-all duration-300 group">
                                        <td className="py-6 px-8 text-[11px] font-black text-slate-500 font-mono tracking-tighter">OBJ_{String(item.id).padStart(4, '0')}</td>
                                        <td className="py-6 px-8">
                                            <p className="text-sm font-black text-slate-950 group-hover:text-[#D4AF37] transition-colors">{item.name}</p>
                                            <div className="flex items-center gap-3 mt-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Order: {item.sort_order}</span>
                                                {(item.is_featured === 1 || item.is_featured === "1") && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 text-[8px] font-black rounded-md uppercase tracking-widest border border-amber-500/30 ml-2">Premium</span>}
                                            </div>
                                        </td>
                                        {(activeType === 'sub_categories' || activeType === 'sizes') && (
                                            <td className="py-8 px-6">
                                                <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-[9px] font-black text-slate-800 uppercase tracking-widest shadow-sm">
                                                    {item.category_name || "General"}
                                                </span>
                                            </td>
                                        )}
                                        {(activeType === 'categories' || activeType === 'sub_categories' || activeType === 'saree_types') && (
                                            <td className="py-6 px-8">
                                                <label
                                                    htmlFor={`asset-inline-${item.id}`}
                                                    className="block w-16 h-14 mx-auto rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden shadow-inner flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-all cursor-pointer relative"
                                                    title="Click to upload image"
                                                >
                                                    {uploadingId === item.id ? (
                                                        <Loader2 size={14} className="text-[#D4AF37] animate-spin" />
                                                    ) : (item.image || item.hero_image) ? (
                                                        <>
                                                            <img src={getFullUrl(item.image || item.hero_image)} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                                <Upload size={12} className="text-white opacity-0 group-hover:opacity-100 transition-all" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Upload size={12} className="text-slate-300 group-hover:text-[#D4AF37] transition-colors" />
                                                            <span className="text-[7px] font-black text-slate-300 group-hover:text-[#D4AF37] uppercase tracking-wider transition-colors">Upload</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        id={`asset-inline-${item.id}`}
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                                        className="hidden"
                                                        onChange={(e) => handleInlineImageUpload(e, item)}
                                                    />
                                                </label>
                                            </td>
                                        )}
                                        {activeType === 'colours' && (
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-6 rounded-lg shadow-lg shadow-slate-200 border-2 border-white ring-1 ring-slate-100" style={{ backgroundColor: item.hex_code }} />
                                                    <span className="text-[10px] font-mono font-black text-slate-700 uppercase">{item.hex_code}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="py-6 px-8">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-300 font-black'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-500 animate-pulse outline outline-offset-1 outline-emerald-200' : 'bg-slate-500'}`}></div>
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 transition-all duration-300">
                                                <button onClick={() => handleOpenEdit(item)} className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"><Edit2 size={14} strokeWidth={3} /></button>
                                                <button onClick={() => setDeleteTargetId(item.id)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"><Trash2 size={14} strokeWidth={3} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Suite */}
                <div className="shrink-0 px-8 py-5 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Entry Manifest</span>
                        <div className="px-4 py-2 bg-white rounded-xl text-[11px] font-black text-slate-950 border border-slate-200 shadow-sm">
                            Page {page} <span className="text-slate-500 mx-2 font-black">/</span> {totalPages}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => page > 1 && setPage(p => p - 1)}
                            disabled={page <= 1}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-900 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </button>

                        <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-xl border border-slate-200">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all duration-300 ${n === page
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => page < totalPages && setPage(p => p + 1)}
                            disabled={page >= totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-900 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* CRUD Modal */}
            <AnimatePresence>
                {showModal && (
                    <ModalPortal>
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-8">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 overflow-hidden">

                                {/* Header */}
                                <div className="shrink-0 px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 backdrop-blur-md">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-slate-950 tracking-tight">{editMode ? 'Edit' : 'Add'} {MASTER_TYPES.find(m => m.id === activeType)?.label.replace(/ies$/, 'y').replace(/s$/, '')}</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></div>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">Master Record Configuration</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-slate-200 bg-white"><X size={20} strokeWidth={3} /></button>
                                </div>

                                {/* Form Content */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-slate-50/50">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600">
                                            <AlertCircle size={18} />
                                            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                                        </motion.div>
                                    )}
                                    <form onSubmit={handleSave} className="space-y-6">
                                        {/* Primary Identity */}
                                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Display Name *</label>
                                                <input
                                                    type="text" required
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    placeholder={`Enter ${activeType.slice(0, -1).replace('_', ' ')} designation...`}
                                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Index Order</label>
                                                    <input
                                                        type="number"
                                                        value={form.sort_order}
                                                        onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all"
                                                        placeholder="Rank"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Manifest Status</label>
                                                    <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 h-14">
                                                        {['Active', 'Inactive'].map(s => (
                                                            <button
                                                                key={s} type="button"
                                                                onClick={() => setForm({ ...form, status: s })}
                                                                className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${form.status === s ? "bg-slate-950 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:text-slate-950"}`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Configuration Card */}
                                        {(activeType === 'categories' || activeType === 'sub_categories' || activeType === 'saree_types') && (
                                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
                                                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                                    <h3 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Asset Configuration</h3>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-9 h-5 rounded-full flex items-center p-1 transition-all ${form.is_featured ? 'bg-[#D4AF37]' : 'bg-slate-200'}`} onClick={() => setForm({ ...form, is_featured: form.is_featured ? 0 : 1 })}>
                                                                <div className={`w-3 h-3 bg-white rounded-full transition-all transform ${form.is_featured ? 'translate-x-4' : 'translate-x-0'} shadow-sm`} />
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${form.is_featured ? 'text-[#D4AF37]' : 'text-slate-600'}`}>Featured</span>
                                                        </label>
                                                        {(activeType === 'categories' || activeType === 'sub_categories') && (
                                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                                <div className={`w-9 h-5 rounded-full flex items-center p-1 transition-all ${form.show_on_menu ? 'bg-slate-950' : 'bg-slate-200'}`} onClick={() => setForm({ ...form, show_on_menu: form.show_on_menu ? 0 : 1 })}>
                                                                    <div className={`w-3 h-3 bg-white rounded-full transition-all transform ${form.show_on_menu ? 'translate-x-4' : 'translate-x-0'} shadow-sm`} />
                                                                </div>
                                                                <span className={`text-[9px] font-black uppercase tracking-widest ${form.show_on_menu ? 'text-slate-950' : 'text-slate-600'}`}>In Menu</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>

                                                {activeType === 'sub_categories' && (
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Parent Classification</label>
                                                        <div className="relative">
                                                            <select
                                                                required
                                                                value={form.category_id}
                                                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer appearance-none"
                                                            >
                                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                            </select>
                                                            <Layers size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Display Slug</label>
                                                        <input type="text" value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="unique-handle"
                                                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-xs font-black font-mono text-slate-950" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Visual Asset</label>
                                                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200 group/asset">
                                                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover/asset:border-[#D4AF37]/30 transition-colors">
                                                                {form.image || form.hero_image ? (
                                                                    <img src={getFullUrl(form.image || form.hero_image)}
                                                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x600/f8f9fa/dee2e6?text=No+Asset"; }}
                                                                        className="w-full h-full object-cover" />
                                                                ) : <LucideImage size={24} className="text-slate-300" strokeWidth={1.5} />}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <input type="text" placeholder="Visual path or URL" value={form.image || form.hero_image || ""}
                                                                    onChange={(e) => setForm({ ...form, [activeType === 'categories' || activeType === 'saree_types' ? 'hero_image' : 'image']: e.target.value })}
                                                                    className="w-full px-3 py-2 bg-white/50 rounded-lg border border-transparent text-[10px] font-black outline-none focus:bg-white placeholder:text-slate-400" />
                                                                <input type="file" className="hidden" id="asset-upload" onChange={(e) => handleImageUpload(e, activeType === 'categories' || activeType === 'saree_types' ? 'hero_image' : 'image')} />
                                                                <label htmlFor="asset-upload" className="block text-center cursor-pointer text-[8px] font-black uppercase tracking-[0.2em] text-[#D4AF37] hover:underline transition-all">Upload Master Asset</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Registry Biography</label>
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-transparent focus-within:border-[#D4AF37]/20 transition-all">
                                                        <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed narration for this registry masterpiece..."
                                                            className="w-full bg-transparent text-sm font-black text-slate-950 min-h-[120px] resize-none outline-none leading-relaxed italic placeholder:text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Color Specification */}
                                        {activeType === 'colours' && (
                                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Chroma Specification</label>
                                                <div className="flex gap-6 items-center">
                                                    <div className="relative group shrink-0">
                                                        <input
                                                            type="color"
                                                            value={form.hex_code}
                                                            onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                                                            className="w-24 h-20 rounded-3xl border-4 border-slate-50 overflow-hidden cursor-pointer shadow-xl transition-transform group-hover:scale-105 p-0"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={form.hex_code}
                                                            onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                                                            className="w-full px-6 py-5 bg-slate-50 rounded-3xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-lg font-mono font-black uppercase text-slate-950 outline-none transition-all tracking-wider"
                                                            placeholder="#000000"
                                                        />
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Defined Spectral Index</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Sizes Configuration */}
                                        {activeType === 'sizes' && (
                                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
                                                <div className="space-y-3 border-b border-slate-50 pb-6">
                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Category Assignment</label>
                                                    <div className="relative">
                                                        <select
                                                            value={form.category_id || ""}
                                                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all cursor-pointer appearance-none"
                                                        >
                                                            <option value="">General / All Categories</option>
                                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                        <Layers size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                                    {[
                                                        { label: 'Chest Size', field: 'chest_size' },
                                                        { label: 'Waist Size', field: 'waist_size' },
                                                        { label: 'Hip Size', field: 'hip_size' },
                                                        { label: 'Shoulder', field: 'shoulder_size' },
                                                        { label: 'Total Length', field: 'length' },
                                                        { label: 'Sleeve Length', field: 'sleeve_length' },
                                                        { label: 'Neck Depth', field: 'neck_depth' },
                                                        { label: 'Inseam', field: 'inseam' },
                                                    ].map(f => (
                                                        <div key={f.field} className="space-y-2">
                                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">{f.label}</label>
                                                            <input
                                                                type="text"
                                                                value={form[f.field] || ""}
                                                                onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                                                                placeholder="e.g. 38 in"
                                                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-xs font-black text-slate-950 outline-none transition-all"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Size Guidance Notes</label>
                                                    <textarea
                                                        value={form.description || ""}
                                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                        placeholder="Detailed fit recommendations for artisan sizing..."
                                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-black text-slate-950 outline-none transition-all min-h-[100px] resize-none italic"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* SEO Suite */}
                                        {(activeType === 'categories' || activeType === 'sub_categories' || activeType === 'saree_types' || activeType === 'sizes') && (
                                            <div className="bg-slate-900 rounded-[32px] p-8 space-y-6 shadow-xl shadow-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-px bg-[#D4AF37]" />
                                                    <h4 className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">SEO Enhancement Suite</h4>
                                                </div>
                                                <div className="grid grid-cols-1 gap-6">
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Meta Title Tag</label>
                                                        <input type="text" value={form.meta_title || ""} onChange={e => setForm({ ...form, meta_title: e.target.value })}
                                                            className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-white outline-none focus:border-[#D4AF37]/30"
                                                            placeholder="Premium SEO Title" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Meta Narrative</label>
                                                        <textarea rows={3} value={form.meta_description || ""} onChange={e => setForm({ ...form, meta_description: e.target.value })}
                                                            className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-white outline-none focus:border-[#D4AF37]/30 resize-none"
                                                            placeholder="Strategic search description..." />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>

                                {/* Footer Action */}
                                <div className="shrink-0 p-8 lg:p-10 bg-white border-t border-slate-100 flex gap-4">
                                    {saveMsg ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                            className="flex-1 flex items-center gap-4 p-5 bg-emerald-50 text-emerald-600 rounded-[28px] border border-emerald-100">
                                            <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200"><CheckCircle size={20} strokeWidth={3} /></div>
                                            <span className="text-[12px] font-black uppercase tracking-widest">{saveMsg}</span>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <button onClick={() => setShowModal(false)} className="px-8 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-200">Discard</button>
                                            <button
                                                type="button" onClick={handleSave} disabled={saving}
                                                className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                                            >
                                                {editMode ? 'Save Changes' : `Add ${MASTER_TYPES.find(m => m.id === activeType)?.label.replace(/s$/, '')}`}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </ModalPortal>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTargetId !== null && (
                    <ModalPortal>
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
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Delete Entry?</h2>
                                    <p className="text-sm text-slate-400 font-medium text-center leading-relaxed">
                                        This will permanently delete this registry entry.<br />This action cannot be undone.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="px-8 pb-8 space-y-3">
                                    <button
                                        onClick={() => { handleDelete(deleteTargetId!); setDeleteTargetId(null); }}
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
                    </ModalPortal>
                )}
            </AnimatePresence>
        </div>
    );
}

const ACTIVE_DESCRIPTIONS = {
    categories: "The macro-architectural pillars of your collection catalogue.",
    saree_types: "The signature Saree styles that define your brand identity.",
    colours: "Definitive hue spectra for artisanal variations.",
    fabric_types: "The tactile materiality and soul of each masterpiece.",
    sizes: "Defined dimensions and anatomical proportions.",
};
