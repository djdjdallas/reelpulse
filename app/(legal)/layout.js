import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <BarChart3 className="size-5 text-primary" />
            Reelytics
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">{children}</div>
      </main>

      <footer className="border-t">
        <div className="max-w-3xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Reelytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
