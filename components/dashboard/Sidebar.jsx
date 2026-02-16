"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Film,
  FlaskConical,
  LayoutDashboard,
  Link2,
  Plug,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  FileBarChart,
  Users,
  PieChart,
  Grid3X3,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import posthog from "posthog-js";

function getNavItems(plan) {
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/series", label: "All Series", icon: Film },
  ];

  if (plan === "pro" || plan === "studio") {
    items.push({ href: "/dashboard/integrations", label: "Integrations", icon: Plug });
    items.push({ href: "/dashboard/reports", label: "Reports", icon: FileBarChart });
    items.push({ href: "/dashboard/segments", label: "Segments", icon: PieChart });
  }

  if (plan === "studio") {
    items.push({ href: "/dashboard/experiments", label: "Experiments", icon: FlaskConical });
    items.push({ href: "/dashboard/custom", label: "Custom Dashboard", icon: Grid3X3 });
  }

  return items;
}

const bottomItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
];

function getBottomItems(plan) {
  const items = [];
  if (plan === "studio") {
    items.push({ href: "/dashboard/settings/team", label: "Team", icon: Users });
  }
  items.push(...bottomItems);
  return items;
}

const ADMIN_EMAIL = "dominickjerell@gmail.com";

function SidebarContent({ pathname, plan, email, onNavigate, onSignOut }) {
  const navItems = getNavItems(plan);
  const bottom = getBottomItems(plan);

  if (email === ADMIN_EMAIL) {
    bottom.unshift({ href: "/dashboard/admin", label: "Admin", icon: Shield });
  }

  return (
    <>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 px-2 pb-4">
        <Separator className="mb-4" />
        {bottom.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );
}

export function Sidebar({ user, plan = "free" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    posthog.capture("sign_out");
    posthog.reset();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-sidebar px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <BarChart3 className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold">Reelytics</span>
      </div>

      {/* Mobile sheet sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center gap-2 px-4">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Reelytics</span>
          </div>
          <Separator />
          <div className="flex flex-1 flex-col overflow-y-auto" style={{ height: "calc(100vh - 3.5rem - 1px)" }}>
            <SidebarContent
              pathname={pathname}
              plan={plan}
              email={user?.email}
              onNavigate={() => setMobileOpen(false)}
              onSignOut={handleSignOut}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-14 items-center gap-2 px-4">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Reelytics</span>
        </div>

        <Separator />

        <SidebarContent
          pathname={pathname}
          plan={plan}
          email={user?.email}
          onNavigate={undefined}
          onSignOut={handleSignOut}
        />
      </aside>
    </>
  );
}
