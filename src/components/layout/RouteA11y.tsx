import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const HOME_TITLE = "Hike — Running, Lifestyle, Training & Basketball Sneakers";

function titleFor(pathname: string, search: string): string | null {
  if (pathname === "/") return HOME_TITLE;
  if (pathname.startsWith("/products/")) return null; // the product page sets its own
  if (pathname === "/products") {
    const params = new URLSearchParams(search);
    const q = params.get("q");
    const cat = params.get("category");
    if (q) return `Search: ${q} | Hike`;
    if (params.get("sale")) return "Sale | Hike";
    if (cat) return `${cat.charAt(0).toUpperCase()}${cat.slice(1)} sneakers | Hike`;
    return "All sneakers | Hike";
  }
  if (pathname === "/cart") return "Your bag | Hike";
  if (pathname === "/checkout") return "Checkout | Hike";
  if (pathname === "/favorites") return "Favourites | Hike";
  return "Page not found | Hike";
}

/**
 * Single-page apps don't announce navigation, so do it here: a per-route document title, a polite
 * status message, and focus moved to the new page's <main> (after the page transition has settled).
 */
export default function RouteA11y() {
  const { pathname, search } = useLocation();
  const first = useRef(true);
  const announce = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const title = titleFor(pathname, search);
    if (title) document.title = title;
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      if (announce.current) announce.current.textContent = document.title;
      const main = document.getElementById("main");
      // Only steal focus when the user isn't already somewhere meaningful (e.g. typing in a filter).
      if (main && (document.activeElement === document.body || !main.contains(document.activeElement))) {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return <p ref={announce} role="status" aria-live="polite" className="sr-only" />;
}
