import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Database, Search, Plus, Edit2, Trash2, X, AlertCircle, Loader2,
    CheckCircle, List, Tag, Palette, Scissors, Maximize, Layers,
    Mic, Heart, PenTool, Image as LucideImage, ChevronLeft, ChevronRight
} from "lucide-react";

const API = "http://localhost:8000";

type MasterType = {
    id: string;
    label: string;
    icon: any;
};

const MASTER_TYPES: MasterType[] = [
    { id: "categories", label: "Categories", icon: List },
    { id: "colours", label: "Colours", icon: Palette },
    { id: "fabric_types", label: "Fabric Types", icon: Scissors },
    { id: "sizes", label: "Sizes", icon: Maximize },
];

export default function AdminGeneralMaster() {
    const [activeType, setActiveType] = useState<string>("categories");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<any>({ name: "", status: "Active", sort_order: 0 });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // Additional data for sub_categories
    const [categories, setCategories] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true); setError(null);
        try {
            const q = new URLSearchParams({
                type: activeType,
                search,
                page: String(page),
                per_page: "5"
            });
            const res = await fetch(`${API}/masters/index.php?${q}`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setData(json.data);
                setTotal(json.total || 0);
                setTotalPages(json.total_pages || 1);
            } else throw new Error(json.message);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API}/masters/index.php?type=categories`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") setCategories(json.data);
        } catch (e) { }
    };

    useEffect(() => {
        setPage(1);
    }, [activeType, search]);

    useEffect(() => {
        fetchData();
        if (activeType === "sub_categories") fetchCategories();
    }, [activeType, search, page]);

    const handleOpenAdd = () => {
        setEditMode(false);
        setEditId(null);
        const baseForm = { name: "", status: "Active", sort_order: 0 };
        if (activeType === "sub_categories") {
            setForm({ ...baseForm, category_id: categories[0]?.id || "" });
        } else if (activeType === "colours") {
            setForm({ ...baseForm, hex_code: "#000000" });
        } else {
            setForm(baseForm);
        }
        setShowModal(true);
        setSaveMsg(null);
    };

    const handleOpenEdit = (item: any) => {
        setEditMode(true);
        setEditId(item.id);
        setForm({ ...item });
        setShowModal(true);
        setSaveMsg(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editMode
                ? `${API}/masters/master.php?type=${activeType}&id=${editId}`
                : `${API}/masters/index.php?type=${activeType}`;

            const res = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form)
            });
            const json = await res.json();
            if (json.status === "success") {
                setSaveMsg("Record saved successfully!");
                setTimeout(() => {
                    setShowModal(false);
                    fetchData();
                }, 1000);
            } else throw new Error(json.message);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        try {
            const res = await fetch(`${API}/masters/master.php?type=${activeType}&id=${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            const json = await res.json();
            if (json.status === "success") fetchData();
            else throw new Error(json.message);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const ActiveIcon = MASTER_TYPES.find(m => m.id === activeType)?.icon || List;

    return (
        <div className="flex flex-col xl:flex-row gap-6 min-h-[70vh] pb-20">
            {/* Sidebar Navigation */}
            <div className="w-full xl:w-64 shrink-0 space-y-6">
                <div className="px-4">
                    <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-[#041E18] tracking-tight mb-1">Registry <span className="text-[#D4AF37] italic">Core</span></h2>
                    <p className="font-['Inter',sans-serif] text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">Bespoke Configuration</p>
                </div>

                <div className="bg-white rounded-[32px] border border-[#041E18]/5 shadow-sm p-3 space-y-1.5">
                    {MASTER_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setActiveType(type.id)}
                            className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 group ${activeType === type.id
                                ? "bg-[#041E18] text-white shadow-xl shadow-[#041E18]/20"
                                : "text-gray-400 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37]"
                                }`}
                        >
                            <type.icon size={16} strokeWidth={2.5} className={activeType === type.id ? "text-[#D4AF37]" : "group-hover:scale-110 transition-transform"} />
                            {type.label}
                        </button>
                    ))}
                </div>

                <div className="bg-[#FBFAF7] rounded-[32px] p-8 border border-[#041E18]/5">
                    <Database size={24} className="text-[#D4AF37] mb-4" />
                    <h4 className="text-[11px] font-black text-[#041E18] uppercase tracking-widest mb-2">Registry Integrity</h4>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">System-wide synchronization enabled. All master entries are broadcast across the ecosystem.</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-8 min-w-0">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3.5 mb-1">
                            <div className="w-10 h-10 bg-[#FBFAF7] border border-[#041E18]/5 rounded-xl flex items-center justify-center text-[#D4AF37] shadow-sm">
                                <ActiveIcon size={20} strokeWidth={2} />
                            </div>
                            <h1 className="font-['Poppins',sans-serif] text-3xl font-bold text-[#041E18] tracking-[-0.03em] leading-tight italic">{MASTER_TYPES.find(m => m.id === activeType)?.label}</h1>
                        </div>
                        <p className="font-['Inter',sans-serif] text-sm text-gray-400 font-medium tracking-wide border-l-2 border-[#D4AF37]/20 pl-4 max-w-lg">Curating the fine-grained definitions for your boutique collection. {ACTIVE_DESCRIPTIONS[activeType as keyof typeof ACTIVE_DESCRIPTIONS] || "Manage essential product metadata."}</p>
                    </div>

                    <button
                        onClick={handleOpenAdd}
                        className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-[#D4AF37] via-[#B48C5E] to-[#8C6B3E] text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-gold/20 hover:shadow-gold/40 transition-all duration-500 hover:-translate-y-1 active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                        Commission Entry
                    </button>
                </div>

                {/* Filter Suite */}
                <div className="flex flex-wrap items-center gap-4 bg-white p-5 rounded-[24px] border border-[#041E18]/5 shadow-sm">
                    <div className="relative flex-1 min-w-[280px] group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#041E18]/5 text-[#041E18]/30 group-focus-within:text-[#D4AF37] group-focus-within:bg-[#D4AF37]/10 transition-all duration-300">
                            <Search size={14} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder={`Search ${activeType.replace('_', ' ')} archives...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-5 py-3.5 bg-[#041E18]/[0.02] rounded-[16px] border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3.5 bg-[#FBFAF7] border border-[#041E18]/5 rounded-[16px] shadow-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">Census Size</p>
                        <div className="w-1 h-3 bg-[#D4AF37]/30 rounded-full" />
                        <p className="text-sm font-black text-[#041E18] font-['Poppins',sans-serif]">{data.length}</p>
                    </div>
                </div>

                {/* Data Table Container */}
                <div className="bg-white rounded-[24px] border border-[#041E18]/5 shadow-xl shadow-[#041E18]/[0.02] p-6 lg:p-8">
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        {loading ? (
                            <div className="py-32 text-center space-y-6">
                                <div className="relative inline-block">
                                    <Loader2 size={64} className="animate-spin text-[#D4AF37] opacity-10" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_12px_#D4AF37]" />
                                    </div>
                                </div>
                                <p className="font-['Inter',sans-serif] text-[11px] font-black uppercase text-gray-300 tracking-[0.4em]">Deciphering Registry...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#041E18]/5">
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Ident</th>
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Master Designation</th>
                                        {activeType === 'sub_categories' && <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Parent Class</th>}
                                        {activeType === 'colours' && <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Hue Ref</th>}
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Status</th>
                                        <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#041E18]/5 font-['Inter',sans-serif]">
                                    {data.map((item, i) => (
                                        <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                                            className="hover:bg-[#FBFAF7] transition-all duration-300 group cursor-default">
                                            <td className="px-10 py-7 text-[11px] font-black text-[#041E18]/20 font-mono tracking-tighter">#{item.id}</td>
                                            <td className="px-10 py-7">
                                                <p className="text-sm font-bold text-[#041E18] group-hover:text-[#D4AF37] transition-colors">{item.name}</p>
                                                <div className="flex items-center gap-3 mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Order {item.sort_order}</span>
                                                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                    <span className="text-[9px] font-bold text-gray-400 font-mono">{new Date(item.updated_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            {activeType === 'sub_categories' && <td className="px-10 py-7"><span className="px-4 py-1.5 bg-white border border-[#041E18]/5 rounded-xl text-[10px] font-black text-[#041E18] uppercase tracking-[0.1em] shadow-sm">{item.category_name}</span></td>}
                                            {activeType === 'colours' && (
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-lg shadow-sm border border-[#041E18]/5" style={{ backgroundColor: item.hex_code }} />
                                                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-tighter">{item.hex_code}</span>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-10 py-7">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                                    <button onClick={() => handleOpenEdit(item)} className="p-3 text-[#041E18]/30 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white border border-[#041E18]/5"><Edit2 size={16} strokeWidth={2.5} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-3 text-[#041E18]/30 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm bg-white border border-[#041E18]/5"><Trash2 size={16} strokeWidth={2.5} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination - Custom Navigation Suite */}
                    <div className="px-10 py-10 border-t border-[#041E18]/5 bg-[#FBFAF7]/30">
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.25em]">Records Manifest</p>
                                <span className="text-[#041E18] text-xs font-black bg-white px-4 py-1.5 rounded-xl border border-[#041E18]/5 shadow-sm">
                                    {(page - 1) * 5 + 1}—{Math.min(page * 5, total)} <span className="text-gray-300 mx-1 font-medium">of</span> {total}
                                </span>
                            </div>

                            <div className="flex items-center justify-center gap-[10px]">
                                {/* Previous Arrow */}
                                <button
                                    onClick={() => page > 1 && setPage(p => p - 1)}
                                    disabled={page <= 1}
                                    className={`w-10 h-10 flex items-center justify-center rounded-[10px] bg-white shadow-[0_4_12px_rgba(0,0,0,0.1)] text-[20px] font-bold transition-all hover:bg-[#f0f0f0] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed ${page <= 1 ? 'text-gray-300' : 'text-[#041E18]'}`}
                                >
                                    ‹
                                </button>

                                {/* Page Buttons */}
                                <div className="flex items-center gap-[10px]">
                                    {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setPage(n)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-[10px] text-[14px] font-semibold transition-all duration-200 ${n === page
                                                ? 'bg-[#0b3d2e] text-white shadow-lg'
                                                : 'bg-[#f5f5f5] text-[#041E18] hover:bg-[#e5e5e5]'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>

                                {/* Next Arrow */}
                                <button
                                    onClick={() => page < totalPages && setPage(p => p + 1)}
                                    disabled={page >= totalPages || page >= 8}
                                    className={`w-10 h-10 flex items-center justify-center rounded-[10px] bg-white shadow-[0_4_12px_rgba(0,0,0,0.1)] text-[20px] font-bold transition-all hover:bg-[#f0f0f0] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed ${page >= totalPages || page >= 8 ? 'text-gray-300' : 'text-[#041E18]'}`}
                                >
                                    ›
                                </button>
                            </div>

                            <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Phase {page} <span className="text-gray-200 mx-2">/</span> Maximum 8</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CRUD Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-[#041E18]/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden border border-[#041E18]/5">

                            <div className="px-10 py-10 bg-[#FBFAF7] border-b border-[#041E18]/5 flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="font-['Poppins',sans-serif] text-[28px] font-bold text-[#041E18] tracking-tight">{editMode ? 'Refine' : 'Commission'} Entry</h2>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.25em]">{activeType.slice(0, -1).replace('_', ' ')} Record Definition</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-white border border-[#041E18]/5 text-gray-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm"><X size={20} strokeWidth={2.5} /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Display Name *</label>
                                    <input
                                        type="text" required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder={`Enter ${activeType.slice(0, -1).replace('_', ' ')} designation...`}
                                        className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {activeType === 'sub_categories' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Parent Classification</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={form.category_id}
                                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                                className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all cursor-pointer appearance-none"
                                            >
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <Layers size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {activeType === 'colours' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Chroma Specification</label>
                                        <div className="flex gap-4">
                                            <div className="relative group">
                                                <input
                                                    type="color"
                                                    value={form.hex_code}
                                                    onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                                                    className="w-20 h-16 rounded-2xl border-2 border-[#041E18]/5 overflow-hidden cursor-pointer shadow-sm group-hover:border-[#D4AF37]/30 transition-all p-0"
                                                />
                                                <Palette size={14} className="absolute inset-0 m-auto text-white drop-shadow-md pointer-events-none mix-blend-difference" />
                                            </div>
                                            <input
                                                type="text"
                                                value={form.hex_code}
                                                onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                                                className="flex-1 px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-mono font-bold uppercase text-[#041E18] outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Index Order</label>
                                        <input
                                            type="number"
                                            value={form.sort_order}
                                            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                            className="w-full px-6 py-4 bg-[#041E18]/[0.02] rounded-2xl border border-transparent focus:border-[#D4AF37]/30 focus:bg-white text-sm font-bold text-[#041E18] outline-none transition-all"
                                            placeholder="Rank"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Manifest Status</label>
                                        <div className="flex gap-2 p-1.5 bg-[#041E18]/[0.02] rounded-2xl border border-[#041E18]/5 shadow-inner h-14">
                                            {['Active', 'Inactive'].map(s => (
                                                <button
                                                    key={s} type="button"
                                                    onClick={() => setForm({ ...form, status: s })}
                                                    className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${form.status === s ? "bg-[#041E18] text-white shadow-lg shadow-[#041E18]/10" : "text-gray-400 hover:text-[#041E18]"}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {saveMsg ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-4 p-5 bg-emerald-500/10 text-emerald-600 rounded-[24px] border border-emerald-500/20 shadow-sm">
                                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><CheckCircle size={18} strokeWidth={3} /></div>
                                        <span className="text-[11px] font-black uppercase tracking-widest">{saveMsg}</span>
                                    </motion.div>
                                ) : (
                                    <button
                                        type="submit" disabled={saving}
                                        className="w-full py-5 bg-gradient-to-r from-[#D4AF37] to-[#B48C5E] text-white rounded-[24px] font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-gold/30 hover:shadow-gold/50 transition-all duration-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} className="group-hover:scale-110 transition-transform" strokeWidth={2.5} />}
                                        {editMode ? 'Authorize Revision' : 'Confirm Entry'}
                                    </button>
                                )}
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const ACTIVE_DESCRIPTIONS = {
    categories: "The macro-architectural pillars of your collection catalogue.",
    colours: "Definitive hue spectra for artisanal variations.",
    fabric_types: "The tactile materiality and soul of each masterpiece.",
    sizes: "Defined dimensions and anatomical proportions.",
};
