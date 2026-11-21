/**
 * GA4 event helper. The gtag.js snippet itself is loaded in index.html
 * (measurement ID G-RVBB8Q0CW5) so it runs before the app on deployed sites.
 *
 * Events sent by the store — names and parameters are kept stable so existing
 * GA4 reports keep working:
 *   view_product    item_id, item_name, price
 *   add_to_cart     item_id, item_name, price, size
 *   begin_checkout  value, items[]
 *   purchase        transaction_id, value, items[]
 */

type Gtag = (command: "event", eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
  if (import.meta.env.DEV) {
    console.info(`[GA4] ${eventName}`, params);
  }
};

interface LineLike {
  product: { id: string; name: string; price: number };
  quantity: number;
}

/** GA4 items[] in the exact shape the first version sent. */
export const gaItems = (lines: LineLike[]) =>
  lines.map((l) => ({ item_id: l.product.id, item_name: l.product.name, price: l.product.price, quantity: l.quantity }));

export const trackBeginCheckout = (lines: LineLike[], value: number) =>
  trackEvent("begin_checkout", { value, items: gaItems(lines) });
