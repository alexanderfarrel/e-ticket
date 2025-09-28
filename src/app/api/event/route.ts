import { PaymentStatusInterface } from "@/app/components/interfaces/paymentStatus";
import { db } from "@/libs/firebase/admin";
import {
  retrieveData,
  retrieveDataByFieldAdmin,
  retrieveDataById,
} from "@/libs/firebase/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams.get("id");
  if (searchParams) {
    const data = await retrieveDataById("event", searchParams);
    return NextResponse.json(data);
  }
  const data = await retrieveData("event");
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  try {
    const { order_id } = await req.json();
    const dataPayment = (await retrieveDataByFieldAdmin(
      "payment_status",
      "order_id",
      order_id
    )) as PaymentStatusInterface[];
    if (dataPayment.length === 0 && dataPayment[0].status !== "pending") {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }
    const data = await retrieveDataById("event", dataPayment[0].event_id!);
    if (data) {
      await db
        .collection("event")
        .doc(dataPayment[0].event_id!)
        .update({
          ticket: data.ticket + dataPayment[0].ticket,
        });

      try {
        await db.collection("payment_status").doc(dataPayment[0].id!).delete();
        return NextResponse.json({ message: "Success" }, { status: 200 });
      } catch (error: unknown) {
        if (error instanceof Error) {
          return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json(
          { message: "Something went wrong" },
          { status: 500 }
        );
      }
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
