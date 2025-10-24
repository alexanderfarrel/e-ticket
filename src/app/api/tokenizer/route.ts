import { NextRequest, NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import validator from "validator";
import { db } from "@/libs/firebase/admin";

const snap = new Midtrans.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
});

export async function POST(req: NextRequest) {
  try {
    const { orderId, eventId, productName, price, quantity, names, email } =
      await req.json();
    const usernameRegex = /^[a-zA-Z0-9 ]{3,50}$/;
    for (const name of names) {
      if (!usernameRegex.test(name)) {
        return NextResponse.json(
          { message: "Invalid username" },
          { status: 400 }
        );
      }
    }

    const trimmedNames = names.map((n: string) => n.trim());

    if (!validator.isEmail(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const existingPayment = await db
      .collection("payment_status")
      .where("order_id", "==", orderId)
      .limit(1)
      .get();

    if (!existingPayment.empty) {
      return NextResponse.json(
        { message: "Duplicate order ID" },
        { status: 400 }
      );
    }

    const result = await db.runTransaction(async (transaction) => {
      const eventRef = db.collection("event").doc(eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventDoc.data();
      if (!eventData) {
        throw new Error("Event data missing");
      }

      if (eventData.ticket - quantity < 0) {
        throw new Error("Ticket not enough");
      }

      transaction.update(eventRef, { ticket: eventData.ticket - quantity });

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: price * quantity,
        },
        item_details: [
          {
            name: productName,
            price,
            quantity,
          },
        ],
        customer_details: {
          first_name: trimmedNames[0],
          email,
        },
      };

      try {
        const token = await snap.createTransaction(parameter);

        const paymentRef = db.collection("payment_status").doc(orderId);
        transaction.set(paymentRef, {
          status: "pending",
          name: trimmedNames,
          email,
          order_id: orderId,
          event_id: eventId,
          ticket: quantity,
          event_name: productName,
          createdAt: new Date(),
        });

        return { token };
      } catch (err: unknown) {
        transaction.update(eventRef, { ticket: eventData.ticket });
        if (
          typeof err === "object" &&
          err !== null &&
          "ApiResponse" in err &&
          (err as { ApiResponse: { error_messages: string[] } }).ApiResponse
            .error_messages?.[0] === "customer_details.email format is invalid"
        ) {
          throw new Error("Invalid email");
        }
        throw new Error("Midtrans transaction failed");
      }
    });

    return NextResponse.json(result, { status: 200 });
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
