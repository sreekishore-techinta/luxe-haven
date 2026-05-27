import { motion } from "framer-motion";

const SkeletonCard = ({ index = 0 }) => {
    return (
        <div className="group relative flex flex-col h-full bg-white rounded-3xl p-2.5 border border-[#0D3B2E]/5">
            <div className="relative aspect-[3.2/4] mb-3 h-full w-full rounded-2xl overflow-hidden bg-[#f8f9fa]">
                <div className="absolute inset-0 shimmer-bg" />
            </div>
            <div className="space-y-2 px-2 pb-2">
                <div className="h-2 w-16 bg-[#f3f3f3] rounded-full mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-bg" />
                </div>
                <div className="h-4 w-full bg-[#f3f3f3] rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-bg" />
                </div>
                <div className="h-3 w-1/2 bg-[#f3f3f3] rounded-full mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-bg" />
                </div>
                <div className="pt-2 flex flex-col items-center gap-2">
                    <div className="h-4 w-20 bg-[#f3f3f3] rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 shimmer-bg" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
