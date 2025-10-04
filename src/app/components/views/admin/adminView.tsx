"use client";
import Image from "next/image";
import AdminLayout from "../../layouts/admin/adminLayout";
import { signOut, useSession } from "next-auth/react";
import { SessionInterface } from "../../interfaces/session";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/libs/firebase/init";
import { useEffect } from "react";

export default function AdminView() {
  const { data } = useSession();
  const session: SessionInterface = data as SessionInterface;

  useEffect(() => {
    if (!session?.user?.id) return;

    const unsub = onSnapshot(
      doc(firestore, "users", session.user.id),
      (snapshot) => {
        const data = snapshot.data();
        if (data && data.role !== "admin") {
          signOut();
          window.location.href = "/auth/login";
        }
      }
    );

    return () => unsub();
  }, [session?.user?.id]);

  return (
    <AdminLayout isFixHeight name={session?.user?.name}>
      <div className="h-[100dvh] w-full flex flex-col items-center">
        <Image
          src="/images/smasa.webp"
          alt="logo smasa"
          width={200}
          height={200}
          className="mt-20"
        />
        <button
          onClick={() => (window.location.href = "/admin/scan")}
          className="mt-auto p-5 w-[200px] h-[200px] bg-green-400 rounded-xl text-xl cursor-pointer"
        >
          Scan Ticket
        </button>
        <button
          onClick={() => (window.location.href = "/admin/event")}
          className="bg-blue-500 my-auto px-5 py-2 text-white rounded-full cursor-pointer"
        >
          Event List
        </button>
      </div>
    </AdminLayout>
  );
}
