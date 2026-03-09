import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Collections", path: "/collections" },
  { name: "New Arrivals", path: "/new-arrivals" },
  { name: "Best Sellers", path: "/best-sellers" },
  { name: "About", path: "/about" },
];

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <p className="font-body text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em]">
          Free Shipping on Orders Above ₹5,000 · Use Code FIRST500 for ₹500 Off
        </p>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="font-display text-xl lg:text-2xl font-semibold tracking-wide text-foreground">
                LUXE<span className="text-accent">DRAPE</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`font-body text-[13px] tracking-widest uppercase transition-colors duration-300 relative pb-1 ${
                      isActive
                        ? "text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-3 lg:gap-4">
              <button className="hidden sm:flex p-2 text-foreground hover:text-accent transition-colors" aria-label="Search">
                <Search size={19} />
              </button>
              <Link to="/wishlist" className="hidden sm:flex p-2 text-foreground hover:text-accent transition-colors" aria-label="Wishlist">
                <Heart size={19} />
              </Link>
              <Link to="/account" className="hidden sm:flex p-2 text-foreground hover:text-accent transition-colors" aria-label="Account">
                <User size={19} />
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-foreground hover:text-accent transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-background shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <span className="font-display text-lg font-semibold">LUXE<span className="text-accent">DRAPE</span></span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1"><X size={20} /></button>
              </div>
              <nav className="flex flex-col px-6 py-6 gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`font-body text-sm tracking-widest uppercase py-3 border-b border-border transition-colors ${
                        isActive ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-6 pt-4 flex items-center gap-6">
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                  <Heart size={16} /> Wishlist
                </Link>
                <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                  <User size={16} /> Account
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
