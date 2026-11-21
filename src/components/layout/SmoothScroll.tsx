import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import Lenis from "lenis";

let lenis: Lenis | null = null;

let locks = 0;

/** Pause smooth scrolling while an overlay owns the page. Counted, so two overlays can't unlock each other. */
export const lockScroll = (locked: boolean) => {
  locks = locked ? locks + 1 : Math.max(0, locks - 1);
  if (!lenis) return;
  if (locks > 0) lenis.stop();
  else lenis.start();
};

export const scrollToTop = (immediate = true) => {
  // force: still jump when an overlay (bag, menu) has paused smooth scrolling.
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  window.scrollTo({ top: 0 });
};

/** Lenis inertial scrolling, skipped entirely for reduced-motion users. */
export default function SmoothScroll() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1.4 });
    let raf = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // New page → start at the top. Back/Forward and filter changes keep their position.
  useEffect(() => {
    if (navType !== "POP") scrollToTop();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
