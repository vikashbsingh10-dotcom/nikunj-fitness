"use client";

import React, { useState } from "react";
import { Member } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { AlertCircle, Mail, RotateCw, CheckCircle2, Phone, Calendar } from "lucide-react";
import { useToast } from "../ui/toast-context";

interface ExpiringMembersAlertProps {
  members: Member[];
  onRenewMember: (member: Member) => void;
  onRefresh: () => void;
}

export function ExpiringMembersAlert({
  members,
  onRenewMember,
  onRefresh,
}: ExpiringMembersAlertProps) {
  const { toast } = useToast();
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Filter members expiring soon or expired
  const expiringOrExpired = members.filter(
    (m) => m.status === "expiring" || m.status === "expired"
  );

  const handleSendReminder = async (member: Member) => {
    setSendingId(member.id);
    const days = getDaysRemaining(member.end_date);

    try {
      const res = await fetch("/api/email/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: member.email,
          name: member.full_name,
          planName: member.plan?.name || "Membership",
          endDate: formatDate(member.end_date),
          daysRemaining: days,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          `Renewal reminder sent to ${member.full_name}`,
          data.isSimulated
            ? "(Simulated: Resend API key will deliver to live inbox)"
            : `Delivered via Resend to ${member.email}`
        );
      } else {
        toast.error("Failed to send reminder email", data.error || "Please check Resend configuration.");
      }
    } catch {
      toast.error("Network error sending renewal reminder");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Card className="border-amber-200/70 bg-gradient-to-b from-amber-50/30 to-transparent">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Expiry Tracking & Renewal Alerts</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {expiringOrExpired.length} members require renewal attention
            </p>
          </div>
        </div>
        <Badge variant="warning" className="text-xs">
          Active Watchlist
        </Badge>
      </CardHeader>
      <CardContent>
        {expiringOrExpired.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
            No expiring or expired memberships right now. All accounts in good standing!
          </div>
        ) : (
          <div className="space-y-3">
            {expiringOrExpired.map((member) => {
              const days = getDaysRemaining(member.end_date);
              const isExpired = days < 0;
              const isSending = sendingId === member.id;

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {member.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{member.full_name}</span>
                        <Badge variant={isExpired ? "destructive" : "warning"} className="text-[10px]">
                          {isExpired ? `Expired (${Math.abs(days)}d ago)` : `Expires in ${days} days`}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {member.plan?.name || "Standard Plan"} • Ends {formatDate(member.end_date)}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {member.phone}
                        </span>
                        <span>•</span>
                        <span>{member.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(member)}
                      disabled={isSending}
                      className="text-xs h-8 gap-1.5"
                    >
                      {isSending ? (
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 text-slate-600" />
                      )}
                      Send Reminder
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => onRenewMember(member)}
                      className="text-xs h-8 bg-slate-900 hover:bg-slate-800"
                    >
                      Renew
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

