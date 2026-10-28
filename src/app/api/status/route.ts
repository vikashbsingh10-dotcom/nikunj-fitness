import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isResendConfigured } from "@/lib/resend";

export async function GET() {
  const supabaseReady = isSupabaseConfigured();
  const resendReady = isResendConfigured();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    system: "Nikunj Fitness API",
    services: {
      supabase: {
        configured: supabaseReady,
        mode: supabaseReady ? "cloud_postgresql" : "mock_hybrid_store",
        host: process.env.NEXT_PUBLIC_SUPABASE_URL || "not_configured",
      },
      resend: {
        configured: resendReady,
        mode: resendReady ? "live_email_delivery" : "simulated_console_preview",
        from: process.env.RESEND_FROM_EMAIL || "Nikunj Fitness <onboarding@resend.dev>",
      },
      environment: process.env.NODE_ENV || "development",
    },
  });
}

