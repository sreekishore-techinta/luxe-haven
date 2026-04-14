import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check, Facebook, Twitter, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FaWhatsapp, FaPinterest, FaFacebookMessenger } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareProductProps {
  productId: string;
  productName: string;
  productImage?: string;
  className?: string;
}

const ShareProduct = ({ productId, productName, productImage, className }: ShareProductProps) => {
  const [copied, setCopied] = useState(false);
  
  // High-Fidelity Professional URL (Hostinger Production Base)
  const productionBaseUrl = "https://mediumaquamarine-gnat-559835.hostingersite.com";
  const shareUrl = `${productionBaseUrl}/product/${productId}`;
  
  const brandInfo = "Luxe Haven | Fine Handcrafted Silk Sarees & Ethnic Wear";
  const shareText = `${brandInfo}\n\nExquisite piece: ${productName}\n\n${shareUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Professional link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="w-5 h-5 text-[#25D366]" />,
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      bg: 'hover:bg-[#25D366]/10'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      bg: 'hover:bg-[#1877F2]/10'
    },
    {
      name: 'Pinterest',
      icon: <FaPinterest className="w-5 h-5 text-[#BD081C]" />,
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(productImage || '')}&description=${encodeURIComponent(shareText)}`,
      bg: 'hover:bg-[#BD081C]/10'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5 text-[#1DA1F2]" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      bg: 'hover:bg-[#1DA1F2]/10'
    },
    {
      name: 'Messenger',
      icon: <FaFacebookMessenger className="w-5 h-5 text-[#0084FF]" />,
      url: `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`,
      bg: 'hover:bg-[#0084FF]/10',
      isMessenger: true
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5 text-gray-600" />,
      url: `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      bg: 'hover:bg-gray-100'
    }
  ];

  const handleShare = (option: any) => {
      // Messenger deep link might not work on desktop, so we handle it gracefully
      if (option.isMessenger && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`, '_blank');
      } else {
          window.open(option.url, '_blank', 'noopener,noreferrer');
      }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground transition-all duration-300 group ${className}`}>
           <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Share2 size={14} className="group-hover:text-accent" />
           </motion.div>
           <span className="relative overflow-hidden group">
              Share this product
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
           </span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] p-0 bg-white border border-[#E5E5E5] rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] outline-none">
        {/* Architectural Centered Wrapper */}
        <div className="w-full px-6 sm:px-8 py-10 flex flex-col items-center">
          
          {/* Header Section */}
          <div className="w-full text-center mb-8">
             <h2 className="font-display text-2xl font-semibold text-[#1A1A1A] tracking-tight">
               Share this piece
             </h2>
             <p className="font-body text-[10px] uppercase tracking-[0.2em] font-bold text-[#B48C5E] mt-3 opacity-90">
               Invite others to admire this discovery
             </p>
          </div>
          
          {/* Social Grid - Pure Anchor Links for Maximum Compatibility */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 w-full max-w-full">
            {shareOptions.map((option) => (
              <a
                key={option.name}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (option.isMessenger && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    e.preventDefault();
                    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`, '_blank');
                  }
                }}
                className="flex flex-col items-center gap-2.5 transition-all duration-300 group/item w-full"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-[#F9F9F9] border border-transparent group-hover/item:border-[#B48C5E]/30 group-hover/item:bg-white group-hover/item:shadow-xl transition-all duration-500">
                   {option.icon}
                </div>
                <span className="font-body text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 group-hover/item:text-[#1A1A1A] transition-colors text-center truncate w-full">
                  {option.name}
                </span>
              </a>
            ))}
          </div>

          {/* Minimal Divider */}
          <div className="flex items-center gap-4 mb-6 w-full max-w-full">
             <div className="flex-1 h-px bg-[#EEEEEE]" />
             <span className="font-body text-[9px] uppercase tracking-[0.15em] text-[#1A1A1A]/30 font-bold whitespace-nowrap">Or copy link</span>
             <div className="flex-1 h-px bg-[#EEEEEE]" />
          </div>

           {/* Dedicated Row for the High-Fidelity Anchor Link */}
           <div className="w-full flex flex-col gap-4">
              <div className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl flex items-center p-1.5 focus-within:border-[#B48C5E] transition-all shadow-sm overflow-hidden">
                <a 
                  href={shareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 font-body text-[12px] text-blue-600 hover:text-blue-800 underline decoration-blue-500/40 underline-offset-4 truncate font-bold transition-all overflow-hidden min-w-0 flex items-center gap-2"
                >
                   <LinkIcon size={12} className="shrink-0" />
                   {shareUrl}
                </a>
              </div>
              
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-[#0D3B2E] text-white rounded-xl font-body text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#1A1A1A] transition-all duration-500 shadow-lg active:scale-95 group"
              >
                {copied ? (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-blue-400">
                     <Check size={14} strokeWidth={3} /> Copied to clipboard
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                     <LinkIcon size={14} strokeWidth={3} /> Copy professional link
                  </div>
                )}
              </button>
           </div>

          {/* Premium Footer Quote */}
          <div className="mt-8 text-center w-full max-w-full border-t border-[#F5F5F5] pt-6">
             <p className="font-display italic text-sm text-[#1A1A1A]/40 leading-relaxed mb-1">
               "Elegance is the only beauty that never fades."
             </p>
             <p className="font-body text-[8px] uppercase tracking-[0.15em] text-[#B48C5E]/60 font-bold text-center">
               Share the heritage
             </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProduct;
