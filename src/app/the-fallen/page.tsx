import { Card } from "@/components/ui";

export const metadata = { title: "The Fallen" };

export default function TheFallenPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Card className="p-10 text-center">
        <p className="text-4xl">🪦</p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">The Fallen</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          A memorial wall for the teachers who&apos;ve left Pacifica — gone, but not forgotten (and
          definitely still discussed). Their reviews live on forever.
        </p>
        <p className="mt-4 text-sm font-medium text-navy">Coming soon :)</p>
      </Card>
    </div>
  );
}
