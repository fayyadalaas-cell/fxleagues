import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextUrl = typeof searchParams?.next === "string" ? searchParams.next : "/";

  return <SignInClient nextUrl={nextUrl} />;
}
