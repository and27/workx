"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/applications", label: "Postulaciones" },
  { href: "/jobs", label: "Trabajos" },
  { href: "/manual", label: "Crear job" },
  { href: "/inbox", label: "Inbox" },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full">
        <aside className="w-60 shrink-0 border-r border-border px-4 py-6">
          <div className="mb-6 space-y-1 px-3">
            <p className="text-sm font-semibold">Workx</p>
            <p className="text-xs text-muted-foreground">
              Seguimiento de postulaciones
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted",
                    isActive && "border border-border shadow-sm font-medium",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
