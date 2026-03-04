// app/api/og/tournament/route.ts
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "missing-slug";

  try {
    // ✅ مهم: لا تضع fontFamily: "Arial" الآن
    // لأن أكثر سبب شائع لـ 0 bytes هو مشكلة Fonts في satori
    const img = new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#fff",
            fontSize: 48,
            fontWeight: 700,
            // لا تضع fontFamily هنا
          }}
        >
          TOURNAMENT OG {slug}
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // ✅ إجبار الرندر هنا عشان أي خطأ يظهر ضمن try/catch
    const buf = await img.arrayBuffer();

    return new Response(buf, {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store, max-age=0",
        "content-length": String(buf.byteLength),
      },
    });
  } catch (err: any) {
    return new Response(
      `OG RENDER ERROR:\n${err?.stack || err?.message || String(err)}`,
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }
}