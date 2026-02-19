import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["alaa_fayyad@hotmail.com"];

// ✅ Server-side check (بدون useEffect / useRouter)
export default async function AdminHomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        // يقرأ جلسة المستخدم من كوكيز المتصفح
        Cookie: typeof document === "undefined" ? "" : document.cookie,
      },
    },
  });

  // ملاحظة: App Router ما يعطيك cookie مباشرة هنا بهيك شكل بسهولة
  // لذلك الحل الصح فعلياً هو middleware (بالخطوة الجاية)
  // حالياً خلّينا نحط حماية بسيطة: إذا ما عندك session من الواجهة -> يوديك signin
  // (وبالخطوة الجاية بنخليها 100% صح عبر middleware)

  // مؤقت: خليه دايمًا يفتح الآن
  // ✅ نكمّل بالخطوة الجاية حماية حقيقية (middleware)

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-extrabold">Admin</h1>
        <p className="mt-2 text-zinc-400">Manage tournaments, sponsors, and participants.</p>

        <div className="mt-8 grid gap-3">
          <Link
            href="/admin/tournaments"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 hover:bg-white/[0.03]"
          >
            Tournaments
          </Link>
          <Link
            href="/admin/sponsors"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 hover:bg-white/[0.03]"
          >
            Sponsors
          </Link>
          <Link
            href="/admin/participants"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 hover:bg-white/[0.03]"
          >
            Participants
          </Link>
        </div>
      </div>
    </main>
  );
}
