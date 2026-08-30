import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { ChooseUsernameForm } from "@/components/ChooseUsernameForm";

export const metadata = { title: "Choose a username" };

export default async function ChooseUsernamePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.username) redirect("/");

  const { callbackUrl } = await searchParams;

  return (
    <AuthShell
      title="Pick a username"
      subtitle="This is the name on everything you post. Your real name stays private."
    >
      <ChooseUsernameForm callbackUrl={callbackUrl ?? "/"} />
    </AuthShell>
  );
}
