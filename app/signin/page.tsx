import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams?.next || "/";
  return <SignInClient nextUrl={next} />;
}
