import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, IndianRupee, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL as API, BASE_URL } from "@/api_config";

interface SearchResult {
  id: string;
  sku: string;
  name: string;
  price: number;
  discount_price?: number;
  image: string;
  category_name?: string;
  inStock: boolean;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/public/products.php?search=${encodeURIComponent(query)}&per_page=6&show_oos=1`);
        const json = await res.json();
        if (json.status === "success") {
          setResults(json.data.map((p: any) => ({
            id: String(p.id),
            sku: p.sku,
            name: p.name,
            price: parseFloat(p.price),
            discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
            image: p.image,
            category_name: p.category_name,
            inStock: p.in_stock
          })));
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 sm:pt-32">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#FDF5E6] rounded-2xl shadow-2xl overflow-hidden border border-[#B48C5E]/20"
          >
            {/* Search Input Area */}
            <div className="p-4 sm:p-6 border-b border-[#B48C5E]/10">
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-[#B48C5E]" size={20} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products by name or code..."
                  className="w-full bg-[#B48C5E]/5 border-none rounded-xl py-4 pl-12 pr-12 text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:ring-2 focus:ring-[#B48C5E]/30 transition-all font-body text-sm"
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 p-1 rounded-full hover:bg-[#B48C5E]/10 text-[#1A1A1A]/60 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-[#B48C5E]" size={32} />
                  <p className="font-body text-xs uppercase tracking-widest text-[#B48C5E]/60 italic">Seeking masterpieces...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="p-2 sm:p-4 grid gap-2">
                  <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#B48C5E]/60 font-bold">Matching Creations</p>
                  {results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        onClose();
                      }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#B48C5E]/5 transition-all group border border-transparent hover:border-[#B48C5E]/10"
                    >
                      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-white border border-[#B48C5E]/10 flex-shrink-0">
                        <img
                          src={product.image?.startsWith('http') ? product.image : `${BASE_URL}/${product.image?.replace(/^src\//, '').replace(/^\/+/, '')}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1583391733958-650fac5ebf7f?w=200&q=80";
                          }}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[10px] uppercase tracking-widest text-[#B48C5E] mb-1 font-bold">{product.sku}</p>
                        <h3 className="font-display text-sm sm:text-base font-semibold text-[#1A1A1A] line-clamp-1 mb-1">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] uppercase tracking-tighter text-[#1A1A1A]/40">{product.category_name}</p>
                          {!product.inStock && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 font-bold uppercase tracking-tighter">Out of Stock</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-body font-bold text-[#1A1A1A]">
                            {formatPrice(product.discount_price || product.price)}
                          </span>
                          {product.discount_price && (
                            <span className="text-[10px] text-[#1A1A1A]/40 line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[#B48C5E]/5 text-[#B48C5E] opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        <ArrowRight size={18} />
                      </div>
                    </button>
                  ))}
                  <div className="p-4 mt-2">
                    <button 
                      onClick={() => {
                        navigate(`/collections?search=${encodeURIComponent(query)}`);
                        onClose();
                      }}
                      className="w-full py-4 bg-[#B48C5E] text-white rounded-xl font-body text-xs uppercase tracking-[0.2em] font-black hover:bg-[#0D3B2E] transition-all shadow-lg shadow-[#B48C5E]/20 flex items-center justify-center gap-3 group"
                    >
                      Explore All results <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : query.length >= 2 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-[#B48C5E]/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#B48C5E]/10">
                    <Search className="text-[#B48C5E]/30" size={32} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#1A1A1A] mb-2">No matching pieces found</h3>
                  <p className="font-body text-xs text-[#1A1A1A]/50 max-w-[240px] mx-auto leading-relaxed">
                    We couldn't find any creations matching "<span className="text-[#1A1A1A] font-bold italic">{query}</span>". 
                    Try adjusting your search terms.
                  </p>
                </div>
              ) : (
                <div className="p-16 text-center">
                   <p className="font-body text-xs text-[#1A1A1A]/40 italic uppercase tracking-widest">
                     Type at least 2 characters to discover...
                   </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
