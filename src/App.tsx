import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShopProvider } from "@/store/ShopProvider";
import { UIProvider } from "@/store/UIProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BagDrawer from "@/components/layout/BagDrawer";
import MobileMenu from "@/components/layout/MobileMenu";
import SearchOverlay from "@/components/layout/SearchOverlay";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Index from "@/pages/Index";
import { EASE } from "@/lib/motion";

// The home page ships in the main bundle; every other route loads on demand.
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(8px)" }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <ShopProvider>
    <BrowserRouter>
      <UIProvider>
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        <AnimatedRoutes />
        <Footer />
        <BagDrawer />
        <MobileMenu />
        <SearchOverlay />
      </UIProvider>
    </BrowserRouter>
  </ShopProvider>
);

export default App;
