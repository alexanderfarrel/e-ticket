import verifyToken from "@/app/components/hooks/verifyToken/verifyToken";
import { QrCodeInterface } from "@/app/components/interfaces/qrCode";
import { db } from "@/libs/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

        // handle user
        if (data.action === "Invalid") {
          return NextResponse.json(
            {
              data,
              message: "User Sudah Pernah Keluar!",
            },
            { status: 400 }
          );
        }

        if (data.action === "Keluar") {
          const dataTemp = {
            ...data,
            isScanned: data.isScanned,
            action: data.action,
          };
          dataTemp.action = "Invalid";
          dataTemp.isScanned = true;

          try {
            await db.collection("qr_detail").doc(data.id!).update(dataTemp);
            return NextResponse.json(
              { data, message: "Scanned" },
              { status: 200 }
            );
          } catch {
            return NextResponse.json(
              { message: "Failed to update" },
              { status: 500 }
            );
          }
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

// export async function PUT(req: NextRequest) {
//   try {
//     const token = req.headers.get("authorization")?.split(" ")[1] ?? "";
//     await verifyToken(token, true);
//     const qrCode = req.nextUrl.searchParams.get("qrCode");

//     if (qrCode) {
//       const res: QrCodeInterface[] = (await retrieveDataByFieldQrCode(
//         "qr_detail",
//         "qr_code",
//         qrCode,
//         true
//       )) as QrCodeInterface[];

//       if (res.length === 0) {
//         return NextResponse.json({ message: "Not found" }, { status: 404 });
//       }

//       const data: QrCodeInterface = res[0];
//       const qrIndex = data.qr_code.findIndex((obj: Record<string, string>) =>
//         Object.values(obj).includes(qrCode)
//       );

//       if (qrIndex !== -1) {
//         const key = Object.keys(data.qr_code[qrIndex])[0];
//         if (
//           data.action[qrIndex][key] === "first scan" &&
//           data.isScanned[qrIndex][key] === false
//         ) {
//           return NextResponse.json(
//             { message: "Belum Pernah di scan!" },
//             { status: 400 }
//           );
//         }
//         if (data.action[qrIndex][key] === "Invalid") {
//           return NextResponse.json(
//             { data, qrIndex, key, message: "Already Exited" },
//             { status: 200 }
//           );
//         }
//         data.isScanned[qrIndex][key] = false;
//         data.action[qrIndex][key] = "Keluar";
//         try {
//           await updateData("qr_detail", data.id!, data);
//           return NextResponse.json({ data, qrIndex, key }, { status: 200 });
//         } catch {
//           await updateData("qr_detail", data.id!, data);
//           return NextResponse.json(
//             { message: "Failed to update" },
//             { status: 500 }
//           );
//         }
//       }

//       return NextResponse.json({ message: "Not found" }, { status: 404 });
//     }
//   } catch (error) {
//     if (error instanceof Error) {
//       return NextResponse.json({ message: error.message }, { status: 500 });
//     }
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }
