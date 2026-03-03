import type { Metadata } from "next";
import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How Forex Leagues Works",
  description:
    "Learn how to join forex trading contests, submit your demo account, compete fairly, and win prizes with transparent tournament rules.",
  openGraph: {
    title: "How Forex Leagues Works",
    description:
      "Understand the rules, the flow, and how winners are ranked in Forex Leagues tournaments.",
    url: "https://forexleagues.com/how-it-works",
    siteName: "FX Leagues",
    type: "website",
  },
};

export default function Page() {
  return <HowItWorksClient />;
}