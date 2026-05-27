import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { API_URL as API } from "@/api_config";

// Standard Order Statuses for a Premium System
const ORDER_STATUS_STEPS = [
  { id: 'placed', label: 'Order Placed', icon: Clock, description: 'We have received your luxury selection.' },
  { id: 'processing', label: 'Processing', icon: Package, description: 'Our artisans are preparing your piece for dispatch.' },
  { id: 'shipped', label: 'Shipped', icon: Truck, description: 'Your selection is on its way to your showroom.' },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Piece successfully added to your legacy.' },
];

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    
    try {
      // Connect to the actual backend tracking engine
      const response = await fetch(`${API}/public/track_order.php?order_id=${encodeURIComponent(orderId)}`);
      const json = await response.json();
      
      if (json.status === 'success') {
        setTrackingData(json.data);
      } else {
        setError(json.message || "Invalid Order ID. Please check your Reference Number.");
        setTrackingData(null);
      }
    } catch (err) {
      setError("Unable to connect to the tracking server. Please try again later.");
      console.error("Tracking Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = trackingData 
    ? ORDER_STATUS_STEPS.findIndex(s => s.id === trackingData.status)
    : -1;

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center gap-2 font-body text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-foreground">Track Order</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-8 h-px bg-accent" />
                <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">Order Integrity</span>
                <div className="w-8 h-px bg-accent" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl lg:text-5xl font-semibold mb-6 px-4">Track Your Discovery</h1>
              <p className="font-body text-xs md:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed px-4">
                Enter your unique Order Reference ID to witness the journey of your handcrafted piece from our looms to your legacy.
              </p>
            </motion.div>
          </div>

          {/* Search Bar - Center Focused */}
          <div className="mb-16">
              <form onSubmit={handleTrack} className="max-w-2xl mx-auto relative group px-2 sm:px-0">
                <input
                  type="text"
                  placeholder="Order ID (e.g. #9E4F75)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full h-14 md:h-16 lg:h-20 bg-white border-2 border-border px-6 md:px-8 pr-28 md:pr-40 font-display text-base md:text-lg focus:outline-none focus:border-accent transition-all shadow-sm rounded-xl md:rounded-2xl group-hover:shadow-xl group-hover:border-accent/20"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-3 top-2 bottom-2 px-4 md:px-10 bg-foreground text-background font-body text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold rounded-lg md:rounded-xl hover:bg-accent transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <><span className="hidden xs:inline">Track Now</span> <ArrowRight size={14} /></>
                  )}
                </button>
              </form>
             {error && (
               <motion.p 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 className="text-center mt-6 font-body text-xs text-rose-500 bg-rose-50 py-2 inline-block px-6 rounded-full mx-auto w-full max-w-sm"
               >
                 {error}
               </motion.p>
             )}
          </div>

          <AnimatePresence mode="wait">
            {trackingData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="space-y-8 lg:space-y-12"
              >
                
                {/* Visual Status Progress Bar */}
                <div className="bg-white border border-border rounded-[2.5rem] p-8 lg:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden">
                   <div className="flex flex-col lg:flex-row justify-between relative z-10 gap-10">
                      {ORDER_STATUS_STEPS.map((step, idx) => {
                         const isCompleted = idx <= currentStepIndex;
                         const isCurrent = idx === currentStepIndex;
                         
                         return (
                            <div key={step.id} className="flex-1 relative flex flex-col items-center group">
                               {/* Connecting Line */}
                               {idx < ORDER_STATUS_STEPS.length - 1 && (
                                  <div className="hidden lg:block absolute left-1/2 top-7 w-full h-[2px] bg-[#F5F5F5]">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: idx < currentStepIndex ? "100%" : "0%" }}
                                       className="h-full bg-accent transition-all duration-1000"
                                     />
                                  </div>
                               )}
                               
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-all duration-700 ${isCompleted ? 'bg-accent text-white shadow-xl shadow-accent/20 rotate-[135deg]' : 'bg-[#F9F9F9] text-muted-foreground border border-border'}`}>
                                  <div className="-rotate-[135deg]">
                                     <step.icon size={24} strokeWidth={isCurrent ? 2.5 : 1.5} />
                                  </div>
                                  {isCurrent && (
                                     <motion.div 
                                       layoutId="activeStepGlow"
                                       className="absolute inset-0 bg-accent/30 rounded-2xl animate-ping"
                                     />
                                  )}
                               </div>
                               <div className="text-center">
                                  <h3 className={`font-display text-sm font-bold mb-1 tracking-tight transition-colors ${isCompleted ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                                     {step.label}
                                  </h3>
                                  <p className="font-body text-[10px] text-muted-foreground/60 leading-relaxed max-w-[140px] mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                     {step.description}
                                  </p>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>

                {/* Details Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                   
                   {/* Summary Info */}
                   <div className="lg:col-span-2 bg-white border border-border rounded-[2rem] overflow-hidden">
                      <div className="p-8 border-b border-border bg-[#FAFAFA]/50 flex items-center justify-between">
                         <div>
                            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Order ID</p>
                            <h2 className="font-display text-xl font-bold">{trackingData.id}</h2>
                         </div>
                         <div className="text-right">
                            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Placed On</p>
                            <p className="font-body text-sm font-semibold">{trackingData.placedAt}</p>
                         </div>
                      </div>
                      
                      <div className="p-8">
                         <h4 className="font-display text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-3">Journey Logs</h4>
                         <div className="space-y-8 relative">
                             {/* Vertical Line for Logs */}
                             <div className="absolute left-1.5 top-0 bottom-0 w-[1px] bg-[#EEEEEE]" />
                             
                             {trackingData.updates.map((update: any, idx: number) => (
                                <div key={idx} className="relative pl-8 group">
                                   <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white transition-colors duration-500 ${idx === 0 ? 'bg-accent scale-125' : 'bg-[#EEEEEE]'}`} />
                                   <p className="font-body text-[10px] font-bold text-accent mb-1">{update.time}</p>
                                   <h5 className="font-display text-sm font-bold text-foreground mb-1 group-hover:translate-x-1 transition-transform">{update.title}</h5>
                                   <p className="font-body text-xs text-muted-foreground leading-relaxed">{update.desc}</p>
                                </div>
                             ))}
                         </div>
                      </div>
                   </div>

                   {/* Shipping Summary */}
                   <div className="space-y-8">
                      <div className="bg-white border border-border rounded-[2rem] p-8 shadow-sm">
                         <div className="flex items-center gap-3 mb-6">
                            <MapPin size={18} className="text-accent" />
                            <h4 className="font-display text-sm font-bold uppercase tracking-widest">Destination</h4>
                         </div>
                         <p className="font-body text-xs text-muted-foreground leading-relaxed italic">
                            {trackingData.shippingAddress}
                         </p>
                      </div>

                      <div className="bg-[#0D3B2E] text-white rounded-[2rem] p-8 shadow-2xl">
                         <p className="font-body text-[10px] uppercase tracking-[0.3em] text-accent font-black mb-4">Estimated Delivery</p>
                         <h3 className="font-display text-2xl lg:text-3xl font-bold mb-4">{trackingData.estimatedDelivery}</h3>
                         <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ x: "-100%" }}
                               animate={{ x: "0%" }}
                               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                               className="w-1/2 h-full bg-accent"
                            />
                         </div>
                         <p className="font-body text-[9px] text-white/50 mt-4 leading-relaxed font-bold uppercase tracking-widest">
                            Guaranteed by our logistics partners
                         </p>
                      </div>
                   </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Luxury Footer Help */}
          <div className="mt-20 pt-12 border-t border-border text-center">
             <p className="font-display italic text-lg text-muted-foreground/60 mb-6 font-light italic">
                Need artisan assistance with your discovery?
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="mailto:concierge@luxehaven.in" className="btn-outline px-10">Email Concierge</a>
                <a href="https://wa.me/919035065500" className="btn-gold px-10">WhatsApp Concierge</a>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
