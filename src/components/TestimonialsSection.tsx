import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "The quality of the silk is absolutely extraordinary. I wore the Banarasi saree to my sister's wedding and received so many compliments. Truly a masterpiece.",
    rating: 5,
  },
  {
    name: "Ananya Reddy",
    location: "Hyderabad",
    text: "LuxeDrape's attention to detail is unmatched. The packaging felt like unwrapping a luxury gift. The Kanjivaram saree exceeded all my expectations.",
    rating: 5,
  },
  {
    name: "Meera Iyer",
    location: "Bangalore",
    text: "I've been shopping for silk sarees for years, and nothing compares to the craftsmanship here. The colors are vibrant, the weave is flawless. A true heirloom piece.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 lg:py-28 luxury-gradient">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-gold/40" />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase text-gold-light/70">Testimonials</span>
            <div className="w-8 h-px bg-gold/40" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-champagne">
            What Our Patrons Say
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
              className="bg-charcoal-light/50 backdrop-blur p-8 lg:p-10 border border-gold/10"
            >
              <Quote size={24} className="text-gold/30 mb-4" />
              <p className="font-body text-sm text-champagne/80 leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={12} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="font-display text-sm text-champagne">{t.name}</p>
              <p className="font-body text-[11px] text-gold-light/50">{t.location}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
