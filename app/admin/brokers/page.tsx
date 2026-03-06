"use client";

import { useEffect, useRef, useState } from "react";

type BrokerKey = "exness" | "icmarkets" | "vantage" | "fxtm";

const BROKERS: { key: BrokerKey; name: string; file: string }[] = [
  { key: "exness", name: "Exness", file: "/brokers/exness.png" },
  { key: "icmarkets", name: "IC Markets", file: "/brokers/icmarkets.png" },
  { key: "vantage", name: "Vantage", file: "/brokers/vantage.png" },
  { key: "fxtm", name: "FXTM", file: "/brokers/fxtm.png" },
];

type BrokerForm = {
  name: string;
  demo_url: string;
  real_url: string;
  logo_path: string;
  saving: boolean;
  savedMsg?: string;
};

export default function AdminBrokersPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<BrokerKey>("exness");
  const [status, setStatus] = useState<string>("");

  // ✅ forms per broker
  const [forms, setForms] = useState<Record<BrokerKey, BrokerForm>>({
  exness: {
    name: "Exness",
    demo_url: "",
    real_url: "",
    logo_path: "/brokers/exness.png",
    saving: false,
  },
  icmarkets: {
    name: "IC Markets",
    demo_url: "",
    real_url: "",
    logo_path: "/brokers/icmarkets.png",
    saving: false,
  },
  vantage: {
    name: "Vantage",
    demo_url: "",
    real_url: "",
    logo_path: "/brokers/vantage.png",
    saving: false,
  },
  fxtm: {
    name: "FXTM",
    demo_url: "",
    real_url: "",
    logo_path: "/brokers/fxtm.png",
    saving: false,
  },
});

  // ✅ load current values from DB once
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/admin/homepage-brokers", {
          method: "GET",
        });

        // لو ما عملنا GET endpoint، بنقرأ مباشرة من supabase public؟ لا.
        // لذلك: بدل GET، نجيب البيانات من الصفحة العامة عبر supabase؟ (مش متاح هنا)
        // ✅ الحل: نستعمل supabase client مباشرة هنا.
      } catch {
        // ignore
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ تحميل القيم من supabase مباشرة (أفضل وأبسط)
  useEffect(() => {
    let mounted = true;

    async function loadFromDb() {
      try {
        const { supabase } = await import("@/lib/supabase/client");
        const { data, error } = await supabase
          .from("homepage_brokers")
          .select("key,name,demo_url,real_url,logo_path")
          .in(
            "key",
            BROKERS.map((b) => b.key)
          );

        if (!mounted) return;

        if (error) {
          console.error("Load brokers error:", error.message);
          return;
        }

        if (data && data.length) {
          setForms((prev) => {
            const next = { ...prev };
            for (const row of data as any[]) {
              const k = row.key as BrokerKey;
              if (!next[k]) continue;
              next[k] = {
              ...next[k],
              name: row.name ?? next[k].name,
              demo_url: row.demo_url ?? "",
              real_url: row.real_url ?? "",
              logo_path: row.logo_path ?? next[k].logo_path,
              savedMsg: undefined,
             };
            }
            return next;
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadFromDb();
    return () => {
      mounted = false;
    };
  }, []);

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
        setStatus("✅ Updated. Refresh homepage to see it.");
      }
    } catch (err: any) {
      setStatus(`❌ ${err?.message ?? "Upload failed"}`);
    } finally {
      e.target.value = "";
    }
  }

  function updateField(key: BrokerKey, field: "name" | "demo_url" | "real_url", value: string) {
    setForms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
        savedMsg: undefined,
      },
    }));
  }

  async function saveBroker(key: BrokerKey) {
    setForms((prev) => ({
      ...prev,
      [key]: { ...prev[key], saving: true, savedMsg: undefined },
    }));

    const payload = {
  key,
  name: forms[key].name,
  demo_url: forms[key].demo_url || null,
  real_url: forms[key].real_url || null,
  logo_path: forms[key].logo_path || null,
};

    try {
      const res = await fetch("/api/admin/homepage-brokers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setForms((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            saving: false,
            savedMsg: `❌ ${data?.error ?? "Save failed"}`,
          },
        }));
        return;
      }

      setForms((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          saving: false,
          savedMsg: "✅ Saved",
        },
      }));
    } catch (err: any) {
      setForms((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          saving: false,
          savedMsg: `❌ ${err?.message ?? "Save failed"}`,
        },
      }));
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
        {BROKERS.map((b) => {
          const f = forms[b.key];
          return (
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
    src={(f?.logo_path || b.file)}
    alt={f?.name || b.name}
    className="max-h-12 w-auto object-contain"
  />
</div>

              {/* ✅ NEW: Editable fields */}
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div>
                  <div className="text-xs text-zinc-400 mb-1">Broker name</div>
                  <input
                    value={f?.name ?? ""}
                    onChange={(e) => updateField(b.key, "name", e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
                    placeholder="Exness"
                  />
                </div>

                <div>
                  <div className="text-xs text-zinc-400 mb-1">Demo URL</div>
                  <input
                    value={f?.demo_url ?? ""}
                    onChange={(e) => updateField(b.key, "demo_url", e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <div className="text-xs text-zinc-400 mb-1">Real URL</div>
                  <input
                    value={f?.real_url ?? ""}
                    onChange={(e) => updateField(b.key, "real_url", e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
                    placeholder="https://..."
                  />
                </div>

                <div>
                <div className="text-xs text-zinc-400 mb-1">Logo URL (or /brokers/*.png)</div>
                <input
                value={(f as any)?.logo_path ?? ""}
                onChange={(e) =>
                 setForms((prev) => ({
                  ...prev,
                 [b.key]: { ...prev[b.key], logo_path: e.target.value, savedMsg: undefined },
                   }))
                    }
                   className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/50"
                   placeholder="https://.../logo.png OR /brokers/vantage.png"
                       />
                        </div>

                <div className="flex items-center justify-between gap-3 mt-1">
                  <button
                    onClick={() => saveBroker(b.key)}
                    disabled={f?.saving}
                    className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-500/15 transition disabled:opacity-60"
                  >
                    {f?.saving ? "Saving..." : "Save"}
                  </button>

                  <div className="text-xs text-zinc-300">
                    {f?.savedMsg ? f.savedMsg : ""}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {status ? (
        <div className="mt-6 text-sm text-zinc-200">{status}</div>
      ) : null}
    </div>
  );
}