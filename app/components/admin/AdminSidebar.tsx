// app/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; desc?: string };

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Dashboard", desc: "Quick stats & links" }],
    },
    {
      title: "Tournaments",
      items: [
        { href: "/admin/tournaments", label: "Manage Tournaments", desc: "Create, edit, schedule" },
        // ملاحظة: صفحة registrations عندك داخل كل Tournament:
        // /admin/tournaments/[id]/registrations
      ],
    },
    {
      title: "Content",
      items: [
  { href: "/admin/brokers", label: "Manage Brokers", desc: "Homepage broker logos" },
  { href: "/brokers", label: "Brokers Page", desc: "View public page" },
],
    },
  ];

  return (
    <aside className="w-72 min-h-screen border-r border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 py-5">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-black/40 flex items-center justify-center">
          <span className="text-yellow-400 font-extrabold">FX</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-white leading-tight">FX Leagues</div>
          <div className="text-xs text-zinc-400">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-6 space-y-5">
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="px-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              {sec.title}
            </div>

            <div className="mt-2 flex flex-col gap-1">
              {sec.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      "rounded-2xl px-3 py-2 border transition " +
                      (active
                        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-100"
                        : "border-transparent text-zinc-200 hover:bg-zinc-900/60 hover:border-zinc-800")
                    }
                  >
                    <div className="text-sm font-semibold">{item.label}</div>
                    {item.desc ? <div className="text-xs text-zinc-400">{item.desc}</div> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-8 pt-5 border-t border-zinc-800">
        <Link
          href="/"
          className="block rounded-2xl px-3 py-2 text-sm border border-zinc-800 bg-black/30 text-zinc-200 hover:bg-zinc-900/60"
        >
          ← Back to Website
        </Link>

        <div className="mt-3 text-xs text-zinc-500">
          Tip: Registrations are inside each tournament.
        </div>
      </div>
    </aside>
  );
}