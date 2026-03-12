import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    initial: "P",
    text: "The quality of the silk is absolutely extraordinary. I wore the Banarasi saree to my sister's wedding and received so many compliments. Truly a masterpiece.",
    rating: 5,
    accentColor: "bg-amber-500",
  },
  {
    name: "Ananya Reddy",
    location: "Hyderabad",
    initial: "A",
    text: "Lishan Sarees' attention to detail is unmatched. The packaging felt like unwrapping a luxury gift. The Kanjivaram saree exceeded all my expectations.",
    rating: 5,
    accentColor: "bg-rose-500",
  },
  {
    name: "Meera Iyer",
    location: "Bangalore",
    initial: "M",
    text: "I've been shopping for silk sarees for years, and nothing compares to the craftsmanship here. The colors are vibrant, the weave is flawless. A true heirloom piece.",
    rating: 5,
    accentColor: "bg-emerald-600",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 luxury-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-gold/20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-transparent to-gold/20" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)`
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-gold/40" />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-gold-light/70">
              Testimonials
            </span>
            <div className="w-8 h-px bg-gold/40" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-champagne">
            What Our{" "}
            <span className="italic font-light text-gold-light">Patrons Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative bg-charcoal-light/40 backdrop-blur p-8 lg:p-10 border border-gold/10 hover:border-gold/25 transition-colors duration-500 group"
            >
              {/* Large quote mark */}
              <Quote
                size={40}
                className="text-gold/10 absolute top-6 right-6 group-hover:text-gold/20 transition-colors duration-500"
              />

              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="fill-gold text-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="font-body text-sm text-champagne/80 leading-relaxed mb-8 italic">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${t.accentColor} flex items-center justify-center text-white font-display text-sm font-semibold shrink-0`}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="font-display text-sm text-champagne">{t.name}</p>
                  <p className="font-body text-[11px] text-gold-light/50">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall rating bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-gold text-gold" />
            ))}
          </div>
          <p className="font-body text-xs text-gold-light/60 tracking-wide">
            <span className="text-champagne font-semibold text-sm">4.9/5</span>{" "}
            based on 2,400+ verified reviews
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
