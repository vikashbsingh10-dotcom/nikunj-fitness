"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useToast } from "../ui/toast-context";
import {
  Database,
  Mail,
  Globe,
  GitBranch,
  CheckCircle2,
  Copy,
  Terminal,
  Send,
  RotateCw,
} from "lucide-react";

export function SupabaseResendStatus() {
  const { toast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("admin@example.com");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [statusData, setStatusData] = useState<{
    services?: {
      supabase: { configured: boolean; mode: string };
      resend: { configured: boolean; mode: string };
    };
  } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setStatusData(data))
      .catch((e) => console.log("Status fetch notice:", e));
  }, []);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setIsTestingEmail(true);
    try {
      const res = await fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          name: "Test Administrator",
          planName: "Elite Annual VIP",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.sandboxForwarded) {
          toast.info(
            "Test Email Routed (Resend Sandbox)",
            "Delivered to your verified owner inbox (vikashbsingh10@gmail.com). To send to other emails, verify a domain at resend.com/domains."
          );
        } else if (data.isSimulated) {
          toast.success(
            "Test Email Dispatched!",
            "Mode: Simulated preview. Add RESEND_API_KEY in .env.local to send to real mailboxes."
          );
        } else {
          toast.success(
            "Test Email Dispatched!",
            `Delivered via Resend to ${testEmail}`
          );
        }
      } else {
        toast.error("Test email failed", data.error);
      }
    } catch {
      toast.error("Network error executing test");
    } finally {
      setIsTestingEmail(false);
    }
  };

  const envSampleText = `# Supabase Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend Email Service Configuration
RESEND_API_KEY=re_123456789abcdef...
RESEND_FROM_EMAIL=Nikunj Fitness <onboarding@resend.dev>

# Production App URL
NEXT_PUBLIC_APP_URL=https://nikunjfitness.com`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">System Integration & Cloud Deployment</h2>
        <p className="text-xs text-slate-500">
          Supabase PostgreSQL, Resend email workflows, Vercel custom domains, and GitHub repository sync
        </p>
      </div>

      {/* Connection Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supabase Status */}
        <Card className="p-5 border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supabase PostgreSQL</h3>
                <p className="text-xs text-slate-500">Database, RLS Security & Storage</p>
              </div>
            </div>
            <Badge
              variant={statusData?.services?.supabase.configured ? "success" : "secondary"}
              className="text-[10px]"
            >
              {statusData?.services?.supabase.configured ? "Connected" : "Local / Seed Mode"}
            </Badge>
          </div>
          <p className="mt-4 text-xs text-slate-600 leading-relaxed">
            {statusData?.services?.supabase.configured
              ? "All member tables, payments, and attendance are syncing directly with your Supabase cloud PostgreSQL database."
              : "Currently operating with local client-side persistent seed storage. Add your Supabase keys in .env.local to instantly switch to cloud PostgreSQL!"}
          </p>
        </Card>

        {/* Resend Status */}
        <Card className="p-5 border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Resend Email Gateway</h3>
                <p className="text-xs text-slate-500">Confirmation, Invoices & Renewal Notices</p>
              </div>
            </div>
            <Badge
              variant={statusData?.services?.resend.configured ? "success" : "secondary"}
              className="text-[10px]"
            >
              {statusData?.services?.resend.configured ? "Live Delivery" : "Simulation Mode"}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email to test..."
              className="text-xs h-8"
            />
            <Button
              size="sm"
              onClick={handleTestEmail}
              disabled={isTestingEmail}
              className="text-xs h-8 gap-1.5 shrink-0"
            >
              {isTestingEmail ? <RotateCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Send Test
            </Button>
          </div>
        </Card>
      </div>

      {/* Deployment & Setup Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Supabase Setup */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-bold">1. Supabase Setup Instructions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs text-slate-600 space-y-3">
            <ol className="list-decimal pl-4 space-y-2">
              <li>
                Create a free project at{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  supabase.com
                </a>
                .
              </li>
              <li>
                Go to <strong>SQL Editor</strong> in your Supabase Dashboard.
              </li>
              <li>
                Copy the contents of <code className="bg-slate-100 px-1 py-0.5 rounded">supabase/schema.sql</code> and
                click <strong>Run</strong>. This creates all tables, RLS policies, status trigger functions, and indexes.
              </li>
              <li>
                Copy your <strong>Project URL</strong> and <strong>Anon Key</strong> from Project Settings &gt; API into
                your <code className="bg-slate-100 px-1 py-0.5 rounded">.env.local</code>.
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* 2. Resend Setup */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-bold">2. Resend Setup Instructions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs text-slate-600 space-y-3">
            <ol className="list-decimal pl-4 space-y-2">
              <li>
                Sign up at{" "}
                <a
                  href="https://resend.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  resend.com
                </a>{" "}
                and generate an API key.
              </li>
              <li>
                Set <code className="bg-slate-100 px-1 py-0.5 rounded">RESEND_API_KEY=re_...</code> in your{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded">.env.local</code>.
              </li>
              <li>
                <strong>Free Sandbox Mode:</strong> Uses <code className="bg-slate-100 px-1 py-0.5 rounded">onboarding@resend.dev</code>. By Resend security policy, emails in sandbox mode are routed to your verified owner address (<code className="bg-slate-100 px-1 py-0.5 rounded">vikashbsingh10@gmail.com</code>).
              </li>
              <li>
                <strong>Sending Directly to Members:</strong> Go to <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">resend.com/domains</a>, add your custom domain (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded">nikunjfitness.com</code>), and add the DNS records in your domain provider. Once verified, emails will go directly to each member&apos;s email address!
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* 3. Vercel & Custom Domain */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-bold">3. Vercel Deployment & Custom Domain</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs text-slate-600 space-y-3">
            <ol className="list-decimal pl-4 space-y-2">
              <li>
                Import your GitHub repository into{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  vercel.com
                </a>
                .
              </li>
              <li>
                In <strong>Environment Variables</strong>, add your Supabase and Resend keys.
              </li>
              <li>
                Click <strong>Deploy</strong>. Vercel builds the Next.js App Router project automatically.
              </li>
              <li>
                In Vercel Dashboard &gt; <strong>Settings &gt; Domains</strong>, add your custom domain (e.g.,{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded">gym.yourbrand.com</code>) and add the CNAME record in your DNS provider.
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* 4. GitHub Workflow */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-bold">4. GitHub Version Control</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs text-slate-600 space-y-3">
            <p>Every commit pushed to <code className="bg-slate-100 px-1 py-0.5 rounded">main</code> triggers automatic preview or production deployment on Vercel.</p>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1">
              <div>git add .</div>
              <div>git commit -m &quot;feat: gym membership system&quot;</div>
              <div>git remote add origin https://github.com/username/gym-management.git</div>
              <div>git push -u origin main</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables Reference */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Terminal className="h-4 w-4" /> Environment Variables (.env.example)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(envSampleText, "env")}
            className="text-xs h-7 gap-1"
          >
            {copiedSection === "env" ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            {copiedSection === "env" ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
            {envSampleText}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

