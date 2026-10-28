import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, name, planName, startDate, endDate, gymName } = body;

    if (!to || !name) {
      return NextResponse.json({ error: "Missing required fields: to, name" }, { status: 400 });
    }

    const result = await sendWelcomeEmail({
      to,
      name,
      planName: planName || "Standard Membership",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "N/A",
      gymName: gymName || "Nikunj Fitness Club",
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

