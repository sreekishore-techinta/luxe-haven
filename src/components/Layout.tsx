import { ReactNode } from "react";
import Navbar from "./Navbar";
import NoticeBanner from "./NoticeBanner";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NoticeBanner />
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Layout;
