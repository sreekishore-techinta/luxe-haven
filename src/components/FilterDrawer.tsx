import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { fabricTypes as fabricFilters } from "@/data/products";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

interface FilterDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  fabricFilter: string;
  onFabricChange: (value: string) => void;
  resultCount?: number;
}

export default function FilterDrawer({
  isOpen,
  onOpen,
  onClose,
  sortBy,
  onSortChange,
  fabricFilter,
  onFabricChange,
  resultCount,
}: FilterDrawerProps) {
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={onOpen}
        className="flex items-center gap-3 bg-white px-8 py-4 rounded-full border border-[#041E18]/5 shadow-sm hover:shadow-md transition-all group"
      >
        <SlidersHorizontal size={14} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#041E18]">Open Filter</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] opacity-50" />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#FBFAF7] z-[101] shadow-2xl p-10 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-black text-[#041E18] tracking-tight">Fine Filters</h2>
                  <div className="h-1 w-12 bg-[#D4AF37]" />
                  {resultCount !== undefined && (
                    <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest pt-1">
                      {resultCount} pieces found
                    </p>
                  )}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-[#041E18]/5 rounded-full transition-colors">
                  <X size={24} className="text-[#041E18]" />
                </button>
              </div>

              {/* Filter Sections */}
              <div className="flex-1 space-y-12 overflow-y-auto pr-2">
                {/* Sort */}
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Sort Collections</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onSortChange(opt.value)}
                        className={`text-left px-6 py-4 rounded-2xl text-[11px] font-bold tracking-wide transition-all border ${
                          sortBy === opt.value
                            ? "bg-[#041E18] text-white border-[#041E18]"
                            : "bg-white text-[#041E18] border-[#041E18]/5 hover:border-[#D4AF37]/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Fabric */}
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Select Fabric</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {fabricFilters.map((fabric) => (
                      <button
                        key={fabric}
                        onClick={() => onFabricChange(fabric)}
                        className={`text-left px-4 py-3 rounded-xl text-[10px] font-bold tracking-wide transition-all border ${
                          fabricFilter === fabric
                            ? "bg-[#D4AF37] text-white border-[#D4AF37]"
                            : "bg-white text-[#041E18] border-[#041E18]/5 hover:border-[#D4AF37]/40"
                        }`}
                      >
                        {fabric}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Apply Button */}
              <div className="pt-10 border-t border-[#041E18]/5 flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full bg-[#041E18] text-white py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-[#041E18]/20"
                >
                  Apply Filter
                </button>
                {(fabricFilter !== "All" || sortBy !== "featured") && (
                  <button
                    onClick={() => { onFabricChange("All"); onSortChange("featured"); }}
                    className="w-full bg-transparent text-[#041E18]/40 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#041E18] transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
