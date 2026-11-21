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
