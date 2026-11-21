import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CreditCard, Lock, Package, Wallet } from "lucide-react";
import { Button, ButtonLink } from "@/components/common/Button";
import OrderSummary from "@/components/common/OrderSummary";
import { formatPrice, shippingFor } from "@/data/products";
import { useShop, type DetailedLine } from "@/store/ShopProvider";
import { gaItems, trackEvent } from "@/lib/analytics";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2;
const STEPS = ["Delivery", "Payment", "Review"] as const;

interface Details {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  payment: "card" | "wallet" | "cod";
}

const EMPTY: Details = { email: "", firstName: "", lastName: "", address: "", city: "", postcode: "", country: "United States", payment: "card" };

const PAYMENTS = [
  { id: "card", label: "Card", note: "Demo — no card details are asked for", icon: CreditCard },
  { id: "wallet", label: "Digital wallet", note: "Demo — no account is linked", icon: Wallet },
  { id: "cod", label: "Pay on delivery", note: "Demo — nothing is delivered", icon: Package },
] as const;

function validateDelivery(d: Details) {
  const e: Partial<Record<keyof Details, string>> = {};
  if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = "Enter an email like name@example.com.";
  if (!d.firstName.trim()) e.firstName = "Enter your first name.";
  if (!d.lastName.trim()) e.lastName = "Enter your last name.";
  if (d.address.trim().length < 4) e.address = "Enter a street address.";
  if (!d.city.trim()) e.city = "Enter a town or city.";
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(d.postcode.trim())) e.postcode = "Enter a valid postcode.";
  return e;
}

interface Order {
  id: string;
  lines: DetailedLine[];
  subtotal: number;
  email: string;
}

export default function Checkout() {
  const { bag, subtotal, clearBag } = useShop();
  const [step, setStep] = useState<Step>(0);
  const [details, setDetails] = useState<Details>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [placing, setPlacing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (order) return <Confirmation order={order} />;

  if (bag.length === 0) {
    return (
      <main id="main" className="container max-w-[1440px] pb-10 pt-32 md:pt-40">
        <h1 className="text-display text-[clamp(2.5rem,7vw,5rem)]">Checkout</h1>
        <p className="mt-4 text-muted-foreground">Your bag is empty, so there's nothing to check out yet.</p>
        <ButtonLink to="/products" className="mt-8">
          Shop sneakers
        </ButtonLink>
      </main>
    );
  }

  const update = (k: keyof Details) => (e: { target: { value: string } }) => {
    setDetails((d) => ({ ...d, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const next = (e: FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      const errs = validateDelivery(details);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      if (first) {
        formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
        return;
      }
    }
    if (step < 2) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    // Place the (simulated) order.
    setPlacing(true);
    window.setTimeout(() => {
      const id = `TXN-${Date.now()}`;
      // GA4: same event and parameters as the first version, plus shipping.
      trackEvent("purchase", { transaction_id: id, value: subtotal, shipping: shippingFor(subtotal), items: gaItems(bag) });
      setOrder({ id, lines: bag, subtotal, email: details.email });
      clearBag();
      setPlacing(false);
    }, 900);
  };

  return (
    <main id="main" className="pb-10 pt-28 md:pt-36">
      <div className="container max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-display text-[clamp(2.5rem,7vw,5rem)]">Checkout</h1>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" strokeWidth={1.75} /> Demo checkout — no real order or payment
          </p>
        </div>

        <ol className="mt-10 grid grid-cols-3 gap-2" aria-label="Checkout steps">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i as Step)}
                aria-current={i === step ? "step" : undefined}
                className="group w-full text-left disabled:cursor-default"
              >
                <span className="block h-1 overflow-hidden rounded-full bg-surface-3">
                  <motion.span className="block h-full bg-signal" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE }} />
                </span>
                <span className={cn("mt-3 flex items-center gap-2 text-sm font-medium", i <= step ? "text-foreground" : "text-muted-foreground")}>
                  {i < step ? <Check className="h-4 w-4 text-signal" /> : <span className="tabular text-muted-foreground">{i + 1}</span>}
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <form ref={formRef} onSubmit={next} noValidate>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -24, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {step === 0 && (
                  <fieldset className="grid gap-4 sm:grid-cols-2">
                    <legend className="mb-6 text-xl font-semibold">Where should we send it?</legend>
                    <Field label="Email" name="email" type="email" autoComplete="email" value={details.email} onChange={update("email")} error={errors.email} className="sm:col-span-2" />
                    <Field label="First name" name="firstName" autoComplete="given-name" value={details.firstName} onChange={update("firstName")} error={errors.firstName} />
                    <Field label="Last name" name="lastName" autoComplete="family-name" value={details.lastName} onChange={update("lastName")} error={errors.lastName} />
                    <Field label="Street address" name="address" autoComplete="street-address" value={details.address} onChange={update("address")} error={errors.address} className="sm:col-span-2" />
                    <Field label="Town / city" name="city" autoComplete="address-level2" value={details.city} onChange={update("city")} error={errors.city} />
                    <Field label="Postcode" name="postcode" autoComplete="postal-code" value={details.postcode} onChange={update("postcode")} error={errors.postcode} />
                    <label className="sm:col-span-2">
                      <span className="mb-2 block text-sm font-medium">Country</span>
                      <select name="country" value={details.country} onChange={update("country")} autoComplete="country-name" className="h-14 w-full rounded-2xl border border-surface-3 bg-surface px-5">
                        {["United States", "United Kingdom", "Canada", "Germany", "India", "Australia"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  </fieldset>
                )}

                {step === 1 && (
                  <fieldset>
                    <legend className="mb-2 text-xl font-semibold">How would you like to pay?</legend>
                    <p className="mb-6 text-sm text-muted-foreground">This store is a demo: no payment information is collected and nothing is charged.</p>
                    <div className="space-y-3">
                      {PAYMENTS.map((p) => (
                        <label
                          key={p.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition-colors",
                            details.payment === p.id ? "border-signal bg-signal/[0.06]" : "border-surface-3 hover:border-foreground/40",
                          )}
                        >
                          <input type="radio" name="payment" value={p.id} checked={details.payment === p.id} onChange={() => setDetails((d) => ({ ...d, payment: p.id }))} className="sr-only" />
                          <span className={cn("grid h-5 w-5 place-items-center rounded-full border-2", details.payment === p.id ? "border-signal" : "border-surface-3")}>
                            {details.payment === p.id && <motion.span layoutId="pay-dot" className="h-2.5 w-2.5 rounded-full bg-signal" />}
                          </span>
                          <p.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                          <span>
                            <span className="block font-medium">{p.label}</span>
                            <span className="block text-sm text-muted-foreground">{p.note}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Check everything looks right</h2>
                    <dl className="grid gap-4 rounded-2xl border border-surface-3 p-5 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-label text-muted-foreground">Deliver to</dt>
                        <dd className="mt-2 leading-relaxed">
                          {details.firstName} {details.lastName}
                          <br />
                          {details.address}
                          <br />
                          {details.city} {details.postcode}, {details.country}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-label text-muted-foreground">Contact & payment</dt>
                        <dd className="mt-2 leading-relaxed">
                          {details.email}
                          <br />
                          {PAYMENTS.find((p) => p.id === details.payment)?.label} (demo)
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="signal" size="lg" disabled={placing} className="min-w-[220px]">
                {placing ? (
                  <span className="inline-flex items-center gap-2">
                    <motion.span className="h-4 w-4 rounded-full border-2 border-signal-foreground/30 border-t-signal-foreground" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                    Placing order…
                  </span>
                ) : step === 2 ? (
                  `Place order · ${formatPrice(subtotal + shippingFor(subtotal))}`
                ) : (
                  `Continue to ${STEPS[step + 1].toLowerCase()}`
                )}
              </Button>
              {step > 0 && (
                <Button variant="ghost" size="lg" onClick={() => setStep((s) => (s - 1) as Step)}>
                  Back
                </Button>
              )}
            </div>
          </form>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[28px] border border-white/[0.06] bg-surface p-6 edge-light">
              <h2 className="text-display mb-5 text-xl">In your bag</h2>
              <ul className="mb-6 space-y-3">
                {bag.map((l) => (
                  <li key={l.key} className="flex items-center gap-3">
                    <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-surface-2">
                      <img src={l.colorway.image} alt="" className="h-14 w-14 -rotate-12 object-contain" />
                      <span className="tabular absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-surface-3 px-1 text-[11px] font-bold">{l.quantity}</span>
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="block truncate font-medium">{l.product.name}</span>
                      <span className="block truncate text-muted-foreground">
                        {l.colorway.name} · {l.size}
                      </span>
                    </span>
                    <span className="tabular text-sm font-medium">{formatPrice(l.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <OrderSummary subtotal={subtotal} />
              <Link to="/cart" className="mt-5 inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Edit bag
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  className,
  ...input
}: { label: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  const id = `f-${input.name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        {...input}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          "h-14 w-full rounded-2xl border bg-surface px-5 outline-none transition-colors placeholder:text-muted-foreground focus:border-signal",
          error ? "border-destructive" : "border-surface-3",
        )}
      />
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Confirmation({ order }: { order: Order }): ReactNode {
  return (
    <main id="main" className="relative overflow-hidden pb-10 pt-32 md:pt-40">
      <div aria-hidden className="absolute inset-0 bg-grid" />
      <div aria-hidden className="absolute left-1/2 top-40 h-[50vmin] w-[50vmin] -translate-x-1/2 rounded-full bg-success/20 blur-[120px]" />
      <div className="container relative max-w-2xl text-center">
        <svg viewBox="0 0 80 80" className="mx-auto h-20 w-20" aria-hidden>
          <motion.circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--success))" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: EASE }} />
          <motion.path d="M25 41l10 10 20-22" fill="none" stroke="hsl(var(--success))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5, ease: EASE }} />
        </svg>
        <motion.div initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.3, duration: 0.8, ease: EASE }}>
          <h1 className="text-display mt-8 text-[clamp(2.5rem,7vw,4.5rem)]">Order placed</h1>
          <p className="mt-4 text-muted-foreground">
            Thanks! Order <span className="tabular font-semibold text-foreground">{order.id}</span> is confirmed. This is a demo, so no email goes to {order.email} and nothing ships.
          </p>
          <ul className="mx-auto mt-10 max-w-md space-y-3 text-left">
            {order.lines.map((l) => (
              <li key={l.key} className="flex items-center gap-4 rounded-2xl bg-surface p-3">
                <img src={l.colorway.image} alt="" className="h-14 w-16 -rotate-12 object-contain" />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block truncate font-medium">{l.product.name}</span>
                  <span className="block text-muted-foreground">
                    Size {l.size} · Qty {l.quantity}
                  </span>
                </span>
                <span className="tabular text-sm font-medium">{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <p className="tabular mt-6 text-lg font-semibold">Total {formatPrice(order.subtotal + shippingFor(order.subtotal))}</p>
          <ButtonLink to="/products" className="mt-10">
            Keep shopping
          </ButtonLink>
        </motion.div>
      </div>
    </main>
  );
}
