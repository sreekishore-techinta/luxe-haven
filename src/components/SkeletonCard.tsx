import { motion } from "framer-motion";

const SkeletonCard = ({ index = 0 }) => {
    return (
        <div className="product-card group opacity-100 overflow-hidden">
            <div className="relative aspect-[3/4] mb-4 h-full w-full rounded-sm overflow-hidden bg-[#f3f3f3]">
                <div className="absolute inset-0 shimmer-bg" />
            </div>
            <div className="space-y-3 px-1">
                <div className="h-2 w-16 bg-[#f3f3f3] rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-bg" />
                </div>
                <div className="h-4 w-full bg-[#f3f3f3] rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-bg" />
                </div>
                <div className="h-4 w-2/3 bg-[#f3f3f3] rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-bg" />
                </div>
                <div className="flex gap-2 pt-1">
                    <div className="h-5 w-20 bg-[#f3f3f3] rounded-sm relative overflow-hidden">
                        <div className="absolute inset-0 shimmer-bg" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
