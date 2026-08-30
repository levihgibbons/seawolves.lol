import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { PageHero, PageContent } from "@/components/PageHero";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div>
      <PageHero title="Admin" />
      <PageContent>
        <AdminNav />
        <div className="mt-6">{children}</div>
      </PageContent>
    </div>
  );
}
