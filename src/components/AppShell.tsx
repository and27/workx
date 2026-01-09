import Link from "next/link";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/applications", label: "Postulaciones" },
  { href: "/jobs", label: "Trabajos" },
  { href: "/inbox", label: "Inbox" },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full">
        <aside className="w-60 shrink-0 border-r border-border px-4 py-6">
          <div className="mb-6 space-y-1">
            <p className="text-sm font-semibold">Workx</p>
            <p className="text-xs text-muted-foreground">
              Seguimiento de postulaciones
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
