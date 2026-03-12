import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User, Package, Heart, MapPin, LogOut, ChevronRight,
  ShoppingBag, Eye, EyeOff, Loader2
} from "lucide-react";
import PageHeroBanner from "@/components/PageHeroBanner";

const API = "http://localhost:8000";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  id: number;
  order_number: string;
  total: number;
  status: string;
  payment_method: string;
  item_count: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const Account = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", password: "" });

  // Check session on mount
  useEffect(() => {
    fetch(`${API}/auth/customer_check.php`, { credentials: "include" })
      .then(r => r.json())
      .then(json => {
        if (json.loggedIn) setCustomer(json.customer);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  // Fetch orders when on orders tab
  useEffect(() => {
    if (activeTab === "orders" && customer) {
      setLoadingOrders(true);
      fetch(`${API}/auth/customer_orders.php`, { credentials: "include" })
        .then(r => r.json())
        .then(json => { if (json.status === "success") setOrders(json.data); })
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab, customer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/customer_login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });
      const json = await res.json();
      if (json.status === "success") {
        setCustomer(json.customer);
      } else {
        setError(json.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/customer_register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(regForm),
      });
      const json = await res.json();
      if (json.status === "success") {
        setCustomer(json.customer);
        setSuccess("Account created! Welcome to Lishan Sarees.");
      } else {
        setError(json.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/customer_check.php`, { method: "POST", credentials: "include" });
    setCustomer(null);
    setActiveTab("profile");
    setOrders([]);
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  // ── AUTH SCREEN ──────────────────────────────────────────────────────────
  if (!customer) {
    return (
      <div>
        <PageHeroBanner title="My Account" subtitle="Sign In or Register" />
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-md mx-auto">
            {/* Toggle */}
            <div className="flex border border-border rounded overflow-hidden mb-8">
              {(["login", "register"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setAuthMode(mode); setError(null); }}
                  className={`flex-1 py-3 font-body text-sm uppercase tracking-wider transition-all ${authMode === mode ? "luxury-gradient text-champagne" : "text-muted-foreground hover:bg-card"
                    }`}
                >
                  {mode === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-body">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {authMode === "login" ? (
                <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Email</label>
                    <input type="email" className="input-luxury" placeholder="your@email.com"
                      value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Password</label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} className="input-luxury pr-10"
                        placeholder="Enter password" value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPass(s => !s)}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center disabled:opacity-60">
                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
                  </button>
                  <p className="text-center font-body text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("register")} className="text-accent font-medium underline">
                      Register
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Full Name *</label>
                    <input type="text" className="input-luxury" placeholder="Your full name"
                      value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Email *</label>
                    <input type="email" className="input-luxury" placeholder="your@email.com"
                      value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Phone</label>
                    <input type="tel" className="input-luxury" placeholder="10-digit mobile number"
                      value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Password *</label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} className="input-luxury pr-10"
                        placeholder="Min. 6 characters" value={regForm.password}
                        onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPass(s => !s)}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center disabled:opacity-60">
                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
                  </button>
                  <p className="text-center font-body text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("login")} className="text-accent font-medium underline">
                      Sign In
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGGED-IN DASHBOARD ───────────────────────────────────────────────────
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <div>
      <PageHeroBanner title="My Account" subtitle={`Welcome, ${customer.name.split(" ")[0]}`} />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-body">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          {/* Sidebar */}
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
            <div className="bg-card p-4 rounded-lg mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full luxury-gradient flex items-center justify-center">
                <span className="text-champagne font-bold text-sm">{customer.name[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="font-body text-sm font-semibold">{customer.name}</p>
                <p className="font-body text-xs text-muted-foreground">{customer.email}</p>
              </div>
            </div>

            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-body text-sm transition-all duration-300 rounded ${activeTab === tab.id
                    ? "bg-card text-foreground border-l-2 border-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}>
                <tab.icon size={16} />
                <span className="tracking-wide">{tab.label}</span>
                <ChevronRight size={14} className="ml-auto opacity-40" />
              </button>
            ))}

            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm text-muted-foreground hover:text-destructive transition-colors mt-4">
              <LogOut size={16} />
              <span className="tracking-wide">Sign Out</span>
            </button>
          </motion.aside>

          {/* Dashboard Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            {activeTab === "profile" && (
              <div className="max-w-lg">
                <h2 className="font-display text-2xl font-semibold mb-6">Personal Information</h2>
                <div className="bg-card p-6 rounded-lg space-y-4">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Full Name</p>
                    <p className="font-body text-sm font-medium">{customer.name}</p>
                  </div>
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Email</p>
                    <p className="font-body text-sm font-medium">{customer.email}</p>
                  </div>
                  {customer.phone && (
                    <div>
                      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Phone</p>
                      <p className="font-body text-sm font-medium">{customer.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">My Orders</h2>
                {loadingOrders ? (
                  <div className="flex items-center gap-3 text-muted-foreground py-12">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="font-body text-sm">Loading your orders...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg">
                    <ShoppingBag size={48} strokeWidth={1} className="text-muted-foreground/30 mb-4" />
                    <p className="font-display text-lg mb-2">No orders yet</p>
                    <p className="font-body text-sm text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                    <Link to="/collections" className="btn-gold">Browse Collections</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-card p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-body text-sm font-bold">{order.order_number}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-body font-medium ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="font-body text-xs text-muted-foreground">
                            {order.item_count} item{order.item_count !== 1 ? "s" : ""} ·{" "}
                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">Payment: {order.payment_method}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-body text-base font-semibold">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">My Wishlist</h2>
                <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg">
                  <Heart size={48} strokeWidth={1} className="text-muted-foreground/30 mb-4" />
                  <p className="font-display text-lg mb-2">Your wishlist is empty</p>
                  <p className="font-body text-sm text-muted-foreground mb-6">Save your favorite pieces here for later.</p>
                  <Link to="/collections" className="btn-gold">Explore Collection</Link>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">Saved Addresses</h2>
                <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg">
                  <MapPin size={48} strokeWidth={1} className="text-muted-foreground/30 mb-4" />
                  <p className="font-display text-lg mb-2">No addresses saved</p>
                  <p className="font-body text-sm text-muted-foreground mb-6">Add an address for faster checkout.</p>
                  <button className="btn-outline">Add Address</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Account;
