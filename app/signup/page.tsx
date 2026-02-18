import { Suspense } from "react";
import SignupClient from "./SignupClient";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextUrl = searchParams?.next ?? "/";

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupClient nextUrl={nextUrl} />
    </Suspense>
  );
}
