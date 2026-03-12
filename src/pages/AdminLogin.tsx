import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

const API = "http://localhost:8000";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API}/auth/login.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const json = await res.json();
            if (json.status === "success") {
                setSuccess(true);
                // In a real app we'd use context/localStorage, but let's stick to simple session-based
                localStorage.setItem("admin_user", JSON.stringify(json.admin));
                setTimeout(() => navigate("/admin"), 1000);
            } else {
                setError(json.message || "Invalid email or password");
            }
        } catch (err: unknown) {
            setError("Could not connect to authentication server. Ensure PHP is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-[#B48C5E]/10 border border-[#B48C5E]/5 p-10 lg:p-12 relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#B48C5E]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#B48C5E]/5 rounded-full -ml-16 -mb-16 blur-3xl" />

                <div className="relative">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-[#F5F2EC] rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Lock size={28} strokeWidth={1.5} className="text-[#B48C5E]" />
                        </div>
                        <h1 className="font-display text-4xl font-semibold mb-3 tracking-tight text-gray-900">LuxeHaven <span className="text-[#B48C5E] italic">Admin</span></h1>
                        <p className="font-body text-sm text-gray-400 font-medium tracking-wide">Enter your credentials to access the admin portal.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1 mb-1">EMAIL ADDRESS</label>
                            <div className="relative">
                                <Mail size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@luxehaven.com"
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.25rem] text-sm text-gray-800 placeholder-gray-300 focus:border-[#B48C5E]/30 focus:bg-white focus:ring-4 focus:ring-[#B48C5E]/5 transition-all outline-none shadow-sm shadow-gray-100/50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1 mb-1">SECURE PASSWORD</label>
                            <div className="relative">
                                <Lock size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.25rem] text-sm text-gray-800 placeholder-gray-300 focus:border-[#B48C5E]/30 focus:bg-white focus:ring-4 focus:ring-[#B48C5E]/5 transition-all outline-none shadow-sm shadow-gray-100/50" />
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#FFF5F5] text-[#D32F2F] p-4 py-5 rounded-[1.25rem] text-[13px] font-semibold flex items-center gap-3">
                                <AlertCircle size={18} strokeWidth={2} className="shrink-0 text-[#D32F2F] ml-1" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-50 text-emerald-600 p-4 py-5 rounded-[1.25rem] text-[13px] font-semibold flex items-center gap-3">
                                <CheckCircle size={18} strokeWidth={2} className="shrink-0 ml-1" />
                                <span>Authentication successful! Redirecting...</span>
                            </motion.div>
                        )}

                        <button type="submit" disabled={loading || success}
                            className="w-full bg-[#AF8F66] mt-2 text-white py-4 rounded-[1.25rem] font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-[#9D805B] hover:shadow-xl hover:shadow-[#AF8F66]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <>SIGN IN TO DASHBOARD <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">Secure Admin Portal v2.0</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

