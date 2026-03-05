import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const headers = req.headers;

  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    "CA";

  return NextResponse.json({
    country,
  });
}