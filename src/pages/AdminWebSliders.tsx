import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Loader2, GripVertical, Check, X, Image as ImageIcon, Search, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { API_URL as API, BASE_URL } from "@/api_config";

interface SitePage {
    id: number;
    page_name: string;
    page_key: string;
    page_type: string;
}

interface WebSlider {
    id: number;
    page_name: string;
    pages: string[];
    title: string;
    subtitle: string | null;
    description: string | null;
    button_text: string | null;
    button_link: string | null;
    image_url: string;
    logo_url: string | null;
    order_index: number;
    is_active: number;
}

const AdminWebSliders = () => {
    const [sliders, setSliders] = useState<WebSlider[]>([]);
    const [availablePages, setAvailablePages] = useState<SitePage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState<WebSlider | null>(null);
    const [pageSearch, setPageSearch] = useState("");

    const [formData, setFormData] = useState({
        selectedPages: [] as string[],
        title: "",
        subtitle: "",
        description: "",
        button_text: "",
        button_link: "",
        order_index: 0,
        is_active: 1
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [slidersRes, pagesRes] = await Promise.all([
                fetch(`${API}/web_sliders/list.php`, { credentials: "include" }),
                fetch(`${API}/pages/list.php`, { credentials: "include" })
            ]);
            
            const slidersJson = await slidersRes.json();
            const pagesJson = await pagesRes.json();
            
            if (slidersJson.status === "success") setSliders(slidersJson.data);
            if (pagesJson.status === "success") setAvailablePages(pagesJson.data);
            
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenForm = (slider: WebSlider | null = null) => {
        if (slider) {
            setEditingSlider(slider);
            setFormData({
                selectedPages: slider.pages || [],
                title: slider.title,
                subtitle: slider.subtitle || "",
                description: slider.description || "",
                button_text: slider.button_text || "",
                button_link: slider.button_link || "",
                order_index: slider.order_index,
                is_active: slider.is_active
            });
            setImagePreview(slider.image_url.startsWith('http') ? slider.image_url : `${BASE_URL}${slider.image_url}`);
            setLogoPreview(slider.logo_url ? (slider.logo_url.startsWith('http') ? slider.logo_url : `${BASE_URL}${slider.logo_url}`) : null);
        } else {
            setEditingSlider(null);
            setFormData({
                selectedPages: ["home"],
                title: "",
                subtitle: "",
                description: "",
                button_text: "",
                button_link: "",
                order_index: sliders.length + 1,
                is_active: 1
            });
            setImagePreview(null);
            setLogoPreview(null);
        }
        setImageFile(null);
        setLogoFile(null);
        setRemoveLogo(false);
        setPageSearch("");
        setIsMenuOpen(true);
    };

    const handleCloseForm = () => {
        setIsMenuOpen(false);
        setEditingSlider(null);
        setImageFile(null);
        setImagePreview(null);
        setLogoFile(null);
        setLogoPreview(null);
        setRemoveLogo(false);
    };

    const handlePageToggle = (key: string) => {
        setFormData(prev => {
            const isSelected = prev.selectedPages.includes(key);
            if (isSelected) {
                return { ...prev, selectedPages: prev.selectedPages.filter(p => p !== key) };
            } else {
                return { ...prev, selectedPages: [...prev.selectedPages, key] };
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setRemoveLogo(false);
        }
    };

    const handleRemoveLogo = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLogoFile(null);
        setLogoPreview(null);
        setRemoveLogo(true);
        if (logoInputRef.current) logoInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || formData.selectedPages.length === 0) {
            toast.error("Title and at least one Page Target are required");
            return;
        }

        if (!editingSlider && !imageFile) {
            toast.error("An image is required for new sliders");
            return;
        }

        setIsSubmitting(true);
        try {
            const url = editingSlider
                ? `${API}/web_sliders/update.php`
                : `${API}/web_sliders/create.php`;

            const data = new FormData();
            if (editingSlider) data.append("id", editingSlider.id.toString());
            data.append("title", formData.title);
            data.append("subtitle", formData.subtitle);
            data.append("description", formData.description);
            data.append("button_text", formData.button_text);
            data.append("button_link", formData.button_link);
            data.append("order_index", formData.order_index.toString());
            data.append("is_active", formData.is_active.toString());
            data.append("pages", JSON.stringify(formData.selectedPages));
            if (imageFile) data.append("image", imageFile);
            if (logoFile) data.append("logo", logoFile);
            if (removeLogo) data.append("remove_logo", "1");

            const res = await fetch(url, {
                method: "POST",
                body: data
            });

            const json = await res.json();

            if (json.status === "success") {
                toast.success(editingSlider ? "Slider updated" : "Slider created");
                fetchData();
                handleCloseForm();
            } else {
                toast.error(json.message || "Failed to save slider");
            }
        } catch (err) {
            toast.error("An error occurred during submission");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will remove the slider from all assigned pages.")) return;
        try {
            const res = await fetch(`${API}/web_sliders/delete.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const json = await res.json();
            if (json.status === "success") {
                toast.success("Slider deleted");
                fetchData();
            } else {
                toast.error(json.message);
            }
        } catch (err) {
            toast.error("Failed to delete slider");
        }
    };

    const handleToggleActive = async (slider: WebSlider) => {
        try {
            const res = await fetch(`${API}/web_sliders/update.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: slider.id,
                    is_active: slider.is_active ? 0 : 1
                })
            });
            const json = await res.json();
            if (json.status === "success") {
                toast.success(`Slider ${slider.is_active ? 'disabled' : 'enabled'}`);
                fetchData();
            } else {
                toast.error(json.message);
            }
        } catch (err) {
            toast.error("Failed to toggle status");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const filteredPages = availablePages.filter(p => 
        p.page_name.toLowerCase().includes(pageSearch.toLowerCase()) ||
        p.page_key.toLowerCase().includes(pageSearch.toLowerCase())
    );

    const groupedPages = filteredPages.reduce((acc, page) => {
        const type = page.page_type || 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(page);
        return acc;
    }, {} as Record<string, SitePage[]>);

    // Hardcode fallback if Collections or Sale Banner is missing
    if (!availablePages.find(p => p.page_key === 'collections')) {
        if (!groupedPages['main']) groupedPages['main'] = [];
        groupedPages['main'].push({ id: 0, page_name: 'Collections', page_key: 'collections', page_type: 'main' });
    }
    if (!availablePages.find(p => p.page_key === 'sale_banner')) {
        if (!groupedPages['main']) groupedPages['main'] = [];
        groupedPages['main'].push({ id: 0, page_name: 'Sale Banner (Festive)', page_key: 'sale_banner', page_type: 'main' });
    }



    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dynamic Web Sliders</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Global hero banner management system for all website pages.</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-[#0F172A] hover:shadow-lg transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> Add New Slider
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {sliders.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                            <Globe size={48} className="text-slate-200 mb-4" />
                            <p className="font-bold">No active sliders found</p>
                            <p className="text-xs max-w-xs mt-1">Start by adding a slider and assigning it to a page like "Home" or "Banarasi".</p>
                        </div>
                    ) : (
                        sliders.map((slider) => (
                            <div key={slider.id} className="p-4 flex flex-col md:flex-row md:items-center gap-6 hover:bg-slate-50 transition-colors group">
                                <div className="hidden md:block text-slate-300 cursor-move">
                                    <GripVertical size={20} />
                                </div>
                                <div className="w-full md:w-48 h-28 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative border border-slate-200">
                                    <img src={slider.image_url.startsWith('http') ? slider.image_url : `${BASE_URL}${slider.image_url}`} alt="Slider" className="w-full h-full object-cover" />
                                    {slider.logo_url && (
                                        <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-md px-2 py-1 rounded-md border border-[#D4AF37]/50 shadow-md flex items-center gap-1.5" title="Brand Logo Attached">
                                            <Sparkles size={11} className="text-[#D4AF37]" />
                                            <img src={slider.logo_url.startsWith('http') ? slider.logo_url : `${BASE_URL}${slider.logo_url}`} alt="Logo" className="h-3.5 w-auto object-contain max-w-[42px]" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap gap-2 mb-2 text-[10px] font-bold tracking-wider">
                                            {slider.pages?.map(pk => (
                                                <span key={pk} className="bg-[#D4AF37]/10 text-[#B8960C] px-2 py-0.5 rounded border border-[#D4AF37]/20 uppercase">{pk}</span>
                                            ))}
                                            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-slate-400">Idx: {slider.order_index}</span>
                                        </div>
                                        <p className="font-black text-slate-900 truncate tracking-tight text-lg">{slider.title}</p>
                                        <p className="text-sm text-slate-500 truncate max-w-md italic">{slider.subtitle || 'No subtitle'}</p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 bg-slate-100/50 md:bg-transparent p-2 md:p-0 rounded-xl justify-end">
                                        <button
                                            onClick={() => handleToggleActive(slider)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${
                                                slider.is_active 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                            }`}
                                        >
                                            {slider.is_active ? <Check size={14} strokeWidth={3}/> : <X size={14} strokeWidth={3}/>}
                                            <span className="hidden sm:inline">{slider.is_active ? 'Active' : 'Disabled'}</span>
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleOpenForm(slider)}
                                                className="p-2.5 text-slate-500 hover:bg-white hover:text-[#D4AF37] hover:shadow-md border border-transparent hover:border-slate-100 rounded-xl transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slider.id)}
                                                className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={handleCloseForm}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 flex items-center justify-between border-b border-slate-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    {editingSlider ? "Edit Global Slider" : "Create Global Slider"}
                                </h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hero Banner Configuration</p>
                            </div>
                            <button onClick={handleCloseForm} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                                <X size={24} className="stroke-[3]" />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto custom-scrollbar-light p-8">
                            <form id="slider-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                
                                {/* Left Column: Content */}
                                <div className="lg:col-span-12 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <label className="block text-sm font-black text-slate-800 uppercase tracking-wider">Page Targets <span className="text-rose-500">*</span></label>
                                            <div className="relative mb-3">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search pages..." 
                                                    value={pageSearch}
                                                    onChange={(e) => setPageSearch(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#D4AF37]/30 outline-none"
                                                />
                                            </div>
                                            <div className="max-h-48 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 custom-scrollbar-light">
                                                {Object.entries(groupedPages).map(([type, pages]) => (
                                                    <div key={type} className="space-y-2">
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{type}</h4>
                                                        {pages.map(page => (
                                                            <label key={page.page_key} className="flex items-center gap-2 group cursor-pointer">
                                                                <div className="relative flex items-center justify-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={formData.selectedPages.includes(page.page_key)}
                                                                        onChange={() => handlePageToggle(page.page_key)}
                                                                        className="peer w-5 h-5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                                                    />
                                                                </div>
                                                                <span className={`text-sm font-bold ${formData.selectedPages.includes(page.page_key) ? 'text-slate-900' : 'text-slate-500'} group-hover:text-[#D4AF37] transition-colors`}>{page.page_name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Selected: {formData.selectedPages.length} pages</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Slider Title <span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    placeholder="e.g. Elegant Silk Collection"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/50 transition-all outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Subtitle / Tagline</label>
                                                <input
                                                    type="text"
                                                    value={formData.subtitle}
                                                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                                    placeholder="e.g. Heritage Craftsmanship"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/50 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Display Order</label>
                                                <input
                                                    type="number"
                                                    value={formData.order_index}
                                                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 h-[52px] pt-2">
                                                <label className="relative flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={formData.is_active === 1}
                                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F172A]"></div>
                                                    <span className="ml-3 text-sm font-black text-slate-700 uppercase tracking-wider">Active</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Write a brief description that appears under the title..."
                                            rows={2}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Banner Image */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-black text-slate-800 uppercase tracking-wider">Banner Image <span className="text-rose-500">*</span></label>
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-[#D4AF37] transition-all relative overflow-hidden group/img"
                                            >
                                                {imagePreview ? (
                                                    <>
                                                        <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover/img:scale-105" alt="Banner Preview" />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                                                            <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg">Change Banner</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                                                        <ImageIcon size={32} className="mb-2 text-slate-400" />
                                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-700">Click to upload banner</span>
                                                        <span className="text-[10px] text-slate-400 mt-1">High-res landscape image (1920x800)</span>
                                                    </div>
                                                )}
                                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                            </div>
                                        </div>

                                        {/* Brand Logo / Emblem Upload */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                                    Brand Logo / Emblem 
                                                    <span className="text-[10px] font-bold text-[#B8960C] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full border border-[#D4AF37]/30 normal-case tracking-normal">Premium</span>
                                                </label>
                                                {logoPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveLogo}
                                                        className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-rose-50"
                                                    >
                                                        <Trash2 size={13} /> Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div 
                                                onClick={() => logoInputRef.current?.click()}
                                                className="w-full h-48 border-2 border-dashed border-[#D4AF37]/40 rounded-2xl bg-amber-500/[0.03] hover:bg-amber-500/[0.08] hover:border-[#D4AF37] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group/logo"
                                            >
                                                {logoPreview ? (
                                                    <div className="w-full h-full p-6 flex flex-col items-center justify-center relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px]">
                                                        <img src={logoPreview} className="max-h-24 max-w-[85%] object-contain drop-shadow-md transition-transform group-hover/logo:scale-105" alt="Logo Preview" />
                                                        <span className="text-[10px] font-bold text-[#B8960C] mt-2 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/60 shadow-xs">Custom Logo Attached</span>
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-all">
                                                            <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg">Change Logo</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-400 group-hover/logo:text-[#D4AF37] transition-colors p-4 text-center">
                                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 group-hover/logo:border-[#D4AF37] flex items-center justify-center mb-2.5 transition-all group-hover/logo:scale-110">
                                                            <Sparkles size={20} className="text-[#D4AF37]" />
                                                        </div>
                                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-700">Upload Brand Logo</span>
                                                        <span className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Transparent PNG, SVG, or WEBP overlaid on slider banner</span>
                                                    </div>
                                                )}
                                                <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/png,image/svg+xml,image/webp,image/jpeg,image/avif" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Call-to-Action */}
                                    <div className="space-y-3 pt-2">
                                        <label className="block text-sm font-black text-slate-800 uppercase tracking-wider">Call-to-Action (Button)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={formData.button_text}
                                                onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                                                placeholder="Button Text (e.g. Shop Now)"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                                            />
                                            <input
                                                type="text"
                                                value={formData.button_link}
                                                onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                                                placeholder="Button Link (e.g. /sarees/banarasi)"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                            <button type="button" onClick={handleCloseForm} className="px-6 py-3 font-black text-slate-500 hover:text-slate-900 rounded-xl transition-all uppercase tracking-widest text-[10px]">
                                Discard
                            </button>
                            <button type="submit" form="slider-form" disabled={isSubmitting} className="flex items-center gap-2 bg-[#0F172A] text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-[#D4AF37] hover:text-[#0F172A] hover:shadow-xl transition-all disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingSlider ? "Update Banner" : "Publish Banner")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWebSliders;
