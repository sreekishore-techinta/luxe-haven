import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Heart, ChevronDown, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import logoLishan from "@/assets/logo lishan saree.png";

const API = "http://localhost:8000";

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [customer, setCustomer] = useState<{ name: string } | null>(null);

  const staticLinks = [
    { name: "Home", path: "/" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "Best Sellers", path: "/best-sellers" },
  ];

  useEffect(() => {
    fetch(`${API}/public/nav_categories.php`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          setCategories(json.data);
        }
      })
      .catch(err => console.error("Failed to fetch nav categories", err));

    // Check session
    fetch(`${API}/auth/customer_check.php`, { credentials: "include" })
      .then(r => r.json())
      .then(json => {
        if (json.loggedIn) setCustomer(json.customer);
      });
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0D3B2E] shadow-sm border-b border-white/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24 py-4 gap-6 lg:gap-12">

            <Link to="/" className="flex-shrink-0 min-w-max">
              <img
                src={logoLishan}
                alt="Lishan Sarees"
                className="h-14 md:h-16 lg:h-20 w-auto object-contain brightness-[1.2] contrast-[1.1] drop-shadow-sm invert-[0.1]"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {staticLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-[11px] xl:text-[12px] font-medium uppercase tracking-[0.12em] text-white/90 hover:text-[#B48C5E] transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}

              {/* Categories Mega Menu Toggle */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <button
                  className={`flex items-center gap-1.5 text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${isCategoriesOpen ? "text-[#B48C5E]" : "text-white"
                    }`}
                >
                  Categories
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isCategoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {isCategoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 12px)",
                        left: "0",
                        zIndex: 999,
                        background: "#0D3B2E",
                        borderRadius: "16px",
                        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
                        padding: "24px",
                        width: "480px",
                        border: "1px solid rgba(180,140,94,0.2)",
                      }}
                    >
                      {/* Decorative top accent */}
                      <div style={{ marginBottom: "24px", borderBottom: "1px solid rgba(180,140,94,0.2)", paddingBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "28px", height: "2px", background: "#B48C5E" }} />
                        <span style={{ fontSize: "10px", color: "#B48C5E", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600 }}>Shop By Category</span>
                        <div style={{ width: "28px", height: "2px", background: "#B48C5E" }} />
                      </div>

                      {/* Category cards grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/collections?category=${encodeURIComponent(cat.name)}`}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "6px",
                              padding: "14px 14px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(180,140,94,0.25)",
                              borderRadius: "10px",
                              textDecoration: "none",
                              transition: "all 0.25s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={e => {
                              const el = e.currentTarget;
                              el.style.background = "rgba(180,140,94,0.15)";
                              el.style.borderColor = "#B48C5E";
                              el.style.transform = "translateY(-3px)";
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget;
                              el.style.background = "rgba(255,255,255,0.05)";
                              el.style.borderColor = "rgba(180,140,94,0.25)";
                              el.style.transform = "translateY(0)";
                            }}
                          >
                            {/* Gold dot accent */}
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#B48C5E", display: "block", flexShrink: 0 }} />
                            {/* Category name bold */}
                            <span style={{ fontWeight: 700, fontSize: "15px", color: "#ffffff", lineHeight: 1.3, textTransform: "capitalize" }}>
                              {cat.name}
                            </span>
                            {/* Subcategories or tagline */}
                            {cat.sub_categories?.length > 0 ? (
                              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                                {cat.sub_categories.length} collection{cat.sub_categories.length !== 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                                New arrivals soon
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>

                      {/* Footer */}
                      <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(180,140,94,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "2.5px", textTransform: "uppercase" }}>
                          Discover Our Curated Craftsmanship
                        </p>
                        <Link
                          to="/collections"
                          style={{ fontSize: "11px", fontWeight: 700, color: "#B48C5E", textTransform: "uppercase", letterSpacing: "1.5px", textDecoration: "none", borderBottom: "1px solid rgba(180,140,94,0.4)", paddingBottom: "2px" }}
                        >
                          View All Collections
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dynamic Categories as single links (only first 3 or specific ones if needed) */}
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/collections?category=${encodeURIComponent(cat.name)}`}
                  className="hidden xl:block text-[11px] font-medium uppercase tracking-[0.12em] text-white/70 hover:text-[#B48C5E] transition-all duration-300"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4 lg:gap-8">
              <Link to="/wishlist" className="relative group p-1 hidden sm:block">
                <Heart size={24} className="text-white/90 group-hover:text-[#B48C5E] transition-colors" />
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#B48C5E] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#0D3B2E]">0</span>
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-white/10 p-3 rounded-full hover:bg-[#B48C5E]/20 group transition-all duration-300"
              >
                <ShoppingBag size={22} className="text-white/90 group-hover:text-[#B48C5E] transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#B48C5E] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>
                )}
              </button>

              <Link to="/account" className="flex items-center gap-2 group p-1">
                <User size={24} className="text-white/90 group-hover:text-[#B48C5E] transition-colors" />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] font-light text-white/50 leading-tight">
                    {customer ? "Welcome back," : "Welcome"}
                  </span>
                  <span className="text-[11px] font-medium text-white group-hover:text-[#B48C5E] transition-colors whitespace-nowrap">
                    {customer ? customer.name.split(" ")[0] : "Sign in / Register"}
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-80 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <img src={logoLishan} alt="Lishan Sarees" className="h-14 w-auto object-contain" />
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="px-6 py-8 space-y-8">
                <nav className="flex flex-col gap-6">
                  {staticLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold tracking-widest uppercase text-gray-900"
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="space-y-6 pt-4 border-t border-gray-50">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B48C5E]">Shop by Categories</p>
                    {categories.map((cat) => (
                      <div key={cat.id} className="space-y-4">
                        <Link
                          to={`/collections?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs font-bold uppercase text-gray-800 flex items-center justify-between"
                        >
                          {cat.name}
                          <ArrowRight size={14} className="text-gray-300" />
                        </Link>
                        <div className="pl-4 flex flex-col gap-3">
                          {cat.sub_categories?.map((sub: any) => (
                            <Link
                              key={sub.id}
                              to={`/collections?category=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub.name)}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-[11px] font-medium text-gray-500 uppercase tracking-widest"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </nav>

                <div className="pt-8 border-t border-gray-100 flex flex-col gap-6">
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Our Story</Link>
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <Heart size={18} /> My Wishlist
                  </Link>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <User size={18} /> My Account
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;


