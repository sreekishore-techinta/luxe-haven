import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    Bell,
    Globe,
    Lock,
    CreditCard,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const API = "http://localhost/luxe-haven/api";

const AdminSettings = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API}/get_settings.php`, { credentials: "include" });
                if (!response.ok) throw new Error("Could not connect to PHP server");
                const json = await response.json();
                if (json.status === "success") {
                    setSettings(json.data);
                } else {
                    throw new Error("API error");
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${API}/get_settings.php`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(settings),
            });
            const json = await response.json();
            if (json.status === "success") {
                toast.success("Settings saved successfully", {
                    description: "Your store configuration has been updated."
                });
            } else {
                throw new Error(json.message);
            }
        } catch (err: any) {
            toast.error("Save failed", { description: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-4">
                <Loader2 size={48} className="animate-spin text-slate-400" strokeWidth={1.5} />
                <p className="text-xl font-black tracking-tight text-slate-950">Synchronizing configurations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-6 bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-2xl mx-auto mt-10 shadow-xl shadow-slate-200/50">
                <div className="p-4 bg-rose-50 rounded-full"><AlertCircle size={40} strokeWidth={2.5} /></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-950 mb-2">Connection Interrupted</h2>
                    <p className="text-sm font-black text-slate-700 mb-8 max-w-md mx-auto">We encountered an issue while retrieving your store parameters. Please ensure your backend services are operational.</p>
                    <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-200">
                        <code className="text-xs font-black text-slate-800">php -S localhost:8000 -t api/</code>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">Retry Synchronization</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">System Configuration</h1>
                    <p className="text-xs font-black text-slate-600 mt-2">GLOBAL PARAMETERS & ENTERPRISE PREFERENCES</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="group flex items-center gap-3 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 hover:bg-[#1E293B] transition-all disabled:opacity-50 active:scale-95"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="text-[#D4AF37]" />}
                    {saving ? "Processing..." : "Authorize Updates"}
                </button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'general', label: 'General Identity', icon: Globe },
                        { id: 'notifications', label: 'Event Alerts', icon: Bell },
                        { id: 'security', label: 'Access Security', icon: Lock },
                        { id: 'payments', label: 'Financial Gateways', icon: CreditCard }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === item.id
                                ? 'bg-white text-slate-950 shadow-xl shadow-slate-200 border border-slate-200'
                                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'}`}
                        >
                            <item.icon size={18} strokeWidth={2.5} className={activeTab === item.id ? "text-[#D4AF37]" : "text-slate-400 opacity-60"} />
                            {item.label}
                        </button>
                    ))}

                    <div className="mt-10 p-6 bg-slate-900 rounded-3xl text-white shadow-2xl shadow-slate-300">
                        <div className="p-2 bg-slate-800 w-fit rounded-lg mb-4 text-[#D4AF37]"><Settings size={20} /></div>
                        <h4 className="text-sm font-black mb-2">Registry Integrity</h4>
                        <p className="text-[10px] text-slate-300 font-extrabold leading-relaxed">Multi-point synchronization is active. All changes are broadcasted to the public storefront in real-time.</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 h-full overflow-y-auto custom-scrollbar pr-2 pt-1">
                    <div className="space-y-8 pb-10">
                    {activeTab === 'general' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            {/* General Info Card */}
                            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                                    <div className="w-1 h-4 bg-[#D4AF37] rounded-full"></div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-950">Boutique Identity</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Official Boutique Label</label>
                                        <input
                                            type="text"
                                            value={settings.store_name}
                                            onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                                            placeholder="Enter boutique name..."
                                            className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-black text-slate-950 focus:bg-white focus:border-[#D4AF37]/30 transition-all outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Administrative Intelligence Email</label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                            placeholder="admin@luxehaven.com"
                                            className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-black text-slate-950 focus:bg-white focus:border-[#D4AF37]/30 transition-all outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Front-end Broadcast Banner</label>
                                        <textarea
                                            value={settings.public_notice}
                                            onChange={(e) => setSettings({ ...settings, public_notice: e.target.value })}
                                            placeholder="Curating the announcement bar message..."
                                            className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-black text-slate-950 focus:bg-white focus:border-[#D4AF37]/30 transition-all min-h-[100px] outline-none resize-none placeholder:text-slate-400"
                                        />
                                        <div className="flex items-center gap-2 mt-2 px-1 text-[10px] text-slate-600 font-extrabold uppercase tracking-widest italic">
                                            <AlertCircle size={10} strokeWidth={3} /> Visible on global announcement head
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Monetary Denomination</label>
                                            <div className="relative">
                                                <select className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-black text-slate-950 focus:bg-white focus:border-[#D4AF37]/30 transition-all outline-none appearance-none cursor-pointer">
                                                    <option value="INR">Indian Rupee (₹)</option>
                                                    <option value="USD">US Dollar ($)</option>
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Globe size={16} strokeWidth={2.5} /></div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Taxation Index (%)</label>
                                            <input
                                                type="number"
                                                value={settings.tax_rate}
                                                onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-black text-slate-950 focus:bg-white focus:border-[#D4AF37]/30 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Operational Status Card */}
                            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                                    <div className="w-1 h-4 bg-[#D4AF37] rounded-full"></div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-950">Operational Logistics</h3>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: 'Maintenance Mode', desc: 'Seal the public storefront for infrastructure refinement', active: settings.maintenance_mode, key: 'maintenance' },
                                        { label: 'Cloud Invoicing', desc: 'Secure generation of digital transaction receipts', active: true, key: 'invoicing' },
                                        { label: 'Inventory Intelligence', desc: 'Automatic alert broadcast for low-census products', active: settings.notifications.low_stock, key: 'stock' }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#D4AF37]/20 transition-all">
                                            <div>
                                                <p className="text-sm font-black text-slate-950">{item.label}</p>
                                                <p className="text-[10px] text-slate-700 font-extrabold uppercase tracking-widest mt-1">{item.desc}</p>
                                            </div>
                                            <div
                                                onClick={() => {
                                                    if (item.key === 'maintenance') setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode });
                                                    if (item.key === 'stock') setSettings({ ...settings, notifications: { ...settings.notifications, low_stock: !settings.notifications.low_stock } });
                                                }}
                                                className={`w-14 h-7 rounded-full relative transition-all duration-500 cursor-pointer p-1 ${item.active ? 'bg-slate-900' : 'bg-slate-200'}`}>
                                                <div className={`w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-lg ${item.active ? 'translate-x-7' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab !== 'general' && (
                        <div className="bg-white p-20 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-6 bg-slate-50 rounded-full text-slate-400"><Settings size={40} strokeWidth={2.5} /></div>
                            <h3 className="text-xl font-black text-slate-950 italic">Advanced Configuration Panel</h3>
                            <p className="text-sm font-black text-slate-700 max-w-xs mx-auto">This module is currently undergoing security hardening. Access will be restored in the next deployment cycle.</p>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
