import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowRightIcon } from "./icons";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------- button --- */

type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "onDark";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
"relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-smooth active:scale-[0.96] disabled:pointer-events-none disabled:opacity-45"

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
"bg-navy-800 text-white shadow-soft hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-pop",
  accent:
"bg-surf-500 text-white shadow-soft hover:-translate-y-0.5 hover:bg-surf-400 hover:shadow-pop",
  secondary:
"bg-navy-50 text-navy-800 ring-1 ring-inset ring-navy-100 hover:bg-navy-100 hover:ring-navy-200",
  outline:
"border border-navy-200 bg-white text-navy-800 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft",
  ghost: "text-navy-600 hover:bg-navy-50 hover:text-navy-800",
  danger: "bg-rose-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-rose-500",
  onDark: "bg-white text-navy-800 shadow-soft hover:-translate-y-0.5 hover:bg-surf-100",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[0.95rem]",
};

function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
) {
  return cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

/** Same look as Button, rendered as a Next link. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <Link href={href} className={buttonClass(variant, size, className)} {...props} />;
}

/* --------------------------------------------------------------- fields --- */

const FIELD_BASE =
  "w-full rounded-2xl border border-navy-100 bg-white px-4 py-2.5 text-sm text-navy-900 shadow-[0_1px_2px_rgba(0,50,96,0.04)] transition duration-200 placeholder:text-navy-300 hover:border-navy-200 focus:border-surf-400 focus:ring-4 focus:ring-surf-400/15 disabled:cursor-not-allowed disabled:bg-navy-50/60 disabled:text-navy-400";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(FIELD_BASE, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(FIELD_BASE, "resize-y leading-relaxed", className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cx("mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-500", className)}
      {...props}
    />
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="animate-fade-in rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
      {children}
    </p>
  );
}

/* ----------------------------------------------------------------- card --- */

export function Card({
  className,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cx(
"rounded-card border border-navy-100/80 bg-white shadow-soft transition duration-300 ease-smooth",
        interactive &&
"hover:-translate-y-1 hover:border-surf-200 hover:shadow-lift motion-reduce:hover:translate-y-0",
        className
      )}
      {...props}
    />
  );
}

/* --------------------------------------------------------- meta actions --- */

/**
 * The small pill actions under a review or comment (Helpful, Reply, Edit,
 * Delete, Report). `min-h-11` guarantees a 44px touch target — they were ~28px,
 * which is a miss on a site whose users are almost all on phones.
 */
export const META_ACTION =
"inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition duration-200 active:scale-95";

/* ---------------------------------------------------------------- badge --- */

type BadgeTone = "neutral" | "navy" | "surf" | "gold" | "green" | "amber" | "red";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-navy-50 text-navy-600 ring-navy-100",
  navy: "bg-navy-800 text-white ring-navy-800",
  surf: "bg-surf-100 text-surf-600 ring-surf-200",
  gold: "bg-gold-100 text-gold-500 ring-gold-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  red: "bg-rose-50 text-rose-700 ring-rose-100",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cx(
"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide ring-1 ring-inset",
        BADGE_TONES[tone],
        className
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------- sections --- */

export function SectionHeading({
  eyebrow,
  title,
  action,
  icon,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1 flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-surf-500">
            {icon}
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-navy-700 ring-1 ring-inset ring-navy-100 transition duration-200 hover:bg-navy-800 hover:text-white hover:ring-navy-800"
        >
          {action.label}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  action,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  /** Every empty state should offer a way out — the site is mostly empty today. */
  action?: { href: string; label: string };
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cx("flex flex-col items-center px-6 py-14 text-center", className)}>
      {icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
          {icon}
        </span>
      )}
      <p className="text-lg font-bold tracking-tight text-navy-900">{title}</p>
      {children && <div className="mt-1.5 max-w-sm text-sm text-navy-500">{children}</div>}
      {action && (
        <ButtonLink href={action.href} className="mt-5">
          {action.label}
          <ArrowRightIcon className="h-4 w-4" />
        </ButtonLink>
      )}
    </Card>
  );
}

/** A short line of context above a feed — sign in, verify, closed, etc. */
export function NoticeCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
"rounded-card border border-navy-100 bg-white/70 px-4 py-3.5 text-sm text-navy-600",
        className
      )}
    >
      {children}
    </div>
  );
}
