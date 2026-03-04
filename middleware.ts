import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // ✅ لا تلمس API ولا ملفات OG image routes
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.includes("/opengraph-image")
  ) {
    return NextResponse.next();
  }

  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // يثبت/يحدث session cookies على كل request (لـ pages فقط)
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: [
    // شغّل الميدل وير على كل شيء ما عدا /api وملفات ثابتة
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};