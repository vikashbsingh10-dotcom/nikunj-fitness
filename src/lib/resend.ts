import { Resend } from "resend";

export function isResendConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  return Boolean(apiKey && !apiKey.includes("your-resend-api-key") && apiKey.startsWith("re_"));
}

export function getResendClient(): Resend | null {
  if (!isResendConfigured()) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Nikunj Fitness <onboarding@resend.dev>";

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  isSimulated?: boolean;
  error?: string;
}

/**
 * 1. Send Welcome & Membership Confirmation Email
 */
export async function sendWelcomeEmail({
  to,
  name,
  planName,
  startDate,
  endDate,
  gymName = "Nikunj Fitness Club",
}: {
  to: string;
  name: string;
  planName: string;
  startDate: string;
  endDate: string;
  gymName?: string;
}): Promise<SendEmailResult> {
  const subject = `Welcome to ${gymName}! Membership Confirmed`;
  const resend = getResendClient();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0; }
          .container { max-width: 560px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; }
          .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
          .badge { display: inline-block; background: #10b981; color: #022c22; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 12px; }
          .card { background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 18px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a2438; font-size: 14px; }
          .row:last-child { border-bottom: none; }
          .label { color: #94a3b8; }
          .val { font-weight: 600; color: #f8fafc; }
          .button { display: block; text-align: center; background: #3b82f6; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; margin-top: 24px; }
          .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Registration Complete</span>
            <h1 class="title">Welcome, ${name}!</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Your gym membership is officially active.</p>
          </div>
          <p>We're thrilled to have you join ${gymName}. Here is a summary of your membership details:</p>
          <div class="card">
            <div class="row">
              <span class="label">Plan</span>
              <span class="val">${planName}</span>
            </div>
            <div class="row">
              <span class="label">Start Date</span>
              <span class="val">${startDate}</span>
            </div>
            <div class="row">
              <span class="label">Valid Until</span>
              <span class="val">${endDate}</span>
            </div>
            <div class="row">
              <span class="label">Status</span>
              <span class="val" style="color: #10b981;">Active</span>
            </div>
          </div>
          <p style="font-size: 14px; color: #cbd5e1;">To check in at the front desk, just provide your name or registered phone number.</p>
          <div class="footer">
            <p>${gymName} • Fitness & Wellness</p>
            <p>If you have any questions, reach out to our staff at any time.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[RESEND SIMULATION] Welcome email to ${to}: ${subject}`);
    return { success: true, isSimulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resend sendWelcomeEmail error:", message);
    return { success: false, error: message };
  }
}

/**
 * 2. Send Payment Receipt Email
 */
export async function sendReceiptEmail({
  to,
  name,
  planName,
  amount,
  receiptNumber,
  paymentMethod,
  paymentDate,
  gymName = "Nikunj Fitness Club",
}: {
  to: string;
  name: string;
  planName: string;
  amount: number;
  receiptNumber: string;
  paymentMethod: string;
  paymentDate: string;
  gymName?: string;
}): Promise<SendEmailResult> {
  const subject = `Payment Receipt #${receiptNumber} - ${gymName}`;
  const resend = getResendClient();

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0; }
          .container { max-width: 560px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; }
          .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
          .badge { display: inline-block; background: #0284c7; color: #ffffff; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 12px; }
          .amount-box { text-align: center; margin: 24px 0; background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; }
          .amount-val { font-size: 32px; font-weight: 800; color: #10b981; }
          .card { background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 18px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a2438; font-size: 14px; }
          .row:last-child { border-bottom: none; }
          .label { color: #94a3b8; }
          .val { font-weight: 600; color: #f8fafc; }
          .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Official Receipt</span>
            <h1 class="title">Payment Confirmed</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Thank you for your payment, ${name}.</p>
          </div>
          <div class="amount-box">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Total Paid</div>
            <div class="amount-val">${formattedAmount}</div>
          </div>
          <div class="card">
            <div class="row">
              <span class="label">Receipt Number</span>
              <span class="val">${receiptNumber}</span>
            </div>
            <div class="row">
              <span class="label">Description</span>
              <span class="val">${planName} Membership</span>
            </div>
            <div class="row">
              <span class="label">Payment Date</span>
              <span class="val">${paymentDate}</span>
            </div>
            <div class="row">
              <span class="label">Payment Method</span>
              <span class="val" style="text-transform: capitalize;">${paymentMethod.replace(/_/g, " ")}</span>
            </div>
            <div class="row">
              <span class="label">Payment Status</span>
              <span class="val" style="color: #10b981;">Paid in Full</span>
            </div>
          </div>
          <div class="footer">
            <p>${gymName} • Billing & Finance</p>
            <p>Please retain this receipt for your personal tax or reimbursement records.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[RESEND SIMULATION] Payment receipt to ${to}: ${subject}`);
    return { success: true, isSimulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resend sendReceiptEmail error:", message);
    return { success: false, error: message };
  }
}

/**
 * 3. Send Membership Renewal Reminder Email
 */
export async function sendRenewalReminderEmail({
  to,
  name,
  planName,
  endDate,
  daysRemaining,
  gymName = "Nikunj Fitness Club",
}: {
  to: string;
  name: string;
  planName: string;
  endDate: string;
  daysRemaining: number;
  gymName?: string;
}): Promise<SendEmailResult> {
  const isExpired = daysRemaining < 0;
  const subject = isExpired
    ? `Your ${gymName} Membership has expired - Renew today`
    : `Friendly Reminder: Your ${gymName} Membership expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;

  const resend = getResendClient();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0; }
          .container { max-width: 560px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; }
          .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
          .badge { display: inline-block; background: ${isExpired ? "#ef4444" : "#f59e0b"}; color: #ffffff; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 12px; }
          .card { background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 18px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a2438; font-size: 14px; }
          .row:last-child { border-bottom: none; }
          .label { color: #94a3b8; }
          .val { font-weight: 600; color: #f8fafc; }
          .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">${isExpired ? "Membership Expired" : "Expiring Soon"}</span>
            <h1 class="title">Stay on track, ${name}!</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">
              ${isExpired ? `Your membership ended on ${endDate}.` : `Your membership will end on ${endDate} (${daysRemaining} days left).`}
            </p>
          </div>
          <p>Don't pause your fitness momentum! Renew your membership to enjoy uninterrupted facility access, locker privileges, and coaching sessions.</p>
          <div class="card">
            <div class="row">
              <span class="label">Current Plan</span>
              <span class="val">${planName}</span>
            </div>
            <div class="row">
              <span class="label">Expiration Date</span>
              <span class="val" style="color: ${isExpired ? "#ef4444" : "#f59e0b"};">${endDate}</span>
            </div>
            <div class="row">
              <span class="label">Status</span>
              <span class="val">${isExpired ? "Expired" : "Expiring Soon"}</span>
            </div>
          </div>
          <p style="font-size: 14px; color: #cbd5e1;">You can renew quickly at the front desk or reply directly to this email to have our team assist you.</p>
          <div class="footer">
            <p>${gymName} • Member Services</p>
            <p>Thank you for being a valued part of our fitness community!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[RESEND SIMULATION] Renewal reminder to ${to}: ${subject}`);
    return { success: true, isSimulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resend sendRenewalReminderEmail error:", message);
    return { success: false, error: message };
  }
}

