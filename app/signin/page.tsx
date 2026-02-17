import { Suspense } from "react";
import SignInClient from "./SignInClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignInClient />
    </Suspense>
  );
}
