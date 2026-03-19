import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Heart, ChevronDown, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import logoLishan from "@/assets/logo lishan saree.png";

const API = "http://localhost/luxe-haven/api";

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlisted } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [sareeTypes, setSareeTypes] = useState<any[]>([]);
  const [isSareesOpen, setIsSareesOpen] = useState(false);
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

    fetch(`${API}/public/saree_types.php`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          setSareeTypes(json.data);
        }
      })
      .catch(err => console.error("Failed to fetch saree types", err));

    // Check session
    fetch(`${API}/auth/customer_check.php`, { credentials: "include" })
      .then(r => r.json())
      .then(json => {
        if (json.loggedIn) setCustomer(json.customer);
      });
  }, []);

  const sareeCategory = categories.find(c => c.id == 1 || c.name.toLowerCase() === 'sarees');

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

              {/* Sarees Mega Menu Toggle */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setIsSareesOpen(true)}
                onMouseLeave={() => setIsSareesOpen(false)}
              >
                <Link
                  to="/sarees"
                  className={`flex items-center gap-1.5 text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${isSareesOpen ? "text-[#B48C5E]" : "text-white"
                    }`}
                >
                  Sarees
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isSareesOpen ? "rotate-180" : ""}`} />
                </Link>

                <AnimatePresence>
                  {isSareesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 15px)",
                        left: "0",
                        zIndex: 999,
                        background: "#0D3B2E",
                        borderRadius: "12px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                        padding: "12px",
                        width: "320px",
                        border: "1px solid rgba(180,140,94,0.2)",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                        {sareeTypes.map((sub: any) => (
                          <Link
                            key={sub.id}
                            to={`/sarees/${sub.slug}`}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "4px",
                              padding: "14px 16px",
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(180,140,94,0.15)",
                              borderRadius: "10px",
                              textDecoration: "none",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                              minHeight: "70px",
                              justifyContent: "center"
                            }}
                            onMouseEnter={e => {
                              const el = e.currentTarget;
                              el.style.background = "rgba(180,140,94,0.15)";
                              el.style.borderColor = "#B48C5E";
                              el.style.transform = "translateY(-2px)";
                              el.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget;
                              el.style.background = "rgba(255,255,255,0.06)";
                              el.style.borderColor = "rgba(180,140,94,0.15)";
                              el.style.transform = "translateY(0)";
                              el.style.boxShadow = "none";
                            }}
                          >
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#B48C5E", display: "block", marginBottom: "4px" }} />
                            <span style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff", lineHeight: 1.2, textTransform: "capitalize", letterSpacing: "0.5px" }}>
                              {sub.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                        top: "calc(100% + 15px)",
                        left: "0",
                        zIndex: 999,
                        background: "#0D3B2E",
                        borderRadius: "12px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                        padding: "12px",
                        width: "320px",
                        border: "1px solid rgba(180,140,94,0.2)",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      {/* Category cards grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                        {(categories && categories.length > 0 ? categories : [
                          { id: 1, name: "Blouses", slug: "blouses" },
                          { id: 2, name: "Sarees", slug: "sarees" },
                          { id: 3, name: "Suit Sets", slug: "suit-sets" },
                          { id: 4, name: "New Arrivals", slug: "new-arrivals" }
                        ]).map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.slug}`}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "4px",
                              padding: "14px 16px",
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(180,140,94,0.15)",
                              borderRadius: "10px",
                              textDecoration: "none",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                              minHeight: "70px",
                              justifyContent: "center"
                            }}
                            onMouseEnter={e => {
                              const el = e.currentTarget;
                              el.style.background = "rgba(180,140,94,0.15)";
                              el.style.borderColor = "#B48C5E";
                              el.style.transform = "translateY(-2px)";
                              el.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget;
                              el.style.background = "rgba(255,255,255,0.06)";
                              el.style.borderColor = "rgba(180,140,94,0.15)";
                              el.style.transform = "translateY(0)";
                              el.style.boxShadow = "none";
                            }}
                          >
                            {/* Gold dot accent */}
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#B48C5E", display: "block", marginBottom: "4px" }} />
                            {/* Category name */}
                            <span style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff", lineHeight: 1.2, textTransform: "capitalize", letterSpacing: "0.5px" }}>
                              {cat.name}
                            </span>
                            {/* Tagline */}
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontStyle: "italic", letterSpacing: "0.2px" }}>
                              {cat.sub_categories?.length ? `${cat.sub_categories.length} Collections` : "New arrivals soon"}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </nav>

            <div className="flex items-center gap-4 lg:gap-8">
              <Link to="/wishlist" className="relative group p-1 hidden sm:block">
                <Heart size={24} className="text-white/90 group-hover:text-[#B48C5E] transition-colors" />
                {totalWishlisted > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#B48C5E] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#0D3B2E]">
                    {totalWishlisted}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open Shopping Bag"
                className="relative bg-white/10 p-3 rounded-full hover:bg-[#B48C5E]/20 group transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                aria-label="Toggle Mobile Menu"
                className="lg:hidden p-2 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="px-6 py-8 space-y-8 pb-32">
                <nav className="flex flex-col gap-6">
                  {staticLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[12px] font-bold tracking-[0.2em] uppercase text-gray-900 hover:text-[#B48C5E] transition-colors py-1"
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    <Link
                      to="/sarees"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-900 flex items-center justify-between"
                    >
                      Sarees
                      <ArrowRight size={14} className="text-[#B48C5E]" />
                    </Link>
                    <div className="pl-4 grid grid-cols-1 gap-4">
                      {sareeTypes.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={`/sarees/${sub.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[11px] font-medium text-gray-500 uppercase tracking-widest hover:text-[#B48C5E] transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B48C5E]">Shop by Categories</p>
                    {categories.map((cat) => (
                      <div key={cat.id} className="space-y-4">
                        <Link
                          to={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-900 flex items-center justify-between"
                        >
                          {cat.name}
                          <ArrowRight size={14} className="text-gray-300" />
                        </Link>
                        {cat.sub_categories?.length > 0 && (
                          <div className="pl-4 grid grid-cols-1 gap-3">
                            {cat.sub_categories.map((sub: any) => (
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
                        )}
                      </div>
                    ))}
                  </div>
                </nav>

                <div className="pt-8 border-t border-gray-100 flex flex-col gap-8">
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900">Our Story</Link>
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-2 text-sm text-gray-700 font-medium group min-h-[44px]">
                    <div className="flex items-center gap-4">
                      <Heart size={20} className="group-hover:text-[#B48C5E] transition-colors" />
                      My Wishlist
                    </div>
                    {totalWishlisted > 0 && (
                      <span className="bg-[#B48C5E] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {totalWishlisted}
                      </span>
                    )}
                  </Link>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 py-2 text-sm text-gray-700 font-medium min-h-[44px]">
                    <User size={20} /> {customer ? "My Profile" : "Login / Register"}
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


