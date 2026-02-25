import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};

  // ✅ بدل ما يكون الافتراضي "/" خلّيه account
  const nextUrl =
    typeof sp.next === "string" && sp.next.length > 0 ? sp.next : "/account";

  // ✅ إذا المستخدم مسجل دخول بالفعل، حوله مباشرة
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextUrl);
  }

  return <SignInClient nextUrl={nextUrl} />;
}