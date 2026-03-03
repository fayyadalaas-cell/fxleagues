import type { Metadata } from "next";
import ScheduleClient from "./ScheduleClient";

export const metadata: Metadata = {
  title: "Upcoming Forex Tournaments & Schedule",
  description:
    "Explore upcoming forex tournaments, start times, prize pools, and formats. Join the next contest and compete on the leaderboard.",
  openGraph: {
    title: "Upcoming Forex Tournaments & Schedule",
    description:
      "See upcoming contests, start times, prize pools, and tournament formats on Forex Leagues.",
    url: "https://forexleagues.com/schedule",
    siteName: "FX Leagues",
    type: "website",
  },
};

export default function Page() {
  return <ScheduleClient />;
}