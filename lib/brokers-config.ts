export type BrokerKey = "exness" | "icmarkets" | "vantage" | "fxtm";

export type BrokerConfig = {
  key: BrokerKey;
  name: string;
  logo: string;   // from /public
  href: string;   // where to go when clicked
  newTab: boolean;
  regulated?: boolean;
};

export const BROKERS_CONFIG: BrokerConfig[] = [
  {
    key: "exness",
    name: "Exness",
    logo: "/brokers/exness.png",
    href: "/brokers#exness",     // ✅ غيّرها لاحقًا لأي رابط
    newTab: true,
    regulated: true,
  },
  {
    key: "icmarkets",
    name: "IC Markets",
    logo: "/brokers/icmarkets.png",
    href: "/brokers#icmarkets",
    newTab: true,
    regulated: true,
  },
  {
    key: "vantage",
    name: "Vantage",
    logo: "/brokers/vantage.png",
    href: "/brokers#vantage",
    newTab: true,
    regulated: true,
  },
  {
    key: "fxtm",
    name: "FXTM",
    logo: "/brokers/fxtm.png",
    href: "/brokers#fxtm",
    newTab: true,
    regulated: true,
  },
];