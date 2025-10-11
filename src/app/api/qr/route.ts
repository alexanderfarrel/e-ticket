import verifyToken from "@/app/components/hooks/verifyToken/verifyToken";
import { QrCodeInterface } from "@/app/components/interfaces/qrCode";
import { authOptions } from "@/libs/auth/auth";
import { db } from "@/libs/firebase/admin";
import { firestore } from "@/libs/firebase/init";
import { doc, getDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userDoc = await getDoc(doc(firestore, "users", session.user.id));
  if (!userDoc.exists() || userDoc.data().role !== "admin") return null;

  return session;
}

export async function GET(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = req.headers.get("authorization")?.split(" ")[1] ?? "";
    await verifyToken(token, true);
    const qrCode = req.nextUrl.searchParams.get("qrCode");
    if (qrCode) {
      const res = await db
        .collection("qr_detail")
        .where("qr_code", "==", qrCode)
        .get();

      if (res.empty) {
        return NextResponse.json(
          { message: "Barcode Tidak Ditemukan" },
          { status: 404 }
        );
      }

      const doc = res.docs[0];
      const data = {
        id: doc.id,
        ...doc.data(),
      } as QrCodeInterface;
      if (data) {
        if (data.isScanned && data.action !== "Invalid") {
          return NextResponse.json(
            { data, message: "Scanned" },
            { status: 200 }
          );
        }

        const date = new Date();

        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Jakarta",
        };

        const parts = new Intl.DateTimeFormat("id-ID", options).formatToParts(
          date
        );
        const day = parts.find((p) => p.type === "day")?.value;
        const month = parts.find((p) => p.type === "month")?.value;
        const year = parts.find((p) => p.type === "year")?.value;
        const hour = parts.find((p) => p.type === "hour")?.value;
        const minute = parts.find((p) => p.type === "minute")?.value;
        const second = parts.find((p) => p.type === "second")?.value;

        const dateFormat = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

        data.scanned_at = dateFormat;
        data.scanned_by = session?.user?.email || "";
        const { id, ...rest } = data;
        const dataTemp = {
          ...rest,
          isScanned: data.isScanned,
        };
        dataTemp.isScanned = true;

        try {
          await db.collection("qr_detail").doc(data.id!).update(dataTemp);
          return NextResponse.json(
            { data, message: "Unscanned" },
            { status: 200 }
          );
        } catch {
          return NextResponse.json(
            { message: "Failed to update" },
            { status: 500 }
          );
        }
      }
      return NextResponse.json(
        { message: "Barcode Tidak Ditemukan" },
        { status: 404 }
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
