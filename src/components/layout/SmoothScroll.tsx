import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

let lenis: Lenis | null = null;

/** Pause smooth scrolling while an overlay owns the page. */
export const lockScroll = (locked: boolean) => {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
};

export const scrollToTop = (immediate = true) => {
  // force: still jump when an overlay (bag, menu) has paused smooth scrolling.
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  window.scrollTo({ top: 0 });
};

/** Lenis inertial scrolling, skipped entirely for reduced-motion users. */
export default function SmoothScroll() {
  const { pathname, search } = useLocation();

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

  // New page → start at the top. Filter changes on the same page keep position.
  useEffect(() => {
    scrollToTop();
  }, [pathname]);
  void search;

  return null;
}
