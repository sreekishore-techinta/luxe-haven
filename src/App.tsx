import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Layout from "@/components/Layout";
import { Loader2 } from "lucide-react";

// Public Pages
import Index from "./pages/Index";
import Collections from "./pages/Collections";
import Blouses from "./pages/Blouses";
import SuitSets from "./pages/SuitSets";
import NewArrivals from "./pages/NewArrivals";
import BestSellers from "./pages/BestSellers";
import Sarees from "./pages/Sarees";
import SareeSubCategory from "./pages/SareeSubCategory";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";

// Lazy Loaded Pages
const About = lazy(() => import("./pages/About"));
const Account = lazy(() => import("./pages/Account"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const DesignerBlouseStyles = lazy(() => import("./pages/DesignerBlouseStyles"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages (All Lazy)
const AdminLayout = lazy(() => import("@/components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminGeneralMaster = lazy(() => import("./pages/AdminGeneralMaster"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminBlouseStyles = lazy(() => import("./pages/AdminBlouseStyles"));
const AdminSareeManagement = lazy(() => import("./pages/AdminSareeManagement"));

import ScrollToTop from "@/components/ScrollToTop";

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4">
    <Loader2 className="w-10 h-10 text-accent animate-spin" />
    <p className="font-display text-lg italic text-foreground/60">Luxe Haven...</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WishlistProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Suspense fallback={<LoadingOverlay />}>
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
                <Route path="/admin/product-master/*" element={<AdminLayout><AdminProducts /></AdminLayout>} />
                <Route path="/admin/general-master" element={<AdminLayout><AdminGeneralMaster /></AdminLayout>} />
                <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
                <Route path="/admin/customers" element={<AdminLayout><AdminCustomers /></AdminLayout>} />
                <Route path="/admin/blouse-styles" element={<AdminLayout><AdminBlouseStyles /></AdminLayout>} />
                <Route path="/admin/saree-management" element={<AdminLayout><AdminSareeManagement /></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />

                {/* Public Routes */}
                <Route path="/" element={<Layout><Index /></Layout>} />
                <Route path="/collections" element={<Layout><Collections /></Layout>} />
                <Route path="/blouse-styles" element={<Layout><DesignerBlouseStyles /></Layout>} />
                <Route path="/blouses" element={<Layout><Blouses /></Layout>} />
                <Route path="/suit-sets" element={<Layout><SuitSets /></Layout>} />
                <Route path="/new-arrivals" element={<Layout><NewArrivals /></Layout>} />
                <Route path="/best-sellers" element={<Layout><BestSellers /></Layout>} />
                <Route path="/sarees" element={<Layout><Sarees /></Layout>} />
                <Route path="/sarees/:slug" element={<Layout><SareeSubCategory /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/account" element={<Layout><Account /></Layout>} />
                <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                <Route path="/category/:slug" element={<Layout><CategoryPage /></Layout>} />
                <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
