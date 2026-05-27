import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Database, Search, Plus, Edit2, Trash2, X, AlertCircle, Loader2,
    CheckCircle, List, Tag, ShoppingBasket, Palette, Scissors, Maximize, Layers,
    Mic, Heart, PenTool, Image as LucideImage, ChevronLeft, ChevronRight, LayoutGrid, Upload
} from "lucide-react";

import { BASE_URL, API_URL as API } from "@/api_config";

type MasterType = {
    id: string;
    label: string;
    icon: any;
};

const MASTER_TYPES: MasterType[] = [
    { id: "categories", label: "Categories", icon: LayoutGrid },
    { id: "saree_types", label: "Saree Types", icon: Tag },
    { id: "fabric_types", label: "Fabric Types", icon: ShoppingBasket },
    { id: "colours", label: "Colours", icon: Palette },
    { id: "sizes", label: "Sizes", icon: Maximize },
    { id: "add_ons", label: "Add-on Services", icon: Scissors },
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
        input_type: "checkbox",
        group_name: "General"
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
            const res = await fetch(`${API}/masters/index.php?type=categories&per_page=200&_t=${Date.now()}`, { credentials: "include", cache: "no-store" });
            const json = await res.json();
            if (json.status === "success") setCategories(json.data);
        } catch (e) {}
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/masters/index.php?type=${activeType}&page=${page}&per_page=100&search=${search}&_t=${Date.now()}`, { credentials: "include", cache: "no-store" });
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
            input_type: "checkbox", group_name: "General"
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
            const endpoint = editMode ? `${API}/masters/index.php?type=${activeType}&id=${selectedId}` : `${API}/masters/index.php?type=${activeType}`;
            const res = await fetch(endpoint, {
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
                                    <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[40%] bg-white z-30 shadow-sm border-b border-slate-100">Designation</th>
                                    <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[20%] bg-white z-30 shadow-sm border-b border-slate-100 text-center">Index Order</th>
                                    <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] w-[20%] bg-white z-30 shadow-sm border-b border-slate-100">Status</th>
                                    <th className="sticky top-20 py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] text-right w-[20%] min-w-[120px] bg-white z-30 shadow-sm border-b border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.map((item, i) => (
                                    <tr key={item.id}
                                        className="hover:bg-slate-50/50 transition-all duration-300 group">
                                        <td className="py-6 px-8">
                                            <p className="text-sm font-black text-slate-950 group-hover:text-[#D4AF37] transition-colors">{item.name}</p>
                                        </td>
                                        <td className="py-6 px-8 text-center">
                                            <span className="text-sm font-black text-slate-600">{item.sort_order}</span>
                                        </td>
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
