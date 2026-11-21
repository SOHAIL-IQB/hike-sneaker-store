import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "primary" | "signal" | "ghost" | "outline";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-[background-color,color,box-shadow,transform,border-color] duration-300 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:bg-white hover:shadow-[0_0_40px_-6px_hsl(var(--glow)/0.7)]",
  signal: "bg-signal text-signal-foreground hover:shadow-[0_0_44px_-4px_hsl(var(--signal)/0.75)] hover:brightness-110",
  ghost: "text-foreground hover:bg-surface-2",
  outline: "border border-surface-3 text-foreground hover:border-foreground/60 hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-base",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(base, variants[variant], sizes[size], className);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
}

export const ButtonLink = ({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) => (
  <Link className={buttonClass(variant, size, className)} {...props} />
);
