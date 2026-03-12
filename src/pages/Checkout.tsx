import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus, Plus, Trash2, ArrowRight, ShoppingBag,
  Truck, Shield, RotateCcw, CheckCircle, Package
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import PageHeroBanner from "@/components/PageHeroBanner";

const API = "http://localhost:8000";

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
}

const Checkout = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<"cart" | "shipping" | "confirm">("cart");
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ShippingForm>({
    firstName: "", lastName: "", email: "",
    phone: "", address: "", city: "",
    state: "", pincode: "", paymentMethod: "COD",
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const shipping = totalPrice >= 5000 ? 0 : 299;
  const grandTotal = totalPrice + shipping;

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validateShipping = (): string | null => {
    if (!form.firstName.trim()) return "First name is required";
    if (!form.lastName.trim()) return "Last name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Valid email is required";
    if (!form.phone.trim() || !/^\d{10,12}$/.test(form.phone.replace(/[\s+-]/g, ''))) return "Valid phone number is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.city.trim()) return "City is required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) return "Valid 6-digit pincode is required";
    return null;
  };

  const handlePlaceOrder = async () => {
    const validationError = validateShipping();
    if (validationError) { setError(validationError); return; }

    setError(null);
    setPlacing(true);
    try {
      const payload = {
        customer_name: `${form.firstName} ${form.lastName}`,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_pincode: form.pincode,
        payment_method: form.paymentMethod,
        subtotal: totalPrice,
        shipping_charge: shipping,
        total: grandTotal,
        items: items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          sku: item.product.sku || "",
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
      };

      const res = await fetch(`${API}/orders/index.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.status === "success") {
        setOrderResult({ orderNumber: json.order_number });
        clearCart();
        setStep("confirm");
      } else {
        setError(json.message || "Failed to place order. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setPlacing(false);
    }
  };

  // ─── EMPTY CART ────────────────────────────────────────────────────────────
  if (items.length === 0 && step !== "confirm") {
    return (
      <div>
        <PageHeroBanner title="Shopping Bag" subtitle="Checkout" />
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 mb-6 flex items-center justify-center border border-border rounded-full">
              <ShoppingBag size={32} strokeWidth={1} className="text-muted-foreground/40" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-3">Your Bag is Empty</h2>
            <p className="font-body text-sm text-muted-foreground max-w-sm mb-8">
              Looks like you haven't added anything to your bag yet.
            </p>
            <Link to="/collections" className="btn-gold">Start Shopping</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── ORDER SUCCESS ──────────────────────────────────────────────────────────
  if (step === "confirm" && orderResult) {
    return (
      <div>
        <PageHeroBanner title="Order Confirmed" subtitle="Thank You!" />
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-3xl font-semibold mb-3">Order Placed!</h2>
            <p className="font-body text-muted-foreground mb-2">
              Your order <span className="font-bold text-foreground">{orderResult.orderNumber}</span> has been placed successfully.
            </p>
            <p className="font-body text-sm text-muted-foreground mb-8">
              A confirmation will be sent to <strong>{form.email}</strong>. We'll process your order shortly.
            </p>
            <div className="bg-card rounded-lg p-6 mb-8 text-left space-y-3">
              <div className="flex items-center gap-3 text-sm font-body">
                <Package size={16} className="text-accent shrink-0" />
                <span><strong>Order:</strong> {orderResult.orderNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-body">
                <Truck size={16} className="text-accent shrink-0" />
                <span><strong>Delivery to:</strong> {form.city}, {form.pincode}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-body">
                <Shield size={16} className="text-accent shrink-0" />
                <span><strong>Payment:</strong> {form.paymentMethod}</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="btn-outline">Back to Home</Link>
              <Link to="/collections" className="btn-gold">Continue Shopping</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── MAIN CHECKOUT ─────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeroBanner title="Checkout" subtitle="Shopping Bag" />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { key: "cart", label: "Cart" },
            { key: "shipping", label: "Shipping & Payment" },
          ].map((s, i) => {
            const steps = ["cart", "shipping"];
            const isActive = steps.indexOf(step) >= i;
            return (
              <div key={s.key} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-xs transition-colors ${isActive ? "luxury-gradient text-champagne" : "border border-border text-muted-foreground"
                    }`}>{i + 1}</div>
                  <span className={`font-body text-xs uppercase tracking-[0.15em] ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 1 && <div className={`w-12 h-px ${isActive ? "bg-foreground" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Main Step Content */}
          <div>
            {/* ── STEP 1: CART ── */}
            {step === "cart" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-xl font-semibold mb-6">Your Items ({items.length})</h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-5 pb-6 border-b border-border">
                      <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-24 h-32 object-cover rounded" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="font-display text-sm font-medium mb-1 hover:text-accent transition-colors">{item.product.name}</h3>
                        </Link>
                        <p className="font-body text-xs text-muted-foreground mb-1">{item.product.fabric} · {item.product.color}</p>
                        <p className="font-body text-sm font-semibold text-accent mb-3">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-border hover:border-foreground transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-border hover:border-foreground transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <p className="font-body text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setStep("shipping")} className="btn-primary group">
                    Continue to Shipping
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: SHIPPING + PAYMENT ── */}
            {step === "shipping" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-xl font-semibold mb-6">Shipping & Payment</h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-body">
                    {error}
                  </div>
                )}

                <div className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">First Name *</label>
                      <input name="firstName" value={form.firstName} onChange={handleField} type="text" className="input-luxury" placeholder="First name" />
                    </div>
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Last Name *</label>
                      <input name="lastName" value={form.lastName} onChange={handleField} type="text" className="input-luxury" placeholder="Last name" />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Email *</label>
                    <input name="email" value={form.email} onChange={handleField} type="email" className="input-luxury" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleField} type="tel" className="input-luxury" placeholder="10-digit mobile number" />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Street Address *</label>
                    <input name="address" value={form.address} onChange={handleField} type="text" className="input-luxury" placeholder="House no., Street, Area" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">City *</label>
                      <input name="city" value={form.city} onChange={handleField} type="text" className="input-luxury" placeholder="City" />
                    </div>
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">State</label>
                      <input name="state" value={form.state} onChange={handleField} type="text" className="input-luxury" placeholder="State" />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">PIN Code *</label>
                    <input name="pincode" value={form.pincode} onChange={handleField} type="text" className="input-luxury" placeholder="6-digit PIN code" maxLength={6} />
                  </div>

                  {/* Payment Method */}
                  <div className="pt-4 border-t border-border">
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Payment Method</p>
                    <div className="grid grid-cols-2 gap-3">
                      {["COD", "UPI", "Card", "Net Banking"].map(method => (
                        <label key={method}
                          className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-all ${form.paymentMethod === method
                            ? "border-accent bg-accent/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-foreground/30"
                            }`}>
                          <input
                            type="radio" name="paymentMethod" value={method}
                            checked={form.paymentMethod === method}
                            onChange={handleField} className="accent-amber-600"
                          />
                          <span className="font-body text-sm">{method === "COD" ? "Cash on Delivery" : method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button onClick={() => { setStep("cart"); setError(null); }} className="btn-outline">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="btn-primary group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {placing ? "Placing Order..." : "Place Order"}
                    {!placing && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-card p-6 lg:p-8 rounded-lg">
              <h3 className="font-display text-lg font-semibold mb-6 pb-4 border-b border-border">Order Summary</h3>
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between font-body text-xs text-muted-foreground">
                    <span className="pr-2 truncate">{item.product.name} × {item.quantity}</span>
                    <span className="shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? "text-accent" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="font-body text-[11px] text-accent">Add {formatPrice(5000 - totalPrice)} more for free shipping</p>
                )}
              </div>
              <div className="flex justify-between font-body pt-4 border-t border-border">
                <span className="uppercase tracking-wider text-sm font-semibold">Total</span>
                <span className="text-lg font-bold">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RotateCcw, label: "Easy Returns" },
                { icon: Shield, label: "Secure" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded">
                  <Icon size={16} strokeWidth={1.5} className="text-accent" />
                  <span className="font-body text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
