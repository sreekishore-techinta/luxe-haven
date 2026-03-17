import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus, Plus, Trash2, ArrowRight, ShoppingBag,
  Truck, Shield, RotateCcw, CheckCircle, Package, Loader2
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import PageHeroBanner from "@/components/PageHeroBanner";
import checkoutHero from "@/assets/checkout-hero.png";
import { toast } from "sonner";

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
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);

  const [form, setForm] = useState<ShippingForm>({
    firstName: "", lastName: "", email: "",
    phone: "", address: "", city: "",
    state: "", pincode: "", paymentMethod: "COD",
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingForm, setBillingForm] = useState<Partial<ShippingForm>>({
    firstName: "", lastName: "", address: "", city: "", state: "", pincode: ""
  });

  useEffect(() => {
    // Check if user is logged in to pre-fill
    fetch(`${API}/auth/customer_check.php`, { credentials: "include" })
      .then(res => res.json())
      .then(json => {
        if (json.loggedIn && json.customer) {
          setCustomer(json.customer);
          const names = json.customer.name.split(" ");
          setForm(prev => ({
            ...prev,
            firstName: names[0] || "",
            lastName: names.slice(1).join(" ") || "",
            email: json.customer.email || "",
            phone: json.customer.phone || "",
            address: json.customer.address || "",
            city: json.customer.city || "",
            state: json.customer.state || "",
            pincode: json.customer.pincode || "",
          }));
        }
      })
      .catch(err => console.error("Session check failed", err));
  }, []);

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
    const cleanPhone = form.phone.replace(/[\s+-]/g, '');
    if (!form.phone.trim() || !/^\d{10,12}$/.test(cleanPhone)) return "Valid phone number is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.city.trim()) return "City is required";
    const cleanPincode = form.pincode.replace(/\s/g, '');
    if (!form.pincode.trim() || !/^\d{6}$/.test(cleanPincode)) return "Valid 6-digit pincode is required";
    return null;
  };

  const handlePlaceOrder = async () => {
    const validationError = validateShipping();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);

    // Simulate Payment Process if not COD
    if (form.paymentMethod !== "COD") {
      setProcessingPayment(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate gateway delay
      setProcessingPayment(false);
    }

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
        billing_name: billingSameAsShipping ? `${form.firstName} ${form.lastName}` : `${billingForm.firstName} ${billingForm.lastName}`,
        billing_address: billingSameAsShipping ? form.address : billingForm.address,
        billing_city: billingSameAsShipping ? form.city : billingForm.city,
        billing_state: billingSameAsShipping ? form.state : billingForm.state,
        billing_pincode: billingSameAsShipping ? form.pincode : billingForm.pincode,
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

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        throw new Error("The server encountered an unexpected error while processing your request.");
      }

      if (json.status === "success") {
        setOrderResult({ orderNumber: json.order_number });
        clearCart();
        setStep("confirm");
        toast.success("Order authorized successfully");
      } else {
        const msg = json.message || "Failed to authorize your order.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "Network error. Please check your connection.";
      setError(msg);
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  // ─── EMPTY CART ────────────────────────────────────────────────────────────
  if (items.length === 0 && step !== "confirm") {
    return (
      <div>
        <PageHeroBanner
          title="Shopping Bag"
          subtitle="Checkout"
          backgroundImage={checkoutHero}
          heightClass="h-[90vh] lg:h-screen"
        />
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
        <PageHeroBanner
          title="Order Confirmed"
          subtitle="Thank You!"
          backgroundImage={checkoutHero}
          heightClass="h-[90vh] lg:h-screen"
        />
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
      <PageHeroBanner
        title="Checkout"
        subtitle="Shopping Bag"
        backgroundImage={checkoutHero}
        heightClass="h-[90vh] lg:h-screen"
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
          {[
            { key: "cart", label: "Cart" },
            { key: "shipping", label: "Shipping" },
          ].map((s, i) => {
            const steps = ["cart", "shipping"];
            const isActive = steps.indexOf(step) >= i;
            return (
              <div key={s.key} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-[10px] sm:text-xs transition-colors ${isActive ? "luxury-gradient text-champagne" : "border border-border text-muted-foreground"
                    }`}>{i + 1}</div>
                  <span className={`font-body text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] ${isActive ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 1 && <div className={`w-8 sm:w-12 h-px ${isActive ? "bg-foreground" : "bg-border"}`} />}
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
                    <div key={item.product.id} className="flex gap-4 sm:gap-5 pb-6 border-b border-border">
                      <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="font-display text-sm font-medium mb-1 hover:text-accent transition-colors truncate">{item.product.name}</h3>
                        </Link>
                        <p className="font-body text-[10px] sm:text-xs text-muted-foreground mb-1">{item.product.fabric} · {item.product.color}</p>
                        <p className="font-body text-sm font-semibold text-accent mb-3">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center border border-border hover:border-foreground transition-colors min-h-[44px]">
                            <Minus size={12} />
                          </button>
                          <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center border border-border hover:border-foreground transition-colors min-h-[44px]">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <p className="font-body text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                        <button onClick={() => removeFromCart(item.product.id)} className="w-10 h-10 flex items-center justify-end text-muted-foreground hover:text-destructive transition-colors min-h-[44px]">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">City *</label>
                      <input name="city" value={form.city} onChange={handleField} type="text" className="input-luxury min-h-[44px]" placeholder="City" />
                    </div>
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">State</label>
                      <input name="state" value={form.state} onChange={handleField} type="text" className="input-luxury min-h-[44px]" placeholder="State" />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">PIN Code *</label>
                    <input name="pincode" value={form.pincode} onChange={handleField} type="text" className="input-luxury" placeholder="6-digit PIN code" maxLength={6} />
                  </div>

                  {/* Billing Address Toggle */}
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${billingSameAsShipping ? "bg-[#0D3B2E] border-[#0D3B2E]" : "border-border group-hover:border-[#0D3B2E]"}`}>
                        {billingSameAsShipping && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={billingSameAsShipping}
                        onChange={() => setBillingSameAsShipping(!billingSameAsShipping)}
                      />
                      <span className="font-body text-xs text-muted-foreground">Billing address same as shipping</span>
                    </label>
                  </div>

                  {!billingSameAsShipping && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="space-y-4 pt-4 border-t border-border overflow-hidden"
                    >
                      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Billing Details</p>
                      <div className="grid grid-cols-2 gap-4">
                        <input name="firstName" value={billingForm.firstName} onChange={(e) => setBillingForm(f => ({ ...f, firstName: e.target.value }))} type="text" className="input-luxury" placeholder="First Name" />
                        <input name="lastName" value={billingForm.lastName} onChange={(e) => setBillingForm(f => ({ ...f, lastName: e.target.value }))} type="text" className="input-luxury" placeholder="Last Name" />
                      </div>
                      <input name="address" value={billingForm.address} onChange={(e) => setBillingForm(f => ({ ...f, address: e.target.value }))} type="text" className="input-luxury" placeholder="Street Address" />
                      <div className="grid grid-cols-2 gap-4">
                        <input name="city" value={billingForm.city} onChange={(e) => setBillingForm(f => ({ ...f, city: e.target.value }))} type="text" className="input-luxury" placeholder="City" />
                        <input name="pincode" value={billingForm.pincode} onChange={(e) => setBillingForm(f => ({ ...f, pincode: e.target.value }))} type="text" className="input-luxury" placeholder="PIN Code" />
                      </div>
                    </motion.div>
                  )}

                  {/* Payment Method */}
                  <div className="pt-6 border-t border-border">
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#0D3B2E] font-bold mb-4">Payment Selection</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: "COD", label: "Cash on Delivery", desc: "Pay at your doorstep" },
                        { id: "UPI", label: "UPI (GPay/PhonePe)", desc: "Instant mobile payment" },
                        { id: "Card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
                        { id: "Net Banking", label: "Net Banking", desc: "All major Indian banks" }
                      ].map(method => (
                        <label key={method.id}
                          className={`flex flex-col gap-1 p-4 border rounded-xl cursor-pointer transition-all duration-300 ${form.paymentMethod === method.id
                            ? "border-[#B48C5E] bg-[#B48C5E]/5 shadow-[0_0_15px_rgba(180,140,94,0.15)] ring-1 ring-[#B48C5E]/30"
                            : "border-border bg-white hover:border-[#0D3B2E]/30"
                            }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-display text-sm font-semibold ${form.paymentMethod === method.id ? "text-[#0D3B2E]" : "text-gray-700"}`}>
                              {method.label}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.paymentMethod === method.id ? "border-[#B48C5E] bg-[#B48C5E]" : "border-gray-300"}`}>
                              {form.paymentMethod === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-body italic">{method.desc}</span>
                          <input
                            type="radio" name="paymentMethod" value={method.id}
                            checked={form.paymentMethod === method.id}
                            onChange={handleField} className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button onClick={() => { setStep("cart"); setError(null); }} className="btn-outline">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || processingPayment}
                    className="btn-primary flex-1 md:flex-none px-12 group disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      {processingPayment ? (
                        <motion.span
                          key="processing"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="animate-spin" size={16} /> Verifying Payment...
                        </motion.span>
                      ) : placing ? (
                        <motion.span
                          key="placing"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="animate-spin" size={16} /> Confirming Order...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Place Order <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </motion.span>
                      )}
                    </AnimatePresence>
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
