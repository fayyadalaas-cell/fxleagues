export type BrokerKey = "exness" | "icmarkets" | "vantage" | "fxtm";

export type Broker = {
  key: BrokerKey;
  name: string;
  logo: string;
  regulated: string;
  minDeposit: string;
  spreadFrom: string;
  platforms: string;
  short: string;
  demoUrl: string;
  realUrl: string;
};

export const BROKERS: Broker[] = [
  {
    key: "exness",
    name: "Exness",
    logo: "/brokers/exness.png",
    regulated: "FCA / CySEC (varies by region)",
    minDeposit: "$10+",
    spreadFrom: "0.0 pips",
    platforms: "MT4 / MT5",
    short: "Fast execution and flexible account types.",
    demoUrl: "#",
    realUrl: "#",
  },
  {
    key: "icmarkets",
    name: "IC Markets",
    logo: "/brokers/icmarkets.png",
    regulated: "ASIC / CySEC (varies by region)",
    minDeposit: "$200+",
    spreadFrom: "0.0 pips",
    platforms: "MT4 / MT5 / cTrader",
    short: "Raw spreads with strong liquidity.",
    demoUrl: "#",
    realUrl: "#",
  },
  {
    key: "vantage",
    name: "Vantage",
    logo: "/brokers/vantage.png",
    regulated: "ASIC / CIMA (varies by region)",
    minDeposit: "$50+",
    spreadFrom: "0.0–1.0 pips",
    platforms: "MT4 / MT5",
    short: "Competitive pricing and global presence.",
    demoUrl: "#",
    realUrl: "#",
  },
  {
    key: "fxtm",
    name: "FXTM",
    logo: "/brokers/fxtm.png",
    regulated: "FCA / CySEC (varies by region)",
    minDeposit: "$10+",
    spreadFrom: "1.0 pips",
    platforms: "MT4 / MT5",
    short: "Established broker with flexible options.",
    demoUrl: "#",
    realUrl: "#",
  },
];