export default async function NotAuthorizedPage({
  searchParams,
}: {
  searchParams?: { reason?: string };
}) {
  const reason = searchParams?.reason ?? "unknown";

  const msg =
    reason === "not_admin"
      ? "You are signed in, but you don’t have admin access."
      : reason === "admin_query_error"
      ? "Admin check failed (database query error)."
      : "Access denied.";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8">
        <h1 className="text-2xl font-extrabold">Access denied</h1>
        <p className="mt-3 text-zinc-300">{msg}</p>
        <p className="mt-2 text-xs text-zinc-500">Reason: {reason}</p>
      </div>
    </main>
  );
}