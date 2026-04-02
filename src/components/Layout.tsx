import { ReactNode } from "react";
import Navbar from "./Navbar";
import NoticeBanner from "./NoticeBanner";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WhatsAppWidget from "./WhatsAppWidget";
import SlideTicker from "./SlideTicker";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NoticeBanner />
      <Navbar />
      <SlideTicker />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppWidget />
    </div>
  );
};

export default Layout;
