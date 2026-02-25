export const dynamic = "force-dynamic";
export const revalidate = 0;

import { requireAdmin } from "../../lib/auth/adminGuard";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(); // 🔐 حماية الأدمن

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main */}
        <div className="flex-1 min-w-0">
          <AdminTopbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}