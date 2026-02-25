"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getPageTitle(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/tournaments")) return "Tournaments";
  if (pathname.includes("registrations")) return "Registrations";
  if (pathname.includes("edit")) return "Edit Tournament";
  return "Admin Panel";
}

export default function AdminTopbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="h-14 border-b border-zinc-800 bg-black/40 backdrop-blur px-6 flex items-center justify-between">
      
      {/* Left */}
      <div>
        <h1 className="text-sm font-semibold text-white">
          {title}
        </h1>
        <p className="text-xs text-zinc-500">
          {pathname}
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/tournaments"
          className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900"
        >
          Tournaments
        </Link>

        <Link
          href="/"
          className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900"
        >
          View Website
        </Link>
      </div>
    </header>
  );
}