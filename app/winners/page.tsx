import type { Metadata } from "next";
import WinnersClient from "./WinnersClient";

export const metadata: Metadata = {
  title: "Winners Archive & Leaderboards",
  description:
    "See past tournament winners, performance stats, and leaderboard results across daily, weekly, and special contests.",
  openGraph: {
    title: "Winners Archive & Leaderboards",
    description:
      "Explore winners and leaderboard stats from recent Forex Leagues tournaments.",
    url: "https://forexleagues.com/winners",
    siteName: "FX Leagues",
    type: "website",
  },
};

export default function Page() {
  return <WinnersClient />;
}