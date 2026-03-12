import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Award, Heart, Sparkles, Globe } from "lucide-react";

const stats = [
    { icon: Award, value: 15, suffix: "+", label: "Years of Craft Excellence" },
    { icon: Heart, value: 50000, suffix: "+", label: "Happy Customers Worldwide" },
    { icon: Sparkles, value: 1200, suffix: "+", label: "Handcrafted Designs" },
    { icon: Globe, value: 30, suffix: "+", label: "Cities We Deliver To" },
];

function useCounter(target: number, duration: number = 2000, start: boolean = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target, duration, start]);
    return count;
}

const StatCard = ({ stat, index }: { stat: typeof stats[0]; index: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const count = useCounter(stat.value, 2000, isInView);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.12 }}
            className="relative flex flex-col items-center text-center group"
        >
            {/* Icon ring */}
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors duration-500">
                    <stat.icon size={24} strokeWidth={1.2} className="text-gold" />
                </div>
                <div className="absolute inset-0 rounded-full border border-gold/10 scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700" />
            </div>

            <div className="mb-2">
                <span className="font-display text-4xl lg:text-5xl font-semibold text-foreground tabular-nums">
                    {count.toLocaleString("en-IN")}
                </span>
                <span className="font-display text-3xl lg:text-4xl font-light text-accent">
                    {stat.suffix}
                </span>
            </div>

            <p className="font-body text-xs text-muted-foreground tracking-wide max-w-[130px] leading-relaxed">
                {stat.label}
            </p>
        </motion.div>
    );
};

const HeritageBand = () => {
    return (
        <section className="py-16 bg-card border-y border-border">
            <div className="container mx-auto px-4 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="w-8 h-px bg-accent" />
                        <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">
                            Our Legacy
                        </span>
                        <div className="w-8 h-px bg-accent" />
                    </div>
                    <h2 className="font-display text-3xl lg:text-4xl font-semibold">
                        Woven with{" "}
                        <span className="italic font-light text-accent">Purpose</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
                    {stats.map((stat, i) => (
                        <StatCard key={stat.label} stat={stat} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeritageBand;
