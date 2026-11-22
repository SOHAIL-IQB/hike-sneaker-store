import { useEffect, useRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { lockScroll } from "@/components/layout/SmoothScroll";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface OverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Visually hide the title (still announced to screen readers). */
  hideTitle?: boolean;
  side?: "right" | "left" | "top";
  className?: string;
  children: ReactNode;
}

const panelMotion = {
  right: { initial: { x: "104%" }, animate: { x: 0 }, exit: { x: "104%" } },
  left: { initial: { x: "-104%" }, animate: { x: 0 }, exit: { x: "-104%" } },
  top: {
    initial: { y: -24, opacity: 0.35, filter: "blur(12px)" },
    animate: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: { y: -24, opacity: 0, filter: "blur(12px)" },
  },
};

const panelPosition = {
  right: "right-2 top-2 bottom-2 w-[min(440px,calc(100vw-1rem))] rounded-[28px]",
  left: "left-2 top-2 bottom-2 w-[min(400px,calc(100vw-1rem))] rounded-[28px]",
  top: "inset-x-2 top-2 mx-auto max-w-3xl rounded-[28px] md:top-6",
};

/** Accessible slide-over / drop-down panel: Radix handles focus, Escape and aria; Framer handles motion. */
export default function Overlay({ open, onOpenChange, title, hideTitle, side = "right", className, children }: OverlayProps) {
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onCloseAutoFocus={(e) => {
                // These dialogs have no Radix trigger, so hand focus back to whatever opened them.
                e.preventDefault();
                if (opener.current?.isConnected) opener.current.focus();
              }}
            >
              <motion.div
                {...panelMotion[side]}
                transition={{ duration: 0.6, ease: EASE }}
                className={cn(
                  "fixed z-[61] flex flex-col overflow-hidden border border-white/[0.08] bg-surface shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] focus:outline-none",
                  panelPosition[side],
                  className,
                )}
              >
                <div className="flex items-center justify-between px-6 pb-2 pt-5">
                  <Dialog.Title className={cn("text-display text-xl", hideTitle && "sr-only")}>{title}</Dialog.Title>
                  <Dialog.Close
                    className="grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-surface-2 hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
