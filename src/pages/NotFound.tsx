import { useEffect } from "react";
import { motion } from "framer-motion";
import { ButtonLink } from "@/components/common/Button";
import { HikeMark } from "@/components/brand/Logo";
import { EASE } from "@/lib/motion";

export default function NotFound() {
  // Also used for unknown product ids, which the route-level title rules skip.
  useEffect(() => {
    document.title = "Page not found | Hike";
  }, []);

  return (
    <main id="main" className="relative flex min-h-[90svh] items-center overflow-hidden pt-24">
      <div aria-hidden className="absolute inset-0 bg-grid" />
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/20 blur-[120px]" />
      <div className="container relative max-w-[1440px] text-center">
        <motion.div initial={{ opacity: 0.35, y: 30, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1, ease: EASE }}>
          <HikeMark className="mx-auto h-12 text-signal" />
          <h1 className="text-display mt-8 text-[clamp(3rem,12vw,6rem)]">Off the trail</h1>
          <p className="mx-auto mt-5 max-w-[42ch] text-muted-foreground">This page doesn't exist — the link may be old or mistyped. Let's get you back on track.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/">Back home</ButtonLink>
            <ButtonLink to="/products" variant="outline">
              Shop sneakers
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
