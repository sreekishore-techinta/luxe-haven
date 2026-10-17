import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, ImageIcon, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { API_URL as API, BASE_URL } from "@/api_config";

const AdminLogoUpload = () => {
    const [currentLogo, setCurrentLogo] = useState<string>("");
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Fetch current logo ──────────────────────────────────
    const fetchLogo = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/logo/get.php`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setCurrentLogo(json.logo_url || "");
            }
        } catch {
            toast.error("Failed to load current logo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogo(); }, []);

    // ── File selection ──────────────────────────────────────
    const handleFileChange = (selected: File | null) => {
        if (!selected) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
        if (!allowedTypes.includes(selected.type)) {
            toast.error("Invalid file type", { description: "Allowed: JPG, PNG, WEBP, GIF, SVG" });
            return;
        }
        if (selected.size > 5 * 1024 * 1024) {
            toast.error("File too large", { description: "Maximum allowed size is 5 MB" });
            return;
        }

        setFile(selected);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selected);
    };

    // ── Drag-and-drop ───────────────────────────────────────
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFileChange(dropped);
    };

    // ── Upload ──────────────────────────────────────────────
    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("logo", file);

            const res = await fetch(`${API}/admin/logo/upload.php`, {
                method: "POST",
                credentials: "include",
                body: fd,
            });
            const json = await res.json();

            if (json.status === "success") {
                setCurrentLogo(json.logo_url);
                setFile(null);
                setPreview(null);
                // Notify AdminLayout sidebar to refresh logo
                window.dispatchEvent(new Event("admin:logo-updated"));
                toast.success("Logo uploaded successfully", {
                    description: "The new logo is now live on your storefront.",
                });
            } else {
                throw new Error(json.message || "Upload failed");
            }
        } catch (err: any) {
            toast.error("Upload failed", { description: err.message });
        } finally {
            setUploading(false);
        }
    };

    // ── Remove logo ─────────────────────────────────────────
    const handleRemove = async () => {
        if (!confirm("Remove the current logo? The default text logo will be shown instead.")) return;
        setRemoving(true);
        try {
            const fd = new FormData();
            fd.append("remove_logo", "1");
            const res = await fetch(`${API}/admin/logo/upload.php`, {
                method: "POST",
                credentials: "include",
                body: fd,
            });
            const json = await res.json();
            if (json.status === "success") {
                setCurrentLogo("");
                setFile(null);
                setPreview(null);
                // Notify AdminLayout sidebar to refresh logo
                window.dispatchEvent(new Event("admin:logo-updated"));
                toast.success("Logo removed");
            } else {
                throw new Error(json.message);
            }
        } catch (err: any) {
            toast.error("Remove failed", { description: err.message });
        } finally {
            setRemoving(false);
        }
    };

    // ── Helpers ─────────────────────────────────────────────
    const resolveUrl = (url: string) =>
        url.startsWith("http") ? url : `${BASE_URL}/${url}`;

    const discard = () => { setFile(null); setPreview(null); };

    // ── Render ──────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto space-y-8">

            {/* Page header */}
            <div>
                <h1 className="text-3xl font-black text-slate-950 tracking-tight">Logo Management</h1>
                <p className="text-xs font-black text-slate-500 mt-2 uppercase tracking-widest">
                    Upload &amp; manage your store logo
                </p>
            </div>

            {/* ── Current Logo Card ── */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl text-[#D4AF37]">
                            <ImageIcon size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-black text-slate-950 tracking-tight">Current Logo</span>
                    </div>
                    {!loading && currentLogo && (
                        <button
                            onClick={handleRemove}
                            disabled={removing}
                            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                        >
                            {removing
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Trash2 size={14} strokeWidth={2.5} />}
                            Remove
                        </button>
                    )}
                </div>

                <div className="p-8 flex items-center justify-center min-h-[200px]">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Loader2 size={32} className="animate-spin" strokeWidth={1.5} />
                            <p className="text-xs font-black tracking-widest uppercase">Loading...</p>
                        </div>
                    ) : currentLogo ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <img
                                    src={resolveUrl(currentLogo)}
                                    alt="Store logo"
                                    className="max-h-40 max-w-sm object-contain"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-emerald-600 text-xs font-black">
                                <CheckCircle2 size={14} strokeWidth={2.5} />
                                Logo is active on storefront
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold break-all">{currentLogo}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <div className="w-20 h-20 bg-[#0F172A] rounded-2xl flex items-center justify-center text-[#D4AF37] font-black text-3xl shadow-lg">
                                L
                            </div>
                            <p className="text-sm font-black text-slate-500 mt-2">No logo uploaded</p>
                            <p className="text-xs font-bold text-slate-400">The default text logo is being displayed</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Upload New Logo Card ── */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl text-[#D4AF37]">
                        <Upload size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-black text-slate-950 tracking-tight">Upload New Logo</span>
                </div>

                <div className="p-8 space-y-6">
                    {/* Drop zone */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-4 p-10 ${
                            dragOver
                                ? "border-[#D4AF37] bg-amber-50"
                                : preview
                                ? "border-emerald-300 bg-emerald-50"
                                : "border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100"
                        }`}
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-h-36 max-w-xs object-contain rounded-xl shadow"
                            />
                        ) : (
                            <>
                                <div className={`p-4 rounded-2xl ${dragOver ? "bg-amber-100 text-[#D4AF37]" : "bg-white text-slate-400 shadow-sm border border-slate-200"}`}>
                                    <Upload size={28} strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black text-slate-700">
                                        {dragOver ? "Drop to upload" : "Click or drag & drop your logo"}
                                    </p>
                                    <p className="text-xs font-bold text-slate-400 mt-1">
                                        PNG, JPG, WEBP, GIF, SVG — max 5 MB
                                    </p>
                                </div>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        />
                    </div>

                    {/* File info + actions */}
                    {file && (
                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4 border border-slate-200">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-white rounded-xl border border-slate-200 text-[#D4AF37] shrink-0">
                                    <ImageIcon size={16} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-950 truncate">{file.name}</p>
                                    <p className="text-xs font-bold text-slate-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={discard}
                                className="ml-4 p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all shrink-0"
                                title="Discard"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}

                    {/* Upload button */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-[#0F172A] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-[#1E293B] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {uploading ? (
                            <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                        ) : (
                            <><Upload size={18} className="text-[#D4AF37]" /> Upload Logo</>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Guidelines Card ── */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-300">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-800 rounded-xl text-[#D4AF37] shrink-0 mt-0.5">
                        <AlertCircle size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black mb-3 tracking-tight">Logo Guidelines</h3>
                        <ul className="space-y-2">
                            {[
                                "Use a transparent background (PNG or SVG) for best results",
                                "Recommended dimensions: 300 × 100 px or wider (landscape)",
                                "SVG format is preferred for crisp display at all screen sizes",
                                "Maximum file size: 5 MB",
                                "Uploading a new logo automatically replaces the existing one",
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-300 font-bold">
                                    <span className="text-[#D4AF37] shrink-0 mt-0.5">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminLogoUpload;
