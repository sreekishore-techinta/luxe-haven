import { ReactNode } from "react";
import Navbar from "./Navbar";
import NoticeBanner from "./NoticeBanner";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WhatsAppWidget from "./WhatsAppWidget";
import SlideTicker from "./SlideTicker";

import MobileBottomNav from "./MobileBottomNav";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      <NoticeBanner />
      <Navbar />
      <SlideTicker />
      <main className="flex-1 w-full pb-20 lg:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppWidget />
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
