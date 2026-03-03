"use client";

import { useState } from "react";

export default function DeleteTournamentButton({
  id,
  status,
  title,
  onDelete,
}: {
  id: string;
  status: string | null;
  title: string | null;
  onDelete: (formData: FormData) => void;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <form
      action={async (fd) => {
        const s = (status ?? "").toUpperCase();

        if (s === "LIVE") {
          alert("You can't delete a LIVE tournament. Set it to COMPLETED first.");
          return;
        }

        const ok = confirm(`Delete "${title ?? "this tournament"}"? This cannot be undone.`);
        if (!ok) return;

        setLoading(true);
        await onDelete(fd);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status ?? ""} />

      <button
        type="submit"
        disabled={loading}
        className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[12px] text-red-200 hover:bg-red-500/20 disabled:opacity-50"
        title="Delete tournament"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </form>
  );
}