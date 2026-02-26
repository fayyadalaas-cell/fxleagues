"use client";

import { useState } from "react";

type Broker = {
  id: number;
  name: string;
  logo: string;
  active: boolean;
};

export default function AdminBrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([
    { id: 1, name: "Exness", logo: "/brokers/exness.png", active: true },
    { id: 2, name: "IC Markets", logo: "/brokers/icmarkets.png", active: true },
    { id: 3, name: "Vantage", logo: "/brokers/vantage.png", active: true },
    { id: 4, name: "FXTM", logo: "/brokers/fxtm.png", active: true },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Brokers</h1>

      <div className="space-y-4">
        {brokers.map((broker) => (
          <div
            key={broker.id}
            className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={broker.logo}
                alt={broker.name}
                className="h-10 object-contain bg-white rounded px-2"
              />
              <div>
                <div className="font-semibold">{broker.name}</div>
                <div className="text-xs text-zinc-400">
                  {broker.active ? "Active on homepage" : "Hidden"}
                </div>
              </div>
            </div>

            <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}