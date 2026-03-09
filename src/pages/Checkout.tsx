import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, Shield, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import PageHeroBanner from "@/components/PageHeroBanner";

const Checkout = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "shipping" | "payment">("cart");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const shipping = totalPrice >= 5000 ? 0 : 299;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
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
            <Link to="/collections" className="btn-gold">
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeroBanner title="Checkout" subtitle="Shopping Bag" />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {["Cart", "Shipping", "Payment"].map((s, i) => {
            const stepKeys = ["cart", "shipping", "payment"];
            const isActive = stepKeys.indexOf(step) >= i;
            return (
              <div key={s} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-xs transition-colors ${
                    isActive ? "luxury-gradient text-champagne" : "border border-border text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`font-body text-xs uppercase tracking-[0.15em] ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {s}
                  </span>
                </div>
                {i < 2 && <div className={`w-12 h-px ${isActive ? "bg-foreground" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Main */}
          <div>
            {step === "cart" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-xl font-semibold mb-6">Your Items ({items.length})</h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-5 pb-6 border-b border-border">
                      <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-24 h-32 object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="font-display text-sm font-medium mb-1 hover:text-accent transition-colors">{item.product.name}</h3>
                        </Link>
                        <p className="font-body text-xs text-muted-foreground mb-1">{item.product.fabric} · {item.product.color}</p>
                        <p className="font-body text-sm font-semibold text-accent mb-3">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center border border-border hover:border-foreground transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center border border-border hover:border-foreground transition-colors">
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

            {step === "shipping" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-xl font-semibold mb-6">Shipping Address</h2>
                <div className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">First Name</label>
                      <input type="text" className="input-luxury" placeholder="First name" />
                    </div>
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Last Name</label>
                      <input type="text" className="input-luxury" placeholder="Last name" />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Address</label>
                    <input type="text" className="input-luxury" placeholder="Street address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">City</label>
                      <input type="text" className="input-luxury" placeholder="City" />
                    </div>
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">PIN Code</label>
                      <input type="text" className="input-luxury" placeholder="PIN Code" />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Phone</label>
                    <input type="tel" className="input-luxury" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button onClick={() => setStep("cart")} className="btn-outline">Back</button>
                  <button onClick={() => setStep("payment")} className="btn-primary group">
                    Continue to Payment
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-xl font-semibold mb-6">Payment</h2>
                <div className="bg-card p-8 text-center max-w-lg">
                  <Shield size={32} strokeWidth={1} className="mx-auto text-accent mb-4" />
                  <p className="font-display text-lg mb-2">Secure Payment Gateway</p>
                  <p className="font-body text-sm text-muted-foreground mb-6">Payment integration coming soon. Connect Lovable Cloud to enable live payments.</p>
                  <button onClick={() => setStep("cart")} className="btn-outline">Back to Cart</button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-card p-6 lg:p-8">
              <h3 className="font-display text-lg font-semibold mb-6 pb-4 border-b border-border">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body text-sm">
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
                <span className="uppercase tracking-wider text-sm">Total</span>
                <span className="text-lg font-semibold">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RotateCcw, label: "Easy Returns" },
                { icon: Shield, label: "Secure" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 py-3 bg-card">
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
