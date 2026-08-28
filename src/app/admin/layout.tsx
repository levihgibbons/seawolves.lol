import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/flags", label: "Flagged content" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
      <nav className="mt-3 flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-t-md border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-600 hover:border-navy hover:text-navy"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4">{children}</div>
    </div>
  );
}
