import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Award, Users, MapPin } from "lucide-react";
import PageHeroBanner from "@/components/PageHeroBanner";
import heroImage2 from "@/assets/new-arrivals-hero-2.jpg";
import heroImage from "@/assets/new-arrivals-hero.jpg";

const values = [
  { icon: Heart, title: "Passion for Craft", desc: "Every piece we curate is a labor of love, celebrating the artisans who pour their soul into each weave." },
  { icon: Award, title: "Uncompromising Quality", desc: "We source only the finest silks and ensure every saree meets our exacting standards before reaching you." },
  { icon: Users, title: "Empowering Artisans", desc: "We work directly with weaver communities, ensuring fair wages and sustaining traditional livelihoods." },
  { icon: MapPin, title: "Heritage Preservation", desc: "By promoting handloom textiles, we help preserve India's centuries-old weaving traditions for future generations." },
];

const About = () => {
  return (
    <div>
      <PageHeroBanner
        title="Our Story"
        subtitle="About LuxeDrape"
        description="Born from a love for India's textile heritage, LuxeDrape bridges the gap between master artisans and those who appreciate the art of fine silk."
        backgroundImage={heroImage}
      />

      {/* Mission */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-0 items-stretch overflow-hidden">
            <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
              <motion.img
                initial={{ opacity: 0, scale: 1.05 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                src={heroImage2}
                alt="Handcrafted luxury textiles"
                className="w-full h-full object-cover"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center bg-card p-10 lg:p-16 xl:p-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-accent" />
                <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">Our Mission</span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-6 leading-[1.1]">
                Weaving Dreams,
                <br />
                <span className="italic font-light">One Thread at a Time</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                Founded in 2020, Lishan Sarees was born from a simple yet profound idea: to make India's finest handloom textiles accessible to the modern woman. We believe that a saree is more than fabric — it's a canvas of cultural expression, a testament to centuries of artistic mastery.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                We travel across India — from the silk-weaving clusters of Varanasi and Kanchipuram to the Patola looms of Gujarat — to handpick pieces that exemplify the highest standards of craftsmanship.
              </p>
              <Link to="/collections" className="btn-outline group self-start">
                Explore Collections
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-px bg-accent" />
              <span className="font-body text-[10px] tracking-[0.5em] uppercase text-accent">What We Stand For</span>
              <div className="w-8 h-px bg-accent" />
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold">Our Values</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background p-8 text-center group hover:shadow-lg transition-shadow duration-500"
              >
                <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center border border-accent/30 rounded-full group-hover:bg-accent/10 transition-colors">
                  <v.icon size={20} strokeWidth={1.5} className="text-accent" />
                </div>
                <h3 className="font-display text-base font-semibold mb-3">{v.title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-28 luxury-gradient">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: "5+", label: "Years of Excellence" },
              { number: "200+", label: "Artisan Partners" },
              { number: "10,000+", label: "Happy Customers" },
              { number: "15+", label: "States Covered" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-display text-3xl lg:text-4xl font-semibold gold-text mb-2">{stat.number}</p>
                <p className="font-body text-xs tracking-[0.2em] uppercase text-champagne/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-4">
              Ready to Experience <span className="italic font-light">Luxury?</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mb-8">
              Browse our collection and find the perfect piece that resonates with your style.
            </p>
            <Link to="/collections" className="btn-gold group">
              Shop Now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
