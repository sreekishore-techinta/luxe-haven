import { Home, Search, Heart, User, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { totalWishlisted } = useWishlist();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Explore", path: "/collections" },
    { icon: Heart, label: "Wishlist", path: "/wishlist", badge: totalWishlisted },
    { icon: ShoppingBag, label: "Cart", path: "/cart", badge: totalItems },
    { icon: User, label: "Account", path: "/account" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-3 pb-8 safe-area-bottom shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 group"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-[#0D3B2E] text-white shadow-lg shadow-[#0D3B2E]/20 scale-110' : 'text-gray-400 group-hover:text-gray-900 group-active:scale-90'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                
                {/* Badge */}
                <AnimatePresence>
                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-white shadow-sm ${isActive ? 'bg-[#B48C5E] text-white' : 'bg-rose-500 text-white'}`}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              
              <span className={`text-[9px] font-bold uppercase tracking-tighter transition-all duration-300 ${isActive ? 'text-[#0D3B2E] opacity-100 scale-100' : 'text-gray-400 opacity-0 scale-75'}`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#0D3B2E]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
