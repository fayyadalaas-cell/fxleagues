import { Suspense } from "react";
import VerifyPhoneClient from "./VerifyPhoneClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyPhoneClient />
    </Suspense>
  );
}