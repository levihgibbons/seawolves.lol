import type { SVGProps } from "react";

// One icon set for the whole app so nothing drifts: 24x24 grid, 1.75 stroke,
// round caps, `currentColor`. Size them with `className="h-4 w-4"`.
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </Base>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 9a6 6 0 1112 0c0 4.5 1.6 5.8 1.6 5.8H4.4S6 13.5 6 9z" />
      <path d="M10 18.5a2 2 0 004 0" />
    </Base>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Base>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12h13" />
      <path d="M12.5 6.5L19 12l-6.5 5.5" />
    </Base>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M19 12H6" />
      <path d="M11.5 6.5L5 12l6.5 5.5" />
    </Base>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h11M18.5 7H20" />
      <path d="M4 12h3M10.5 12H20" />
      <path d="M4 17h9M16.5 17H20" />
      <circle cx="16.5" cy="7" r="1.9" />
      <circle cx="8.5" cy="12" r="1.9" />
      <circle cx="14.5" cy="17" r="1.9" />
    </Base>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </Base>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M13 2.5L4.5 13.5H11l-.5 8L19 10.5h-6.5l.5-8z" />
    </Base>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3s5 3.6 5 8.5a5 5 0 01-10 0C7 9.5 8.5 8 8.5 8s.5 1.6 1.8 2C11 8.3 12 6 12 3z" />
    </Base>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
      <path d="M7 5.5H4.5v1A3.5 3.5 0 007.5 10M17 5.5h2.5v1A3.5 3.5 0 0116.5 10" />
      <path d="M12 14v3M8.5 20h7M9.5 20c0-1.7 1-3 2.5-3s2.5 1.3 2.5 3" />
    </Base>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 01-2.6-.35L4.5 20.5l1.1-3.3A6.4 6.4 0 014 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5z" />
    </Base>
  );
}

export function StarOutlineIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.5l2.7 5.6 6.1.85-4.45 4.3 1.07 6.1L12 17.5l-5.42 2.85 1.07-6.1L3.2 9.95l6.1-.85L12 3.5z" />
    </Base>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="9.5" cy="8" r="3.3" />
      <path d="M3.5 19.5c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M16.5 5.2a3.3 3.3 0 010 6.4M17.5 14.9c2 .7 3.2 2.3 3.2 4.6" />
    </Base>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3l7 2.7v5.6c0 4.3-2.9 7.9-7 9.7-4.1-1.8-7-5.4-7-9.7V5.7L12 3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </Base>
  );
}

export function FlagIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5.5 21V4" />
      <path d="M5.5 5h9.2l-1.1 3 1.1 3H5.5" />
    </Base>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z" />
      <path d="M13.5 6.5l4 4" />
    </Base>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.5 6.5h15M9.5 6.5V4.8A1.3 1.3 0 0110.8 3.5h2.4a1.3 1.3 0 011.3 1.3v1.7" />
      <path d="M6.5 6.5l.8 12.2A1.8 1.8 0 009.1 20.5h5.8a1.8 1.8 0 001.8-1.8l.8-12.2" />
    </Base>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14 6.5V5a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 005 5v14a1.5 1.5 0 001.5 1.5h6A1.5 1.5 0 0014 19v-1.5" />
      <path d="M10 12h10M17 8.5l3.5 3.5-3.5 3.5" />
    </Base>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c0-3.5 3.2-5.8 7.2-5.8s7.2 2.3 7.2 5.8" />
    </Base>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9L12 17.1l-1.9-4.9L5.2 10.3l4.9-1.9L12 3.5z" />
      <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
    </Base>
  );
}

export function GhostIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 20V11a7 7 0 1114 0v9l-2.3-1.7-2.4 1.7-2.3-1.7-2.3 1.7L7.3 18.3 5 20z" />
      <path d="M9.5 10.5h.01M14.5 10.5h.01" />
    </Base>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4 17l4.6-4.3a2 2 0 012.7 0L20 20" />
    </Base>
  );
}

export function MegaphoneIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 10.5v3a2 2 0 002 2h1.5L17 20V4L7.5 8.5H6a2 2 0 00-2 2z" />
      <path d="M17 8.5a3.5 3.5 0 010 7M7.5 15.5V20" />
    </Base>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.9" />
    </Base>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2.5 12S6 5.8 12 5.8c1.4 0 2.6.3 3.7.8M20.4 9.4c.7.9 1.1 1.6 1.1 1.6s-3.5 6.2-9.5 6.2c-1.1 0-2.1-.2-3-.5" />
      <path d="M9.9 9.9a2.9 2.9 0 004.2 4.2" />
      <path d="M3.5 3.5l17 17" />
    </Base>
  );
}
