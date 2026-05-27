import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Heart, ChevronDown, ArrowRight, Package, LogOut, Search, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import SearchModal from "./SearchModal";
import logoLishan from "@/assets/ChatGPT_Image_Apr_17__2026__10_32_57_AM-removebg-preview copy 2.png";
import { API_URL as API } from "@/api_config";

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlisted } = useWishlist();
  const { customer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [sareeTypes, setSareeTypes] = useState<any[]>([]);
  const [isSareesOpen, setIsSareesOpen] = useState(false);
  const [isSuitsOpen, setIsSuitsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
          
          // Fallback: If sareeTypes is still empty or to supplement it, 
          // find saree-related categories from master_categories
          const sareeCats = json.data
            .filter((cat: any) => 
              cat.name.toLowerCase().includes('saree') && 
              cat.name.toLowerCase() !== 'sarees' &&
              cat.show_on_menu == 1
            )
            .map((cat: any) => ({
              id: `cat-${cat.id}`,
              name: cat.name,
              slug: cat.slug,
              isFromMaster: true
            }));
            
          setSareeTypes(prev => {
            const merged = [...prev, ...sareeCats];
            const seen = new Set();
            return merged.filter(item => {
              const key = item.name.toLowerCase().trim();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
        }
      })
      .catch(err => console.error("Failed to fetch nav categories", err));

    fetch(`${API}/public/saree_types.php`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          const fetchedTypes = json.data.map((item: any) => ({
            ...item,
            isFromSareeTypes: true
          }));
          
          setSareeTypes(prev => {
            const merged = [...fetchedTypes, ...prev];
            const seen = new Set();
            return merged.filter(item => {
              const key = item.name.toLowerCase().trim();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
        }
      })
      .catch(err => console.error("Failed to fetch saree types", err));
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#FDFBF7] shadow-sm border-b border-[#B48C5E]/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-24 lg:h-28 py-4 gap-6 lg:gap-12">

            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300"
            >
              {/* Logo Icon (Cropped Square) */}
              <div className="w-[65px] h-[65px] md:w-[75px] md:h-[75px] flex-shrink-0 overflow-hidden relative rounded-xl border border-[#B48C5E]/20 shadow-lg bg-[#2C1810]">
                <img
                  src={logoLishan}
                  alt="Lishan"
                  className="absolute top-0 left-0 w-full h-auto object-cover scale-[1.05]"
                  style={{ objectPosition: 'center 0px' }}
                />
              </div>

              {/* Enhanced Brand Text based on Reference */}
              <div className="flex flex-col items-center">
                <span 
                  className="font-display text-[28px] md:text-[36px] lg:text-[42px] font-bold text-[#2C1810] tracking-tight leading-none"
                  style={{ textShadow: '1px 1.5px 0.5px rgba(0,0,0,0.2)' }}
                >
                  Lishan
                </span>
                
                <div className="flex items-center gap-3 w-full mt-1.5 md:mt-2">
                  <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-[#B48C5E] to-[#B48C5E] relative flex items-center justify-end">
                    <span className="text-[#B48C5E] text-[6px] md:text-[8px] absolute -right-[2px]">✦</span>
                  </div>
                  
                  <span className="font-body text-[8px] md:text-[11px] font-bold text-[#B48C5E] uppercase tracking-[0.5em] whitespace-nowrap px-1">
                    Sarees
                  </span>
                  
                  <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent via-[#B48C5E] to-[#B48C5E] relative flex items-center justify-start">
                    <span className="text-[#B48C5E] text-[6px] md:text-[8px] absolute -left-[2px]">✦</span>
                  </div>
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {staticLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-[11px] xl:text-[12px] font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/90 hover:text-[#B48C5E] transition-all duration-300"
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
                  className={`flex items-center gap-1.5 text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${isSareesOpen ? "text-[#B48C5E]" : "text-[#1A1A1A]"
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
                        background: "#FDF5E6",
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
                            to={sub.isFromMaster ? `/category/${sub.slug}` : `/sarees/${sub.slug}`}
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
                            <span style={{ fontWeight: 700, fontSize: "14px", color: "#1A1A1A", lineHeight: 1.2, textTransform: "capitalize", letterSpacing: "0.5px" }}>
                              {sub.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Suits and Sets Mega Menu Toggle */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setIsSuitsOpen(true)}
                onMouseLeave={() => setIsSuitsOpen(false)}
              >
                <Link
                  to="/suit-sets"
                  className={`flex items-center gap-1.5 text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${isSuitsOpen ? "text-[#B48C5E]" : "text-[#1A1A1A]"
                    }`}
                >
                  Suits & Sets
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isSuitsOpen ? "rotate-180" : ""}`} />
                </Link>

                <AnimatePresence>
                  {isSuitsOpen && (
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
                        background: "#FDF5E6",
                        borderRadius: "12px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                        padding: "12px",
                        width: "240px",
                        border: "1px solid rgba(180,140,94,0.2)",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {[
                          { name: "All Suits & Sets", slug: "suit-sets", path: "/suit-sets" },
                          { name: "Ready Made", slug: "ready-made", path: "/category/ready-made" },
                          { name: "Materials", slug: "materials", path: "/category/materials" }
                        ].map((sub) => (
                           <Link
                             key={sub.slug}
                             to={sub.path}
                             style={{
                               display: "flex",
                               alignItems: "center",
                               gap: "10px",
                               padding: "12px 16px",
                               background: "rgba(255,255,255,0.06)",
                               border: "1px solid rgba(180,140,94,0.1)",
                               borderRadius: "8px",
                               textDecoration: "none",
                               transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                               cursor: "pointer",
                             }}
                             onMouseEnter={e => {
                               const el = e.currentTarget;
                               el.style.background = "rgba(180,140,94,0.15)";
                               el.style.borderColor = "#B48C5E";
                             }}
                             onMouseLeave={e => {
                               const el = e.currentTarget;
                               el.style.background = "rgba(255,255,255,0.06)";
                               el.style.borderColor = "rgba(180,140,94,0.1)";
                             }}
                           >
                             <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#B48C5E", display: "block" }} />
                             <span style={{ fontWeight: 700, fontSize: "12px", color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "1px" }}>
                               {sub.name}
                             </span>
                           </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {categories.filter((c: any) => c.show_on_menu == 1 && !['sarees', 'new arrivals', 'lishan sarees', 'suits and sets', 'ready made', 'materials'].includes(c.name.toLowerCase()) && !c.name.toLowerCase().includes('saree')).map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]/90 hover:text-[#B48C5E] transition-all duration-300"
                >
                  {cat.name}
                </Link>
              ))}

            </nav>

            <div className="flex items-center gap-4 lg:gap-8">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group p-1 relative hover:text-[#B48C5E] transition-colors"
                aria-label="Search"
              >
                <Search size={22} className="text-[#1A1A1A]/90 group-hover:text-[#B48C5E] transition-colors" />
              </button>

              <Link to="/wishlist" className="relative group p-1 hidden sm:block">
                <Heart size={24} className="text-[#1A1A1A]/90 group-hover:text-[#B48C5E] transition-colors" />
                {totalWishlisted > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#B48C5E] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#FDF5E6]">
                    {totalWishlisted}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open Shopping Bag"
                className="relative bg-[#1A1A1A]/5 p-3 rounded-full hover:bg-[#B48C5E]/10 group transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ShoppingBag size={22} className="text-[#1A1A1A]/90 group-hover:text-[#B48C5E] transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#B48C5E] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>
                )}
              </button>

              <div 
                className="relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <Link to="/account" className="flex items-center gap-2 group p-1">
                  <User size={24} className="text-[#1A1A1A]/90 group-hover:text-[#B48C5E] transition-colors" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] font-light text-[#1A1A1A]/50 leading-tight">
                      {customer ? "Welcome back," : "Welcome"}
                    </span>
                    <span className="text-[11px] font-medium text-[#1A1A1A] group-hover:text-[#B48C5E] transition-colors whitespace-nowrap">
                      {customer ? customer.name.split(" ")[0] : "Sign in / Register"}
                    </span>
                  </div>
                </Link>

                <AnimatePresence>
                  {isProfileOpen && customer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full pt-2 w-48 z-50"
                    >
                      <div className="bg-[#FDF5E6] border border-[#B48C5E]/20 rounded-xl shadow-xl overflow-hidden py-2">
                        <Link 
                          to="/account" 
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#B48C5E]/10 hover:text-[#B48C5E] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User size={14} /> My Profile
                        </Link>
                        <Link 
                          to="/account?tab=orders" 
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#B48C5E]/10 hover:text-[#B48C5E] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Package size={14} /> My Orders
                        </Link>
                        <Link 
                          to="/track-order" 
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#B48C5E]/10 hover:text-[#B48C5E] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Truck size={14} /> Track Order
                        </Link>
                        <div className="h-px bg-[#B48C5E]/10 my-1 mx-2" />
                        <button 
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Mobile Menu"
                className="lg:hidden p-2 text-[#1A1A1A] min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4"
                >
                  <div className="w-[50px] h-[50px] overflow-hidden relative rounded-lg border border-[#B48C5E]/10 bg-[#2C1810]">
                    <img 
                      src={logoLishan} 
                      alt="Lishan" 
                      className="absolute top-0 left-0 w-full h-auto object-cover scale-[1.05]" 
                      style={{ objectPosition: 'center 0px' }}
                    />
                  </div>
                  <div className="flex flex-col items-center leading-none">
                    <span className="font-display text-[24px] font-bold text-[#2C1810]">Lishan</span>
                    <div className="flex items-center gap-2 w-full mt-1">
                      <div className="h-[0.5px] flex-grow bg-[#B48C5E]/50" />
                      <span className="font-body text-[8px] font-bold text-[#B48C5E] uppercase tracking-[0.3em]">Sarees</span>
                      <div className="h-[0.5px] flex-grow bg-[#B48C5E]/50" />
                    </div>
                  </div>
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
                          to={sub.isFromMaster ? `/category/${sub.slug}` : `/sarees/${sub.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[11px] font-medium text-gray-500 uppercase tracking-widest hover:text-[#B48C5E] transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="space-y-4">
                      <Link
                        to="/suit-sets"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-900 flex items-center justify-between"
                      >
                        Suits & Sets
                        <ArrowRight size={14} className="text-[#B48C5E]" />
                      </Link>
                      <div className="pl-4 grid grid-cols-1 gap-4 border-l-2 border-[#B48C5E]/20 ml-2">
                        {[
                          { name: "Ready Made", slug: "ready-made", path: "/category/ready-made" },
                          { name: "Materials", slug: "materials", path: "/category/materials" }
                        ].map((sub: any) => (
                          <Link
                            key={sub.slug}
                            to={sub.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-[11px] font-medium text-gray-500 uppercase tracking-widest hover:text-[#B48C5E] transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    {categories.filter((c: any) => c.show_on_menu == 1 && !['sarees', 'new arrivals', 'lishan sarees', 'suits and sets', 'ready made', 'materials'].includes(c.name.toLowerCase()) && !c.name.toLowerCase().includes('saree')).map((cat: any) => (
                      <div key={cat.id} className="space-y-4">
                        <Link
                          to={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-900 flex items-center justify-between"
                        >
                          {cat.name}
                          <ArrowRight size={14} className="text-[#B48C5E]" />
                        </Link>
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
                  <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 py-2 text-sm text-gray-700 font-medium min-h-[44px]">
                    <Truck size={20} className="text-gray-400 group-hover:text-[#B48C5E]" /> Track Order
                  </Link>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 py-2 text-sm text-gray-700 font-medium min-h-[44px]">
                    <User size={20} className="text-gray-400" /> {customer ? "My Profile" : "Login / Register"}
                  </Link>
                  {customer && (
                    <button 
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-4 py-2 text-sm text-rose-600 font-medium min-h-[44px]"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
