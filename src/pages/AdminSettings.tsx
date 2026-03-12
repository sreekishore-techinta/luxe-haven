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

const API = "http://localhost:8000";

const AdminSettings = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
                <Loader2 size={48} className="animate-spin" strokeWidth={1} />
                <p className="font-display text-2xl italic">Loading system configurations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 gap-4 bg-rose-50 rounded-2xl border border-rose-100 p-8 text-center max-w-2xl mx-auto mt-10">
                <AlertCircle size={48} strokeWidth={1} />
                <div>
                    <p className="font-display text-2xl font-semibold mb-2 italic">Settings Load Failed</p>
                    <p className="text-sm opacity-80 mb-6 font-medium">To edit settings via PHP, start your server: <code className="block mt-4 bg-rose-200/50 p-2 rounded text-xs select-all">php -S localhost:8000 -t api/</code></p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px]">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-4xl font-semibold mb-2 leading-tight">System Settings</h1>
                    <p className="font-body text-sm text-gray-400 font-medium">Configure your boutique's global parameters and preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-[#B48C5E] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-[#B48C5E]/20 hover:bg-[#A67D50] transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation */}
                <div className="space-y-2">
                    {[
                        { id: 'general', label: 'General Info', icon: Globe },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'security', label: 'Security', icon: Lock },
                        { id: 'payments', label: 'Payments', icon: CreditCard }
                    ].map((item, i) => (
                        <button
                            key={item.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${i === 0 ? 'bg-white text-[#B48C5E] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Form Panels */}
                <div className="md:col-span-2 space-y-6">
                    {/* General Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
                    >
                        <h3 className="text-lg font-semibold font-display mb-4">Store Identity</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Official Store Name</label>
                                <input
                                    type="text"
                                    value={settings.store_name}
                                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 text-sm focus:ring-0 focus:border-[#B48C5E] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Support Email Address</label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 text-sm focus:ring-0 focus:border-[#B48C5E] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Storefront Public Notice</label>
                                <textarea
                                    value={settings.public_notice}
                                    onChange={(e) => setSettings({ ...settings, public_notice: e.target.value })}
                                    placeholder="Message to display on the public storefront banner..."
                                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 text-sm focus:ring-0 focus:border-[#B48C5E] transition-all min-h-[80px]"
                                />
                                <p className="text-[9px] text-gray-400 italic font-medium">This message will appear in the top announcement bar of the website.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Currency Display</label>
                                    <select className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 text-sm focus:ring-0 focus:border-[#B48C5E] transition-all">
                                        <option value="INR">Indian Rupee (₹)</option>
                                        <option value="USD">US Dollar ($)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Tax Rate (%)</label>
                                    <input
                                        type="number"
                                        value={settings.tax_rate}
                                        onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 text-sm focus:ring-0 focus:border-[#B48C5E] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Operational Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
                    >
                        <h3 className="text-lg font-semibold font-display mb-4">Operations & Shipping</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Maintenance Mode', desc: 'Temporary disable public access to the storefront', active: settings.maintenance_mode },
                                { label: 'Automated Invoicing', desc: 'Generate and email PDF invoices upon successful payment', active: true },
                                { label: 'Stock Alerts', desc: 'Notify admin when product stock reaches below 10 units', active: settings.notifications.low_stock }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50/30 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{item.label}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{item.desc}</p>
                                    </div>
                                    <div
                                        onClick={() => {
                                            if (item.label === 'Maintenance Mode') {
                                                setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode });
                                            } else if (item.label === 'Stock Alerts') {
                                                setSettings({
                                                    ...settings,
                                                    notifications: { ...settings.notifications, low_stock: !settings.notifications.low_stock }
                                                });
                                            }
                                        }}
                                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${item.active ? 'bg-[#0D3B2E]' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.active ? 'left-7' : 'left-1'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
