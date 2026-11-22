import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
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
      const id = w.requestIdleCallback(run, { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 1200);
    return () => window.clearTimeout(t);
  }, []);
}

/** Shown only while a page's code is still downloading, so the screen is never blank. */
function RouteFallback() {
  return (
    <div role="status" aria-busy="true" className="grid min-h-[70vh] place-items-center">
      <span className="sr-only">Loading</span>
      <div className="h-1 w-28 overflow-hidden rounded-full bg-surface-3" aria-hidden>
        <div className="h-full w-1/2 animate-[loading_1.1s_ease-in-out_infinite] rounded-full bg-signal" />
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  // No exit animation and no "wait" step: the old page stays on screen (React keeps it during the
  // navigation transition) until the next page is ready, then the new one fades in with plain CSS.
  // A CSS animation can't get stuck: if it never runs, the page is simply shown.
  return (
    <div key={location.pathname} className="animate-page-in">
      <Suspense fallback={<RouteFallback />}>
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
    </div>
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
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <UIProvider>
            <Shell />
          </UIProvider>
        </BrowserRouter>
      </ShopProvider>
    </ErrorBoundary>
  </MotionConfig>
);

export default App;
