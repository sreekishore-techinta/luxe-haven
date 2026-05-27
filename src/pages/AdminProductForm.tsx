import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Plus, X, Loader2, Save, ArrowLeft, 
  CheckCircle, Camera, Image as LucideImage, Package,
  Info, Tag, Box, Settings, Truck, Star, Percent,
  Upload, FileText, Trash2, Sparkles
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { API_URL as API } from "@/api_config";
const BASE_URL = API.replace("/api", "");

const emptyForm = {
    name: "", 
    category_id: "1", // Default to Sarees
    saree_type_id: "",
    blouse_style_id: "",
    fabric_id: "",
    fabric_name: "",
    description: "", 
    mrp: "", 
    old_price: "", 
    current_price: "",
    stock_qty: "0", 
    product_status: "Active",
    return_policy: "",
    free_delivery: 0,
    is_new: 1,
    is_bestseller: 0,
    on_sale: 0,
    colour_id: "", 
    size_id: "", 
    fabric_care: "To preserve the elegance and longevity of this fabric, we recommend gentle care. Prefer dry cleaning or a mild hand wash using cold water. Avoid harsh detergents and direct sunlight.",
    saree_specifications: "",
    selected_add_ons: [] as number[],
};

type Combination = {
    id?: number;
    colour_id: string;
    size_id: string;
    stock_qty: string;
    image_file: File | null;
    image_preview: string | null;
    existing_image?: string;
};

export default function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [form, setForm] = useState({ ...emptyForm });
    const [combinations, setCombinations] = useState<Combination[]>([
        { colour_id: "", size_id: "", stock_qty: "0", image_file: null, image_preview: null }
    ]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    
    // Images
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
    const [otherFiles, setOtherFiles] = useState<File[]>([]);
    const [otherPreviews, setOtherPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<{image_path: string, id: number}[]>([]);
    
    const featuredInputRef = useRef<HTMLInputElement>(null);
    const otherInputRef = useRef<HTMLInputElement>(null);
    const combinationInputRef = useRef<HTMLInputElement>(null);

    // Masters
    const [masters, setMasters] = useState<{
        categories: any[],
        saree_types: any[],
        colours: any[],
        fabric_types: any[],
        sizes: any[],
        blouse_styles: any[],
        add_ons: any[]
    }>({
        categories: [], saree_types: [], colours: [], fabric_types: [], 
        sizes: [], blouse_styles: [], add_ons: []
    });

    const fetchMasters = async () => {
        const types = ["categories", "saree_types", "colours", "fabric_types", "sizes", "blouse_styles", "add_ons"];
        const results: Record<string, any[]> = {};
        for (const t of types) {
            try {
                let endpoint = (t === 'saree_types') ? `public/saree_types.php?_t=${Date.now()}` : `masters/index.php?type=${t}&per_page=100&_t=${Date.now()}`;
                const res = await fetch(`${API}/${endpoint}`, { credentials: "include", cache: "no-store" });
                const json = await res.json();
                if (json.status === "success") {
                    results[t] = t === 'saree_types' ? json.data : json.data.filter((i: any) => i.status === 'Active');
                }
            } catch (e) { }
        }
        setMasters(prev => ({ ...prev, ...results }));
    };

    useEffect(() => {
        fetchMasters();
        if (isEdit) {
            const fetchProduct = async () => {
                setFetching(true);
                try {
                    const res = await fetch(`${API}/products/product.php?id=${id}`, { credentials: "include" });
                    const json = await res.json();
                    if (json.status === "success") {
                        const p = json.data;
                        setForm({
                            name: p.name,
                            category_id: String(p.category_id || "1"),
                            saree_type_id: String(p.saree_type_id || ""),
                            blouse_style_id: String(p.blouse_style_id || ""),
                            fabric_id: String(p.fabric_id || ""),
                            fabric_name: p.fabric || "",
                            description: p.description || "",
                            mrp: (p.mrp_price || p.mrp) ? String(p.mrp_price || p.mrp) : "",
                            old_price: (p.discount_price || p.old_price) ? String(p.discount_price || p.old_price) : "",
                            current_price: String(p.price || 0),
                            stock_qty: String(p.stock_qty || p.stock_quantity || 0),
                            product_status: p.status || "Active",
                            return_policy: p.return_policy || "",
                            free_delivery: p.free_delivery || 0,
                            is_new: p.is_new || 0,
                            is_bestseller: p.is_bestseller || 0,
                            on_sale: p.on_sale || 0,
                            colour_id: String(p.colour_id || ""),
                            size_id: String(p.size_id || ""),
                            fabric_care: p.fabric_care || "To preserve the elegance and longevity of this fabric, we recommend gentle care. Prefer dry cleaning or a mild hand wash using cold water. Avoid harsh detergents and direct sunlight.",
                            saree_specifications: p.saree_specifications || "",
                            selected_add_ons: p.add_ons ? p.add_ons.map((ao: any) => ao.id) : [],
                        });
                        
                        const images = p.gallery || p.images || [];
                        if (images.length > 0) {
                          setExistingImages(images);
                          const primary = images.find((img: any) => img.is_primary === 1);
                          if (primary) setFeaturedPreview(primary.image_path);
                        }
                        
                        // Fetch combinations if API supported them
                        if (p.combinations && p.combinations.length > 0) {
                            setCombinations(p.combinations.map((c: any) => ({
                                id: c.id,
                                colour_id: String(c.colour_id),
                                size_id: String(c.size_id),
                                stock_qty: String(c.stock_qty),
                                existing_image: c.image_path,
                                image_file: null,
                                image_preview: null
                            })));
                        }
                    }
                } catch (e) {
                    console.error("Fetch error:", e);
                    toast.error("Failed to fetch product details");
                } finally {
                    setFetching(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEdit]);

    const handleAddCombination = () => {
        setCombinations([
            ...combinations,
            { colour_id: "", size_id: "", stock_qty: "0", image_file: null, image_preview: null }
        ]);
    };

    const removeCombination = (index: number) => {
        setCombinations(combinations.filter((_, i) => i !== index));
    };

    const updateCombination = (index: number, field: keyof Combination, value: any) => {
        const newCombs = [...combinations];
        newCombs[index] = { ...newCombs[index], [field]: value };
        setCombinations(newCombs);
    };

    const handleCombinationImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error("Invalid file format. Only JPG, PNG, and WebP are allowed.");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File is too large. Maximum size is 10MB.");
                return;
            }

            setCombinations(prev => {
                const newCombs = [...prev];
                newCombs[index] = { 
                    ...newCombs[index], 
                    image_file: file, 
                    image_preview: URL.createObjectURL(file) 
                };
                return newCombs;
            });
        }
    };

    const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFeaturedFile(file);
            setFeaturedPreview(URL.createObjectURL(file));
        }
    };

    const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setOtherFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setOtherPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeOtherPhoto = (index: number) => {
        setOtherFiles(prev => prev.filter((_, i) => i !== index));
        setOtherPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = async (imageId: number) => {
        if (!confirm("Are you sure you want to remove this photo?")) return;
        try {
            const res = await fetch(`${API}/products/delete_image.php?id=${imageId}`, { method: 'DELETE', credentials: "include" });
            const json = await res.json();
            if (json.status === 'success') {
                setExistingImages(prev => prev.filter(img => img.id !== imageId));
                toast.success("Image removed");
            } else {
                toast.error(json.message || "Failed to remove image");
            }
        } catch (e) {
            toast.error("Error removing image");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...form,
                category_id: parseInt(form.category_id),
                saree_type_id: form.saree_type_id ? parseInt(form.saree_type_id) : null,
                fabric_id: form.fabric_id ? parseInt(form.fabric_id) : null,
                blouse_style_id: form.blouse_style_id ? parseInt(form.blouse_style_id) : null,
                price: parseFloat(form.current_price),
                discount_price: form.old_price ? parseFloat(form.old_price) : null,
                stock_qty: parseInt(form.stock_qty),
                is_new: form.is_new,
                is_bestseller: form.is_bestseller,
                colour_id: form.colour_id ? parseInt(form.colour_id) : null,
                size_id: form.size_id ? parseInt(form.size_id) : null,
                status: form.product_status,
                mrp: form.mrp ? parseFloat(form.mrp) : null,
                return_policy: form.return_policy,
                free_delivery: form.free_delivery,
                on_sale: form.on_sale,
                fabric_care: form.fabric_care,
                saree_specifications: form.saree_specifications,
                add_ons: form.selected_add_ons,
                combinations: combinations.map(c => ({
                    id: c.id,
                    colour_id: parseInt(c.colour_id) || null,
                    size_id: parseInt(c.size_id) || null,
                    stock_qty: parseInt(c.stock_qty) || 0,
                    price: parseFloat(form.current_price),
                    image_path: c.existing_image || null
                }))
            };

            const url = isEdit ? `${API}/products/product.php?id=${id}` : `${API}/products/index.php`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (json.status !== "success") throw new Error(json.message);
            
            const productId = isEdit ? id : json.id;

            // Image Uploads
            const upload = async (files: File[], isPrimary: boolean, combinationIdx?: number) => {
                const fd = new FormData();
                fd.append("product_id", String(productId));
                fd.append("is_primary", isPrimary ? "1" : "0");
                if (combinationIdx !== undefined) fd.append("combination_index", String(combinationIdx));
                files.forEach(f => fd.append("images[]", f));
                await fetch(`${API}/products/upload_images.php`, { method: "POST", body: fd, credentials: "include" });
            };

            if (featuredFile) await upload([featuredFile], true);
            if (otherFiles.length > 0) await upload(otherFiles, false);
            
            // Combination Images
            for (let i = 0; i < combinations.length; i++) {
                if (combinations[i].image_file) {
                    await upload([combinations[i].image_file!], false, i);
                }
            }

            toast.success(isEdit ? "Product Updated!" : "Product Added!");
            navigate(-1);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-sm font-bold text-slate-400">LOADING PRODUCT DETAILS...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6 md:p-10 bg-slate-50 min-h-screen">
            {/* Navigation Header */}
            <header className="flex flex-col gap-6">
                <Link to="/admin/products" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all">
                    <ArrowLeft size={16} /> Back to List
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-[#1E293B] tracking-tight">{isEdit ? "Edit Product" : "Add Product"}</h1>
                        <p className="text-slate-400 font-medium mt-1">Manage product details and variants.</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* 1. Basic Information */}
                <div className="bg-white rounded-[24px] p-10 border border-slate-200/60 shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Info size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Basic Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-8 space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Product Name <span className="text-rose-500">*</span></label>
                            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-400 focus:bg-white text-sm font-bold text-slate-800 transition-all outline-none" placeholder="e.g. Silk Saree" />
                        </div>
                        <div className="md:col-span-4 space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category <span className="text-rose-500">*</span></label>
                            <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-400 focus:bg-white text-sm font-bold text-slate-800 outline-none cursor-pointer">
                                <option value="">Select Category</option>
                                {masters.categories?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-4 space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Saree Type</label>
                            <select value={form.saree_type_id} onChange={e => {
                                const typeId = e.target.value;
                                const selectedType = masters.saree_types.find(t => String(t.id) === typeId);
                                
                                let newCatId = form.category_id;
                                if (selectedType) {
                                    // Automatically find matching category by name
                                    const matchingCat = masters.categories.find(c => 
                                        c.name.toLowerCase() === selectedType.name.toLowerCase() ||
                                        c.name.toLowerCase().includes(selectedType.name.toLowerCase())
                                    );
                                    if (matchingCat) newCatId = String(matchingCat.id);
                                }
                                
                                setForm({...form, saree_type_id: typeId, category_id: newCatId});
                            }}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-400 focus:bg-white text-sm font-bold text-slate-800 outline-none cursor-pointer">
                                <option value="">Select Saree Type</option>
                                {masters.saree_types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-12 space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                            <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-400 focus:bg-white text-sm font-bold text-slate-800 outline-none resize-none" placeholder="Enter details..." />
                        </div>
                    </div>
                </div>

                {/* 2. Pricing Information */}
                <div className="bg-white rounded-[24px] p-10 border border-slate-200/60 shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Tag size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Pricing Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">MRP</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                                <input type="number" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm outline-none" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Old Price</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                                <input type="number" value={form.old_price} onChange={e => setForm({...form, old_price: e.target.value})} onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm outline-none" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Price *</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                                <input required type="number" value={form.current_price} onChange={e => setForm({...form, current_price: e.target.value})} onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-indigo-600 text-sm outline-none shadow-inner" placeholder="0.00" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Add-ons Section - Premium Grouped Management */}
            <div className="bg-white rounded-[24px] p-10 border border-slate-200/60 shadow-sm space-y-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4AF37]" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-[#D4AF37] shadow-xl">
                            <Sparkles size={24} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Service Personalization</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Configure premium upgrades for this product</p>
                        </div>
                    </div>
                    <Link to="/admin/general-master?type=add_ons" className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all flex items-center gap-2">
                        <Settings size={14} /> Manage Master Options
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-12 pt-4">
                    {/* Dynamic Grouping Logic */}
                    {Object.entries(
                        (masters.add_ons || []).reduce((acc: any, ao: any) => {
                            const group = ao.group_name || 'General Services';
                            if (!acc[group]) acc[group] = [];
                            acc[group].push(ao);
                            return acc;
                        }, {})
                    ).sort(([a], [b]) => {
                        if (a === 'General Services') return -1;
                        if (b === 'General Services') return 1;
                        return a.localeCompare(b);
                    }).map(([groupName, items]: [string, any]) => (
                        <div key={groupName} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.3em] whitespace-nowrap">{groupName}</h3>
                                <div className="h-[2px] w-full bg-gradient-to-r from-slate-100 to-transparent" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((ao: any) => {
                                    const isSelected = form.selected_add_ons.includes(ao.id);
                                    const isRadio = ao.input_type === 'radio';
                                    
                                    return (
                                        <button
                                            key={ao.id}
                                            type="button"
                                            onClick={() => {
                                                setForm(prev => {
                                                    let newSelection = [...prev.selected_add_ons];
                                                    
                                                    if (isSelected) {
                                                        // Toggle off if it's a checkbox, or if it's a radio but we want to allow deselecting (optional)
                                                        newSelection = newSelection.filter(id => id !== ao.id);
                                                    } else {
                                                        if (isRadio) {
                                                            // If radio, remove all other IDs from the same group
                                                            const groupIds = items.map((i: any) => i.id);
                                                            newSelection = newSelection.filter(id => !groupIds.includes(id));
                                                            newSelection.push(ao.id);
                                                        } else {
                                                            newSelection.push(ao.id);
                                                        }
                                                    }

                                                    return {
                                                        ...prev,
                                                        selected_add_ons: newSelection
                                                    };
                                                });
                                            }}
                                            className={`group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300 border-2 ${
                                                isSelected 
                                                    ? "border-slate-900 bg-slate-900 shadow-2xl shadow-slate-200" 
                                                    : "border-slate-100 bg-white hover:border-[#D4AF37]/40 hover:bg-slate-50/50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 flex items-center justify-center border-2 transition-all ${
                                                    isRadio ? 'rounded-full' : 'rounded-lg'
                                                } ${
                                                    isSelected ? 'border-[#D4AF37] bg-[#D4AF37]/20' : 'border-slate-200 group-hover:border-[#D4AF37]/50'
                                                }`}>
                                                    {isSelected && (
                                                        isRadio ? 
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" /> : 
                                                        <Plus size={14} className="text-[#D4AF37]" strokeWidth={4} />
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-700'}`}>{ao.name}</span>
                                                    <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>+₹{Number(ao.price).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>



                {/* 3. Inventory Management (Modified) */}
                <div className="bg-white rounded-[24px] p-10 border border-slate-200/60 shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Box size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Inventory Management</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Default Stock Quantity</label>
                            <input type="number" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: e.target.value})} onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-200 transition-all" placeholder="0" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Product Status (Stock)</label>
                            <select value={form.product_status} onChange={e => setForm({...form, product_status: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-200 transition-all cursor-pointer">
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>


                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Product Combinations / Variants</h3>
                    </div>

                    {/* Saree Color Palette - Quick Creation */}
                    <div className="mb-12 p-8 bg-slate-50/50 rounded-[32px] border border-slate-200/60 shadow-inner">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-indigo-600">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em]">Saree Color Palette</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Quickly manifest new color variations</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {masters.colours?.map(c => {
                                const isAdded = combinations.some(comb => String(comb.colour_id) === String(c.id));
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            if (isAdded) {
                                                setCombinations(combinations.filter(comb => String(comb.colour_id) !== String(c.id)));
                                            } else {
                                                setCombinations(prev => [
                                                    ...prev.filter(comb => comb.colour_id !== ""),
                                                    { colour_id: String(c.id), size_id: "", stock_qty: "100", image_file: null, image_preview: null }
                                                ]);
                                            }
                                        }}
                                        className={`group relative p-3 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 ${
                                            isAdded 
                                                ? "bg-slate-900 border-slate-900 shadow-xl shadow-slate-200 scale-105" 
                                                : "bg-white border-slate-100 hover:border-indigo-200"
                                        }`}
                                    >
                                        <div className="w-6 h-6 rounded-lg border border-black/5 shadow-inner shrink-0" style={{ backgroundColor: c.hex_code }} />
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className={`text-[9px] font-black uppercase tracking-tighter truncate w-full ${isAdded ? 'text-white' : 'text-slate-600'}`}>{c.name}</span>
                                            {isAdded && <span className="text-[7px] font-black text-indigo-400 uppercase">ACTIVE</span>}
                                        </div>
                                        {isAdded && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                                <Plus size={10} strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Combinations List */}
                    <div className="space-y-6">
                        {combinations.map((comb, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-6 p-6 bg-slate-50/50 rounded-[20px] border border-slate-100 relative group/row">
                                <button type="button" onClick={() => removeCombination(index)} className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    <X size={14} />
                                </button>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</label>
                                    <select value={comb.size_id} onChange={e => updateCombination(index, "size_id", e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none">
                                        <option value="">Size</option>
                                        {masters.sizes?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</label>
                                    <select value={comb.colour_id} onChange={e => updateCombination(index, "colour_id", e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none">
                                        <option value="">Color</option>
                                        {masters.colours?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</label>
                                    <input type="number" value={comb.stock_qty} onChange={e => updateCombination(index, "stock_qty", e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none" placeholder="0" />
                                </div>

                                <div className="md:col-span-2 flex items-center gap-4 bg-slate-50/80 p-2.5 rounded-[20px] border border-slate-100 shadow-sm transition-all hover:bg-white hover:border-indigo-100">
                                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group/rowthumb relative shrink-0">
                                        {(() => {
                                            const combinedSrc = comb.image_preview || (comb.existing_image ? (comb.existing_image.startsWith('http') ? comb.existing_image : `${BASE_URL}/${comb.existing_image}`) : null);
                                            return combinedSrc ? (
                                                <>
                                                    <img src={combinedSrc} className="w-full h-full object-cover group-hover/rowthumb:scale-110 transition-all duration-500" />
                                                    <button type="button" onClick={() => {
                                                        setCombinations(prev => {
                                                            const newCombs = [...prev];
                                                            newCombs[index] = {
                                                                ...newCombs[index],
                                                                image_preview: null,
                                                                image_file: null,
                                                                existing_image: ""
                                                            };
                                                            return newCombs;
                                                        });
                                                    }} className="absolute inset-0 bg-black/60 opacity-0 group-hover/rowthumb:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                                        <Trash2 size={16} className="text-white" />
                                                    </button>
                                                </>
                                            ) : (
                                                <LucideImage size={18} className="text-slate-200" />
                                            )
                                        })()}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <input type="file" id={`comb-img-${index}`} className="hidden" accept="image/*" onChange={(e) => handleCombinationImage(index, e)} />
                                        <label htmlFor={`comb-img-${index}`} className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase text-center cursor-pointer hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md active:scale-95 transition-all">
                                            {comb.image_preview || comb.existing_image ? "Change Image" : "Add Image"}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button type="button" onClick={handleAddCombination}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-[18px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all">
                        <Plus size={18} strokeWidth={3} /> Add Combination
                    </button>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-2 italic">* Combinations allow you to set specific stock and price for different sizes/colors.</p>
                </div>

                {/* 4. Product Photos */}
                <div className="bg-white rounded-[24px] p-10 border border-slate-200/60 shadow-sm space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <LucideImage size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Main Photos</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Featured Photo</label>
                                    <div className="w-48 h-56 rounded-[24px] border-2 border-dashed border-indigo-100 bg-indigo-50/20 flex items-center justify-center relative overflow-hidden group">
                                        {(() => {
                                            const src = featuredPreview ? (featuredPreview.startsWith('blob:') || featuredPreview.startsWith('http') ? featuredPreview : `${BASE_URL}/${featuredPreview}`) : null;
                                            return src ? <img src={src} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" /> : <Camera size={24} className="text-indigo-200" />;
                                        })()}
                                        <input ref={featuredInputRef} type="file" className="hidden" accept="image/*" onChange={handleFeaturedChange} />
                                    </div>
                                    <button type="button" onClick={() => featuredInputRef.current?.click()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md">Choose Featured</button>
                                </div>
                        <div className="space-y-4">
                             <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Other Photos</label>
                             <div className="flex flex-wrap gap-4">
                                {existingImages.filter(img => !featuredPreview?.includes(img.image_path)).map((img, i) => (
                                    <div key={`ex-${i}`} className="w-24 h-32 rounded-xl border border-slate-100 overflow-hidden shadow-sm relative group/thumb">
                                        <img src={img.image_path.startsWith('http') ? img.image_path : `${BASE_URL}/${img.image_path}`} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                            <Trash2 size={16} className="text-white" />
                                        </button>
                                    </div>
                                ))}

                                {otherPreviews.map((url, i) => (
                                    <div key={`new-${i}`} className="w-24 h-32 rounded-xl border border-slate-100 overflow-hidden shadow-sm relative group/thumb">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeOtherPhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 active:scale-90 transition-all z-10">
                                            <X size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => otherInputRef.current?.click()} className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-orange-500 hover:border-orange-200 transition-all"><Plus size={24} /></button>
                                <input ref={otherInputRef} type="file" multiple className="hidden" accept="image/*" onChange={handleOtherChange} />
                             </div>
                        </div>
                    </div>
                </div>

                {/* 5. Return Policy */}
                <div className="bg-white rounded-[24px] p-10 border border-slate-200/60 shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FileText size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Return Policy</h2>
                    </div>
                    <textarea rows={4} value={form.return_policy} onChange={e => setForm({...form, return_policy: e.target.value})}
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" placeholder="Specify policies..." />
                </div>

                {/* 6. Fabric Care Details */}
                <div className="bg-white rounded-[24px] p-10 border border-slate-200/60 shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Fabric Care & Saree Specifications</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Fabric Care Note</label>
                            <textarea rows={4} value={form.fabric_care} onChange={e => setForm({...form, fabric_care: e.target.value})}
                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-200 transition-all" placeholder="Enter fabric care instructions..." />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-2 italic">Garment maintenance guide.</p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Saree Specifications</label>
                            <textarea rows={4} value={form.saree_specifications} onChange={e => setForm({...form, saree_specifications: e.target.value})}
                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-200 transition-all" placeholder="Enter saree specifications (e.g. Length, Work, etc.)" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-2 italic">Detailed technical specs for the saree.</p>
                        </div>
                    </div>
                </div>

                {/* 6. Settings */}
                <div className="bg-white rounded-[24px] p-10 border border-slate-200/60 shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Product Settings</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-10">
                        <button type="button" onClick={() => setForm({...form, free_delivery: form.free_delivery ? 0 : 1})}
                                className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 ${form.free_delivery ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-100'}`}>
                            <Truck size={18} /> <span className="text-[10px] font-black uppercase">Free Delivery</span>
                        </button>
                        <div className="flex items-center gap-3">
                             <input type="checkbox" checked={form.on_sale === 1} onChange={e => setForm({...form, on_sale: e.target.checked ? 1 : 0})} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                             <span className="text-xs font-black text-slate-700 uppercase tracking-widest">On Sale</span>
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                             <select value={form.product_status} onChange={e => setForm({...form, product_status: e.target.value})}
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                                 <option value="Active">Active</option>
                                 <option value="Inactive">Inactive</option>
                             </select>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-center gap-6 pt-10 pb-20">
                    <button type="submit" disabled={loading}
                        className="min-w-[280px] py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.25em] flex items-center justify-center gap-4 shadow-2xl shadow-emerald-200 transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isEdit ? "Update Product" : "Save Product"}
                    </button>
                    <button type="button" onClick={() => navigate(-1)}
                        className="min-w-[280px] py-6 bg-slate-600 hover:bg-slate-700 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.25em] flex items-center justify-center gap-4 shadow-xl shadow-slate-100 transition-all hover:scale-[1.05] active:scale-95">
                        <X size={20} /> Cancel
                    </button>
                </div>

            </form>
        </div>
    );
}
