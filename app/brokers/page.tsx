import type { Metadata } from "next";
import BrokersClient from "./BrokersClient";

export const metadata: Metadata = {
  title: "Trusted Brokers for Forex Contests",
  description:
    "Discover brokers supported for Forex Leagues tournaments. Compare platforms, rules, and trading conditions before you compete.",
  openGraph: {
    title: "Trusted Brokers for Forex Contests",
    description:
      "Compare trusted brokers and pick the right platform for Forex Leagues tournaments.",
    url: "https://forexleagues.com/brokers",
    siteName: "FX Leagues",
    type: "website",
  },
};

export default function Page() {
  return <BrokersClient />;
}