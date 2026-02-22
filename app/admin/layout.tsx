export const dynamic = "force-dynamic";
export const revalidate = 0;

import { requireAdmin } from "../../lib/auth/adminGuard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}