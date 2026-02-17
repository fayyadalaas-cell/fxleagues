"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers";

export default function AuthButtons() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (user) {
    return (
      <>
        <Link
          href="/account"
          className="border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-900 text-sm text-white"
        >
          Account
        </Link>

        <button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition"
        >
          Logout
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/signin"
        className="border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-900 text-sm text-white"
      >
        Sign in
      </Link>

      <Link
        href="/signup"
        className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition"
      >
        Sign up
      </Link>
    </>
  );
}
