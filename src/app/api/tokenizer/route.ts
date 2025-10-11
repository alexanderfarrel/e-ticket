import { NextRequest, NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import validator from "validator";
import { db } from "@/libs/firebase/admin";

const snap = new Midtrans.Snap({
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
});

export async function POST(req: NextRequest) {
  try {
    const { orderId, eventId, productName, price, quantity, name, email } =
      await req.json();
    const usernameRegex = /^[a-zA-Z0-9 ]{3,50}$/;
    if (!usernameRegex.test(name)) {
      return NextResponse.json(
        { message: "Invalid username" },
        { status: 400 }
      );
    }

    const trimName: string = name.trim();

    if (!validator.isEmail(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const eventData = await db
      .collection("event")
      .doc(eventId)
      .get()
      .then((doc) => doc.data());

    if (!eventData) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (eventData.ticket - quantity < 0) {
      return NextResponse.json(
        { message: "Ticket not enough" },
        { status: 400 }
      );
    }

    const newTicket = eventData.ticket - quantity;
    await db.collection("event").doc(eventId).update({
      ticket: newTicket,
    });
    try {
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
          first_name: trimName,
          email,
        },
      };

      const token = await snap.createTransaction(parameter);
      if (token.token) {
        await db.collection("payment_status").add({
          status: "pending",
          name: trimName,
          email,
          order_id: orderId,
          event_id: eventId,
          ticket: quantity,
          event_name: productName,
        });
      }

      return NextResponse.json({ token }, { status: 200 });
    } catch (err: unknown) {
      await db.collection("event").doc(eventId).update({
        ticket: eventData.ticket,
      });
      if (typeof err === "object" && err !== null && "ApiResponse" in err) {
        const apiErr = err as { ApiResponse: { error_messages: string[] } };
        if (
          apiErr.ApiResponse.error_messages[0] ===
          "customer_details.email format is invalid"
        ) {
          return NextResponse.json(
            { message: "Invalid email" },
            { status: 400 }
          );
        }
      }

      if (err instanceof Error) {
        return NextResponse.json({ message: err.message }, { status: 500 });
      }

      return NextResponse.json(
        { message: "Create transaction failed, rollback success" },
        { status: 500 }
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
