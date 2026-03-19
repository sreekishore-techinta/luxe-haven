import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User, Package, Heart, MapPin, LogOut, ChevronRight,
  ShoppingBag, Eye, EyeOff, Loader2, Plus, Trash2
} from "lucide-react";
import PageHeroBanner from "@/components/PageHeroBanner";
import accountHero from "@/assets/account-hero.png";

const API = "http://localhost/luxe-haven/api";

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

interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: number;
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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false
  });

  // Check session on mount
  useEffect(() => {
    fetch(`${API}/auth/customer_check.php`, { credentials: "include" })
      .then(r => r.json())
      .then(json => {
        if (json.loggedIn) setCustomer(json.customer);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  // Fetch addresses when on addresses tab
  useEffect(() => {
    if (activeTab === "addresses" && customer) {
      fetchAddresses();
    }
    if (activeTab === "orders" && customer) {
      fetchOrders();
    }
  }, [activeTab, customer]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API}/auth/customer_orders.php`, { credentials: "include" });
      const json = await res.json();
      if (json.status === "success") setOrders(json.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch(`${API}/auth/customer_addresses.php`, { credentials: "include" });
      const json = await res.json();
      if (json.status === "success") setAddresses(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/customer_addresses.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addressForm),
      });
      const json = await res.json();
      if (json.status === "success") {
        setSuccess("Address added successfully!");
        setIsAddingAddress(false);
        setAddressForm({
          full_name: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", pincode: "", is_default: false
        });
        fetchAddresses();
      } else {
        setError(json.message);
      }
    } catch {
      setError("Failed to add address");
    } finally {
      setAuthLoading(false);
    }
  };

  const deleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      const res = await fetch(`${API}/auth/customer_addresses.php?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.status === "success") {
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        <PageHeroBanner
          title="My Account"
          subtitle="Sign In or Register"
          backgroundImage={accountHero}
        />
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
      <PageHeroBanner
        title="My Account"
        subtitle={`Welcome, ${customer.name.split(" ")[0]}`}
        backgroundImage={accountHero}
      />

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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-semibold">Saved Addresses</h2>
                  {!isAddingAddress && addresses.length > 0 && (
                    <button onClick={() => setIsAddingAddress(true)} className="btn-gold flex items-center gap-2 py-2 px-4">
                      <Plus size={16} /> Add New
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-lg border border-border">
                    <h3 className="font-display text-lg mb-6">Add New Address</h3>
                    <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="label-sm">Full Name *</label>
                        <input type="text" className="input-luxury" required value={addressForm.full_name}
                          onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })} />
                      </div>
                      <div>
                        <label className="label-sm">Phone Number *</label>
                        <input type="tel" className="input-luxury" required value={addressForm.phone}
                          onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} />
                      </div>
                      <div>
                        <label className="label-sm">Pincode *</label>
                        <input type="text" className="input-luxury" required value={addressForm.pincode}
                          onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label-sm">Address Line 1 (House No, Street) *</label>
                        <input type="text" className="input-luxury" required value={addressForm.address_line1}
                          onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label-sm">Address Line 2 (Landmark, Area)</label>
                        <input type="text" className="input-luxury" value={addressForm.address_line2}
                          onChange={e => setAddressForm({ ...addressForm, address_line2: e.target.value })} />
                      </div>
                      <div>
                        <label className="label-sm">City *</label>
                        <input type="text" className="input-luxury" required value={addressForm.city}
                          onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                      </div>
                      <div>
                        <label className="label-sm">State *</label>
                        <input type="text" className="input-luxury" required value={addressForm.state}
                          onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2 py-2">
                        <input type="checkbox" id="is_default" checked={addressForm.is_default}
                          onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })} />
                        <label htmlFor="is_default" className="font-body text-xs cursor-pointer">Set as default address</label>
                      </div>
                      <div className="md:col-span-2 flex gap-3 mt-4">
                        <button type="submit" disabled={authLoading} className="btn-primary flex-1 justify-center">
                          {authLoading ? <Loader2 className="animate-spin" size={18} /> : "Save Address"}
                        </button>
                        <button type="button" onClick={() => setIsAddingAddress(false)} className="btn-outline flex-1 justify-center">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : loadingAddresses ? (
                  <div className="flex items-center gap-3 py-12">
                    <Loader2 size={24} className="animate-spin text-accent" />
                    <span className="font-body text-sm">Fetching addresses...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg">
                    <MapPin size={48} strokeWidth={1} className="text-muted-foreground/30 mb-4" />
                    <p className="font-display text-lg mb-2">No addresses saved</p>
                    <p className="font-body text-sm text-muted-foreground mb-6">Add an address for faster checkout.</p>
                    <button onClick={() => setIsAddingAddress(true)} className="btn-gold px-8">Add Address</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`p-5 rounded-lg border bg-card relative ${addr.is_default ? "border-accent shadow-sm" : "border-border"}`}>
                        {addr.is_default === 1 && (
                          <span className="absolute top-3 right-3 text-[9px] uppercase tracking-tighter bg-accent/10 text-accent px-2 py-0.5 rounded font-bold">Default</span>
                        )}
                        <p className="font-body text-sm font-bold mb-1">{addr.full_name}</p>
                        <p className="font-body text-xs text-muted-foreground mb-3">{addr.phone}</p>
                        <p className="font-body text-xs leading-relaxed text-muted-foreground">
                          {addr.address_line1}<br />
                          {addr.address_line2 && <>{addr.address_line2}<br /></>}
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <div className="mt-4 pt-4 border-t border-border flex justify-end">
                          <button onClick={() => deleteAddress(addr.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setIsAddingAddress(true)} className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-all group">
                      <Plus size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="font-body text-xs uppercase tracking-widest font-semibold">New Address</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Account;
