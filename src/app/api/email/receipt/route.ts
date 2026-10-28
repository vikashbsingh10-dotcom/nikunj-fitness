import { NextResponse } from "next/server";
import { sendReceiptEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, name, planName, amount, receiptNumber, paymentMethod, paymentDate, gymName } = body;

    if (!to || !amount || !receiptNumber) {
      return NextResponse.json({ error: "Missing required fields: to, amount, receiptNumber" }, { status: 400 });
    }

    const result = await sendReceiptEmail({
      to,
      name: name || "Valued Member",
      planName: planName || "Membership Fee",
      amount: Number(amount),
      receiptNumber,
      paymentMethod: paymentMethod || "card",
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      gymName: gymName || "Apex Performance Club",
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

