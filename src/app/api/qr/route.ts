import verifyToken from "@/app/components/hooks/verifyToken/verifyToken";
import { QrCodeInterface } from "@/app/components/interfaces/qrCode";
import { retrieveDataByField, updateData } from "@/libs/firebase/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1] ?? "";
    await verifyToken(token, true);
    const qrCode = req.nextUrl.searchParams.get("qrCode");
    if (qrCode) {
      const res: QrCodeInterface[] = (await retrieveDataByField(
        "qr_detail",
        "qr_code",
        qrCode
      )) as QrCodeInterface[];

      if (res.length === 0) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }

      const data: QrCodeInterface = res[0];
      if (data.isScanned === false && data.scanned_at === "-") {
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
        const dataTemp = { ...data };
        dataTemp.isScanned = true;

        try {
          await updateData("qr_detail", data.id!, dataTemp);
          return NextResponse.json(data, { status: 200 });
        } catch {
          await updateData("qr_detail", data.id!, data);
          return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(data, { status: 200 });
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
