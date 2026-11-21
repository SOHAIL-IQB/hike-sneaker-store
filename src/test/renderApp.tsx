import { render } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import { expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BagDrawer from "@/components/layout/BagDrawer";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import ProductDetail from "@/pages/ProductDetail";
import { ShopProvider } from "@/store/ShopProvider";
import { UIProvider } from "@/store/UIProvider";
import { installMemoryStorage } from "./memoryStorage";
import Probe from "./Probe";

/**
 * Browser APIs jsdom lacks, plus switching framer-motion to instant transitions so
 * AnimatePresence swaps and exit animations settle synchronously.
 * Call once per test (beforeEach) and pair with `teardownUiEnv` in afterEach.
 */
export function setupUiEnv() {
  MotionGlobalConfig.skipAnimations = true;
  const storage = installMemoryStorage();
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollBy = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", NoopObserver);
  vi.stubGlobal("ResizeObserver", NoopObserver);
  const gtag = vi.fn();
  window.gtag = gtag;
  vi.spyOn(console, "info").mockImplementation(() => {});
  return { storage, gtag };
}

export function teardownUiEnv() {
  MotionGlobalConfig.skipAnimations = false;
  delete window.gtag;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
}

/** Mounts the real providers, routes and bag drawer at `route`. */
export function renderApp(route: string) {
  return render(
    <ShopProvider>
      <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <UIProvider>
          <Routes>
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<div>other page</div>} />
          </Routes>
          <BagDrawer />
          <Probe />
        </UIProvider>
      </MemoryRouter>
    </ShopProvider>,
  );
}

interface SeedLine {
  productId: string;
  colorwayId: string;
  size: string;
  quantity: number;
}

/** Writes a saved bag to storage so the provider hydrates with it. Call before renderApp. */
export function seedBag(storage: Storage, bag: SeedLine[], extra: { favorites?: string[]; recent?: string[] } = {}) {
  storage.setItem("hike:shop:v2", JSON.stringify({ bag, favorites: [], recent: [], ...extra }));
}

/** The bag currently persisted by the provider. */
export function savedState() {
  return JSON.parse(window.localStorage.getItem("hike:shop:v2") ?? "null") as {
    bag: (SeedLine & { key: string })[];
    favorites: string[];
    recent: string[];
  } | null;
}

/**
 * Params of every gtag("event", name, ...) call. A `currency` of "USD" is allowed and stripped so
 * assertions on the core parameters stay exact whether or not the event carries it.
 */
export function gaParams(gtag: { mock: { calls: unknown[][] } }, name: string) {
  return gtag.mock.calls
    .filter((c) => c[0] === "event" && c[1] === name)
    .map((c) => {
      const { currency, ...rest } = (c[2] ?? {}) as Record<string, unknown>;
      if (currency !== undefined) expect(currency).toBe("USD");
      return rest;
    });
}
