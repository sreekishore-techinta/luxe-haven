import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, Image as ImageIcon, Loader2, Save, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams, Link } from "react-router-dom";
import { API_URL as API } from "@/api_config";

export default function AdminAddService() {
    const { id } = useParams();
    const isEdit = !!id;

    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [existingUrl, setExistingUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    
    // Category mapping
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<string>("");
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCats = async () => {
           try {
               const res = await fetch(`${API}/masters/index.php?type=categories`);
               const json = await res.json();
               if (json.status === "success") setCategories(json.data.filter((c:any) => c.status === "Active"));
           } catch(e) {}
        };
        fetchCats();

        if (isEdit) {
            const fetchService = async () => {
                try {
                    const res = await fetch(`${API}/admin/services/get.php?id=${id}`);
                    const json = await res.json();
                    if (json.status === "success") {
                        const s = json.data;
                        setTitle(s.title);
                        setTag(s.tag || "");
                        setLinkUrl(s.link_url || "");
                        setDisplayOrder(s.display_order);
                        setIsActive(Boolean(s.is_active));
                        setExistingUrl(s.image_url);
                        setPreview(s.image_url.startsWith('http') ? s.image_url : `/${s.image_url}`);
                        
                        // Link existing category if possible
                        if (s.linked_category_id) setSelectedCatId(String(s.linked_category_id));
                    }
                } catch (err) {
                    toast.error("Failed to load category data");
                }
            };
            fetchService();
        }
    }, [id, isEdit]);

    const handleCategoryChange = (val: string) => {
        setSelectedCatId(val);
        const cat = categories.find(c => String(c.id) === val);
        if (cat) {
            // Auto-fill title if empty
            if (!title) setTitle(cat.name);
            // Set link URL
            setLinkUrl(`/collections?category=${encodeURIComponent(cat.name)}`);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image && !isEdit) return toast.error("Please upload an image");
        
        setLoading(true);
        try {
            let finalImageUrl = existingUrl;

            // 1. Upload new image if provided
            if (image) {
                const formData = new FormData();
                formData.append("image", image);
                
                const uploadRes = await fetch(`${API}/admin/services/upload.php`, {
                    method: "POST",
                    body: formData
                });
                const uploadJson = await uploadRes.json();
                if (uploadJson.status !== "success") throw new Error(uploadJson.message);
                finalImageUrl = uploadJson.url;
            }
            
            // 2. Save Data (Add or Update)
            const endpoint = isEdit ? "update.php" : "add.php";
            const saveRes = await fetch(`${API}/admin/services/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: isEdit ? parseInt(id) : undefined,
                    title,
                    tag,
                    link_url: linkUrl,
                    display_order: displayOrder,
                    is_active: isActive ? 1 : 0,
                    image_url: finalImageUrl,
                    linked_category_id: selectedCatId ? parseInt(selectedCatId) : null
                })
            });
            const saveJson = await saveRes.json();
            
            if (saveJson.status === "success") {
                toast.success(isEdit ? "Service updated!" : "Service added!");
                navigate("/admin/services/list");
            } else {
                toast.error(saveJson.message);
            }
        } catch (err: any) {
            toast.error(err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div className="space-y-4">
                  <Link to="/admin/services/list" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#D4AF37] transition-all">
                    <ArrowLeft size={14} /> Back to List
                  </Link>
                    <h1 className="font-display text-4xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                        <Sparkles className="text-[#D4AF37]" size={32} />
                        {isEdit ? "Edit Category" : "Add New Category"}
                    </h1>
                    <p className="text-slate-500 font-bold">
                      {isEdit ? `Update settings for ${title}` : "Add a new category card to the homepage."}
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image Upload Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#D4AF37] block mb-4 font-black">Category Image</label>
                        
                        <div className={`relative aspect-square rounded-full border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center overflow-hidden ${preview ? "border-emerald-200" : "border-slate-200 hover:border-[#D4AF37]/50"}`}>
                            {preview ? (
                                <>
                                    <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-full" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                      <p className="text-[10px] font-black uppercase tracking-widest">Swap Image</p>
                                    </div>
                                    {image && (
                                       <button 
                                          type="button" 
                                          onClick={() => {setPreview(null); setImage(null)}} 
                                          className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-20"
                                      >
                                          <X size={16} />
                                      </button>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                        <ImageIcon size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-900 uppercase">Drop cover image</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Recommended: 1:1 Aspect Ratio</p>
                                    </div>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] p-8 lg:p-10 border border-slate-100 shadow-sm space-y-8">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="font-body text-[10px] uppercase tracking-widest text-slate-400 ml-1 font-black">Title</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. Silk Masterworks"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-body text-[10px] uppercase tracking-widest text-slate-400 ml-1 font-black">Link to Category</label>
                                <select
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black focus:ring-4 focus:ring-slate-100 outline-none transition-all appearance-none cursor-pointer"
                                    value={selectedCatId}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                >
                                    <option value="">No Category Link</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-body text-[10px] uppercase tracking-widest text-slate-400 ml-1 font-black">Badge / Tag</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. New Arrival"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-body text-[10px] uppercase tracking-widest text-slate-400 ml-1 font-black">Display Order</label>
                                <input 
                                    type="number" 
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">

                            <div className="space-y-2">
                                <label className="font-body text-[10px] uppercase tracking-widest text-slate-400 ml-1 font-black">Status</label>
                                <div className="flex items-center h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={isActive} 
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" 
                                    />
                                    <span className="text-sm font-black text-slate-900">{isActive ? "Active" : "Inactive"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                             <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-5 bg-[#0F172A] hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-70 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} className="group-hover:scale-110 transition-transform" /> {isEdit ? "Save Changes" : "Add Category"}</>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

