import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Forex Trading Contests & Competitions",
  description:
    "Join global forex trading contests, climb live leaderboards, and win real prizes. Demo-first tournaments built for performance and transparency.",
  openGraph: {
    title: "Forex Trading Contests & Competitions",
    description:
      "Compete in global forex tournaments, climb leaderboards, and win real prizes.",
    url: "https://forexleagues.com",
    siteName: "FX Leagues",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}