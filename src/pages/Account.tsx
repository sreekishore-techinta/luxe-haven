import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Package, Heart, MapPin, LogOut, ChevronRight, ShoppingBag } from "lucide-react";
import PageHeroBanner from "@/components/PageHeroBanner";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
];

const Account = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div>
      <PageHeroBanner title="My Account" subtitle="Welcome Back" />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-body text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-card text-foreground border-l-2 border-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <tab.icon size={16} />
                <span className="tracking-wide">{tab.label}</span>
                <ChevronRight size={14} className="ml-auto opacity-40" />
              </button>
            ))}
            <button className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm text-muted-foreground hover:text-destructive transition-colors mt-4">
              <LogOut size={16} />
              <span className="tracking-wide">Sign Out</span>
            </button>
          </motion.aside>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "profile" && (
              <div className="max-w-lg">
                <h2 className="font-display text-2xl font-semibold mb-6">Personal Information</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">First Name</label>
                      <input type="text" placeholder="Enter first name" className="input-luxury" />
                    </div>
                    <div>
                      <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Last Name</label>
                      <input type="text" placeholder="Enter last name" className="input-luxury" />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Email</label>
                    <input type="email" placeholder="your@email.com" className="input-luxury" />
                  </div>
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Phone</label>
                    <input type="tel" placeholder="+91 XXXXX XXXXX" className="input-luxury" />
                  </div>
                  <button className="btn-primary mt-4">Save Changes</button>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">Order History</h2>
                <div className="flex flex-col items-center justify-center py-16 text-center bg-card">
                  <ShoppingBag size={48} strokeWidth={1} className="text-muted-foreground/30 mb-4" />
                  <p className="font-display text-lg mb-2">No orders yet</p>
                  <p className="font-body text-sm text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                  <Link to="/collections" className="btn-gold">Browse Collections</Link>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">My Wishlist</h2>
                <div className="flex flex-col items-center justify-center py-16 text-center bg-card">
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
                <div className="flex flex-col items-center justify-center py-16 text-center bg-card">
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
