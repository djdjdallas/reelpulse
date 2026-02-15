import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export const metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="bg-muted rounded-full p-4">
        <BarChart3 className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        404 — Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Sorry, we couldn't find the page you're looking for. It may have been
        moved or no longer exists.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
