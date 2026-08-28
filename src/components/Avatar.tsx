function initials(name: string) {
  const parts = name.replace(/^Dr\.\s*/i, "").split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-xl",
  };

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URLs, not worth configuring remotePatterns for
      <img
        src={photoUrl}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-1 ring-gray-200`}
      />
    );
  }

  return (
    <span
      className={`${sizes[size]} flex items-center justify-center rounded-full bg-navy font-semibold text-white`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
