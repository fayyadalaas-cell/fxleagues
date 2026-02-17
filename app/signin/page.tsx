import { Suspense } from "react";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
