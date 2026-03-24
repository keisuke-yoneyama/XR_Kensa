import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const links = [
  { href: ROUTES.projects, label: "Projects" },
  { href: ROUTES.login, label: "Login" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-steel-500">steel-mr-inspection</p>
            <h1 className="text-lg font-semibold text-slate-900">Admin Web App</h1>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}