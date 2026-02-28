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
      items: [{ href: "/admin/tournaments", label: "Manage Tournaments", desc: "Create, edit, schedule" }],
    },
    {
      title: "Participants",
      items: [
        {
  href: "/admin/demo-submissions",
  label: "Participants List",
  desc: "Names, email & phone for sponsors",
},
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
    <aside className="w-72 lg:w-80 min-h-screen border-r border-white/10 bg-zinc-950/80 backdrop-blur px-4 py-5">
      {/* Brand */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/40 flex items-center justify-center">
          <span className="text-yellow-400 font-extrabold">FX</span>
        </div>

        <div className="min-w-0">
          <div className="text-sm font-extrabold text-white leading-tight">FX Leagues</div>
          <div className="text-xs text-white/50">Admin Panel</div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-5 h-px bg-white/10" />

      {/* Nav */}
      <nav className="mt-5 space-y-6">
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="px-2 text-[11px] font-semibold tracking-wider text-white/35 uppercase">
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
                      "group relative rounded-2xl px-3 py-2.5 transition border " +
                      (active
                        ? "border-yellow-500/30 bg-yellow-500/10"
                        : "border-transparent hover:border-white/10 hover:bg-white/5")
                    }
                  >
                    {/* Active indicator */}
                    <span
                      className={
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r " +
                        (active ? "bg-yellow-400" : "bg-transparent group-hover:bg-white/10")
                      }
                    />

                    <div className={"text-sm font-semibold " + (active ? "text-yellow-100" : "text-white/85")}>
                      {item.label}
                    </div>

                    {item.desc ? (
                      <div className={"text-xs mt-0.5 " + (active ? "text-yellow-100/70" : "text-white/45")}>
                        {item.desc}
                      </div>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-8 pt-5 border-t border-white/10">
        <Link
          href="/"
          className="block rounded-2xl px-3 py-2.5 text-sm border border-white/10 bg-black/30 text-white/80 hover:bg-white/5"
        >
          ← Back to Website
        </Link>

        <div className="mt-3 text-xs text-white/40">
          Tip: Registrations are inside each tournament.
        </div>
      </div>
    </aside>
  );
}