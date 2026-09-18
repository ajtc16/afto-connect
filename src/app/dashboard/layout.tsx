import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, User, Users, BarChart3, LogOut, ExternalLink } from "lucide-react";
import { getOwnerContext } from "@/lib/data/dashboard";
import { PLAN_LABELS } from "@/lib/plans";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/analytics", label: "Analítica", icon: BarChart3 },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getOwnerContext();
  if (!ctx) redirect("/login?redirect=/dashboard");

  const primarySlug = ctx.profiles[0]?.slug;

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-b border-border bg-surface/50 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4">
          <Logo />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="afto-focus flex items-center gap-2.5 whitespace-nowrap rounded-btn px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden px-4 pt-4 md:block">
          {primarySlug && (
            <Link
              href={`/c/${primarySlug}`}
              target="_blank"
              className="afto-focus flex items-center gap-2 rounded-btn border border-border px-3 py-2 text-xs text-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver perfil público
            </Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="text-sm">
            <span className="text-muted">{ctx.organization.name}</span>
            <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-xs text-muted-2">
              {PLAN_LABELS[ctx.organization.plan]}
            </span>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="afto-focus flex items-center gap-1.5 rounded-btn px-2.5 py-1.5 text-sm text-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
