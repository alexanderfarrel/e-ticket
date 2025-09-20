"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="font-semibold text-red-600 text-[4rem] leading-[2.2rem]">
          403
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          Not Authorized
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          {`Sorry, you are not authorized to access this page.`}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-blue-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Go back home
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm font-semibold text-gray-900 cursor-pointer"
          >
            Logout <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </main>
  );
}
