"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginView() {
  return (
    <>
      <section className="w-full h-[100dvh] flex flex-col items-center">
        <div className="w-full max-w-2xl bg-[#eee] h-[100dvh] flex flex-col items-center justify-center">
          <Image
            src="/images/smasa.webp"
            alt="logo smasa"
            width={200}
            height={200}
          />
          <h1 className="text-blue-500 text-4xl">
            Smasa <span className="text-orange-300">E-Ticket</span>
          </h1>
          <p className="text-xl">Admin Panel</p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/admin" })}
            className="bg-gray-300 p-2 px-4 rounded-md mt-15 cursor-pointer hover:bg-gray-300/70"
          >
            Login With Google
          </button>
        </div>
      </section>
    </>
  );
}
