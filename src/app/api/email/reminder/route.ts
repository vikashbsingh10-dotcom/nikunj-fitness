import { NextResponse } from "next/server";
import { sendRenewalReminderEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, name, planName, endDate, daysRemaining, gymName } = body;

    if (!to || !name || !endDate) {
      return NextResponse.json({ error: "Missing required fields: to, name, endDate" }, { status: 400 });
    }

    const result = await sendRenewalReminderEmail({
      to,
      name,
      planName: planName || "Gym Plan",
      endDate,
      daysRemaining: typeof daysRemaining === "number" ? daysRemaining : 0,
      gymName: gymName || "Apex Performance Club",
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

