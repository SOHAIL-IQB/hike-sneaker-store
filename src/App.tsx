import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ShopProvider } from "@/store/ShopProvider";
import { UIProvider } from "@/store/UIProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BagDrawer from "@/components/layout/BagDrawer";
import MobileMenu from "@/components/layout/MobileMenu";
import SearchOverlay from "@/components/layout/SearchOverlay";
import SmoothScroll from "@/components/layout/SmoothScroll";
import RouteA11y from "@/components/layout/RouteA11y";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Index from "@/pages/Index";
import { EASE } from "@/lib/motion";

// The home page ships in the main bundle; every other route loads on demand.
const loaders = {
  Products: () => import("@/pages/Products"),
  ProductDetail: () => import("@/pages/ProductDetail"),
  Cart: () => import("@/pages/Cart"),
  Checkout: () => import("@/pages/Checkout"),
  Favorites: () => import("@/pages/Favorites"),
  NotFound: () => import("@/pages/NotFound"),
};
const Products = lazy(loaders.Products);
const ProductDetail = lazy(loaders.ProductDetail);
const Cart = lazy(loaders.Cart);
const Checkout = lazy(loaders.Checkout);
const Favorites = lazy(loaders.Favorites);
const NotFound = lazy(loaders.NotFound);

/** Fetch the other route chunks once the browser is idle, so navigation never waits on the network. */
function usePrefetchRoutes() {
  useEffect(() => {
    const run = () => Object.values(loaders).forEach((load) => void load());
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 2500);
    return () => window.clearTimeout(t);
  }, []);
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        // Opacity only: a leftover filter/transform on this wrapper would break position:fixed
        // and sticky descendants (the mobile buy bar, the sticky toolbar).
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
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

function Shell() {
  usePrefetchRoutes();
  return (
    <>
      <SmoothScroll />
      <RouteA11y />
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
    </>
  );
}

const App = () => (
  // reducedMotion="user": every Framer animation (transitions, springs, tilt, loops) honours the OS setting.
  <MotionConfig reducedMotion="user">
    <ErrorBoundary>
      <ShopProvider>
        <BrowserRouter>
          <UIProvider>
            <Shell />
          </UIProvider>
        </BrowserRouter>
      </ShopProvider>
    </ErrorBoundary>
  </MotionConfig>
);

export default App;
