import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui";
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
    <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Choose a username</h1>
      <p className="mt-1 text-sm text-gray-600">
        This is how you&apos;ll be identified in reviews and comments.
      </p>
      <Card className="mt-6 p-6">
        <ChooseUsernameForm callbackUrl={callbackUrl ?? "/"} />
      </Card>
    </div>
  );
}
