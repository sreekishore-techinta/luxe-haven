import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
}

const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * width,
        behavior: "smooth"
      });
      setCurrentIndex(index);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Main Image Container - Amazon Style Scroll Snap */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative w-full aspect-[3/4] md:aspect-square bg-gray-50 rounded-2xl overflow-x-auto flex snap-x snap-mandatory hide-scrollbar group touch-pan-x"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="w-full h-full flex-shrink-0 snap-center"
          >
            <img
              src={img}
              alt={`Product view ${idx + 1}`}
              loading={idx === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover select-none"
            />
          </div>
        ))}
      </div>

      {/* Pagination Dots (Below image) */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToImage(idx)}
              className={`transition-all duration-300 rounded-full ${currentIndex === idx
                ? "bg-[#0D3B2E] w-6 h-1.5"
                : "bg-gray-200 w-1.5 h-1.5 hover:bg-gray-400"
                }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
