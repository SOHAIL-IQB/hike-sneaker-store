import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { EASE, inView, rise } from "@/lib/motion";

/** Newsletter sign-up. Front-end only: nothing is sent anywhere. */
export default function Membership() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const doneRef = useRef<HTMLParagraphElement>(null);

  // The form unmounts on success; hand focus to the confirmation so it isn't lost.
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  return (
    <motion.section variants={rise} initial="hidden" whileInView="show" viewport={inView} className="container max-w-[1440px]" aria-labelledby="club-title">
      <div className="relative overflow-hidden rounded-[36px] border border-white/[0.06] bg-surface px-6 py-16 text-center edge-light md:px-16 md:py-24">
        <div aria-hidden className="absolute inset-0 bg-grid" />
        <div aria-hidden className="absolute -top-1/2 left-1/2 h-[120%] w-[80%] -translate-x-1/2 rounded-full bg-signal/25 blur-[120px]" />
        <div className="relative">
          <h2 id="club-title" className="text-display mx-auto max-w-[14ch] text-[clamp(2.25rem,6vw,5rem)]">
            First on every drop
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-muted-foreground">
            Join Hike Club for early access to new releases and members-only colourways.
          </p>
          <div role="status" aria-live="polite" className="mx-auto mt-10 flex justify-center empty:mt-0">
            {done && (
              <motion.p
                ref={doneRef}
                tabIndex={-1}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex items-center gap-2 rounded-full bg-success/10 px-5 py-3 text-success"
              >
                <Check className="h-4 w-4" aria-hidden /> You're on the list. (Demo — no email was sent.)
              </motion.p>
            )}
          </div>
          {!done && (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\S+@\S+\.\S+$/.test(email)) {
                  setError("Enter an email like name@example.com.");
                  return;
                }
                setDone(true);
              }}
              className="mx-auto mt-10 flex max-w-md flex-col gap-2 text-left sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label htmlFor="club-email" className="mb-2 block px-2 text-sm font-medium">
                  Email address
                </label>
                <input
                  id="club-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  aria-invalid={!!error}
                  aria-describedby={error ? "club-error" : undefined}
                  className="h-14 w-full rounded-full border border-control bg-background/60 px-6 transition-colors placeholder:text-muted-foreground focus:border-signal"
                />
              </div>
              <Button type="submit" variant="primary" size="lg">
                Join the club
              </Button>
            </form>
          )}
          {error && !done && (
            <p id="club-error" role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
