import CategoryHero from "@/components/CategoryHero";
import ServicesGrid from "@/components/ServicesGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import CategoryBanner from "@/components/CategoryBanner";
import SaleBanner from "@/components/SaleBanner";

import HeritageBand from "@/components/HeritageBand";
import TestimonialsSection from "@/components/TestimonialsSection";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const Index = () => {
  return (
    <>
      {/* 2. Dynamic Hero Section */}
      <CategoryHero
        title="Luxe Haven"
        description="Curating India's finest silk heritage and artisanal masterworks for the modern silhouette."
        pageKey="home"
      />


      {/* 4. Editorial Lookbook Grid */}
      <ServicesGrid />

      {/* 5. Featured Products (New/Best Sellers tabs) */}
      <FeaturedProducts />


      {/* 8. Festive Sale Banner */}
      <SaleBanner />

      {/* 9. Heritage Story + Stats */}
      <HeritageBand />



      {/* 11. Testimonials */}
      <TestimonialsSection />


    </>
  );
};

export default Index;
