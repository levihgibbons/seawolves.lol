import Image from "next/image";
import { cx } from "./ui";

function initials(name: string) {
  const parts = name.replace(/^Dr\.\s*/i, "").split(/[\s_]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

// Initials avatars get a stable gradient picked from the name, so the roster
// reads as a set of people rather than a wall of identical navy circles.
const GRADIENTS = [
  "from-navy-700 to-navy-950",
  "from-navy-800 to-surf-600",
  "from-surf-500 to-navy-800",
  "from-navy-700 to-surf-500",
  "from-navy-800 to-navy-950",
  "from-surf-600 to-navy-900",
];

function gradientFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

const SIZES = {
  xs: "h-7 w-7 text-[0.6rem]",
  sm: "h-9 w-9 text-[0.7rem]",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

// Rendered pixel size per variant. next/image needs a concrete width/height to
// build its srcset — without it the roster served 57 raw 960x960 JPEGs (2.2MB)
// into 48px slots. Deliberately no `sizes` prop: these are fixed-size images, and
// `sizes` switches Next to the full responsive deviceSizes ladder (measured: 855
// srcset entries for 57 photos instead of a 1x/2x pair).
const PX = { xs: 28, sm: 36, md: 48, lg: 64, xl: 96 } as const;

export function Avatar({
  name,
  photoUrl,
  size = "md",
  className,
  ring = true,
  priority = false,
}: {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
  ring?: boolean;
  /** Set on the one above-the-fold avatar of a page (a teacher's own header). */
  priority?: boolean;
}) {
  const shell = cx(
    SIZES[size],
    "shrink-0 rounded-full object-cover",
    ring && "ring-2 ring-white shadow-soft",
    className
  );

  if (photoUrl) {
    // Only same-origin files under /public can go through the image optimizer.
    // User avatars and announcement art are base64 `data:` URLs, and admins can
    // paste an arbitrary remote URL — next/image handles neither, so those keep
    // a plain <img> (now lazy, which it wasn't before).
    // `//host/x.jpg` is protocol-relative, not same-origin — next/image throws on it.
    const optimizable = photoUrl.startsWith("/") && !photoUrl.startsWith("//");
    const px = PX[size];

    if (optimizable) {
      return (
        <Image
          src={photoUrl}
          alt={name}
          width={px}
          height={px}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={shell}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element -- data: URLs and arbitrary admin-provided hosts, neither of which next/image can optimize
      <img
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={shell}
      />
    );
  }

  return (
    <span
      className={cx(
        shell,
        "flex items-center justify-center bg-gradient-to-br font-display font-extrabold tracking-tight text-white",
        gradientFor(name)
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
