"use client";

import { useRef, useState } from "react";

type BrokerKey = "exness" | "icmarkets" | "vantage" | "fxtm";

const BROKERS: { key: BrokerKey; name: string; file: string }[] = [
  { key: "exness", name: "Exness", file: "/brokers/exness.png" },
  { key: "icmarkets", name: "IC Markets", file: "/brokers/icmarkets.png" },
  { key: "vantage", name: "Vantage", file: "/brokers/vantage.png" },
  { key: "fxtm", name: "FXTM", file: "/brokers/fxtm.png" },
];

export default function AdminBrokersPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<BrokerKey>("exness");
  const [status, setStatus] = useState<string>("");

  function pickFile(key: BrokerKey) {
    setSelected(key);
    setStatus("");
    inputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // basic validations
    const okTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!okTypes.includes(file.type)) {
      setStatus("❌ Please upload PNG/JPG/WEBP only.");
      e.target.value = "";
      return;
    }

    // upload to server route -> replaces the image in /public/brokers/
    setStatus("Uploading...");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("key", selected);

      const res = await fetch("/api/admin/brokers/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(`❌ ${data?.error ?? "Upload failed"}`);
      } else {
        // cache-bust by adding ?t=
        setStatus("✅ Updated. Refresh homepage to see it.");
      }
    } catch (err: any) {
      setStatus(`❌ ${err?.message ?? "Upload failed"}`);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Brokers</h1>
          <p className="text-zinc-400 mt-2">
            Replace the 4 homepage broker logos (files inside{" "}
            <span className="text-white font-semibold">/public/brokers</span>).
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
          Tip: after upload, refresh the homepage (hard refresh if needed).
        </div>
      </div>

      {/* hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {BROKERS.map((b) => (
          <div
            key={b.key}
            className="rounded-2xl border border-zinc-800 bg-black/35 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{b.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{b.file}</div>
              </div>

              <button
                onClick={() => pickFile(b.key)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition"
              >
                Replace logo
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 flex items-center justify-center h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.file}
              alt={b.name}
               className="max-h-12 w-auto object-contain"
                   />
            </div>
          </div>
        ))}
      </div>

      {status ? (
        <div className="mt-6 text-sm text-zinc-200">{status}</div>
      ) : null}
    </div>
  );
}