"use client";

import React, { useState, useMemo } from "react";
import { Member } from "@/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatDate, getDaysRemaining, formatCurrency } from "@/lib/utils";
import {
  Mail,
  RotateCw,
  CheckCircle2,
  Phone,
  Zap,
} from "lucide-react";
import { useToast } from "../ui/toast-context";

interface ExpiringMembersAlertProps {
  members: Member[];
  onRenewMember: (member: Member) => void;
  onRefresh?: () => void;
}

export function ExpiringMembersAlert({
  members,
  onRenewMember,
}: ExpiringMembersAlertProps) {
  const { toast } = useToast();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "expiring" | "expired">("all");

  // Filter members expiring soon or expired
  const actionableMembers = useMemo(() => {
    return members.filter((m) => {
      if (filterType === "expiring") return m.status === "expiring";
      if (filterType === "expired") return m.status === "expired";
      return m.status === "expiring" || m.status === "expired";
    });
  }, [members, filterType]);

  // Calculate renewal revenue opportunity in INR
  const totalRenewalOpportunity = useMemo(() => {
    return actionableMembers.reduce((acc, m) => acc + (m.plan?.price || 1499), 0);
  }, [actionableMembers]);

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
    <div className="relative rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 shadow-md p-5 sm:p-6 transition-all">
      {/* Top Banner / Feature Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200/80">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30">
            <Zap className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Membership Renewal Hub
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider animate-pulse">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Instant 1-click renewal processing, expiry alerts, and payment collections
            </p>
          </div>
        </div>

        {/* Revenue at risk in INR */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="bg-white/90 border border-amber-200 rounded-xl px-3.5 py-2 shadow-xs text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Renewal Pipeline
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {formatCurrency(totalRenewalOpportunity)}
            </span>
          </div>

          <div className="flex bg-amber-100/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === "all" ? "bg-white text-slate-900 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({members.filter((m) => m.status === "expiring" || m.status === "expired").length})
            </button>
            <button
              onClick={() => setFilterType("expiring")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === "expiring" ? "bg-white text-amber-700 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Expiring Soon
            </button>
            <button
              onClick={() => setFilterType("expired")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === "expired" ? "bg-white text-rose-700 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Expired
            </button>
          </div>
        </div>
      </div>

      {/* Member Cards List */}
      <div className="mt-4">
        {actionableMembers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-90" />
            <p className="font-bold text-slate-800">All memberships are in good standing!</p>
            <p className="text-slate-400 mt-0.5">No memberships currently expiring or overdue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {actionableMembers.map((member) => {
              const days = getDaysRemaining(member.end_date);
              const isExpired = days < 0;
              const isSending = sendingId === member.id;
              const planPrice = member.plan?.price || 1499;

              return (
                <div
                  key={member.id}
                  className={`flex flex-col justify-between p-4 rounded-xl border-2 bg-white transition-all shadow-xs hover:shadow-md ${
                    isExpired
                      ? "border-rose-200/90 hover:border-rose-300"
                      : "border-amber-200/90 hover:border-amber-300"
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-xs ${
                            isExpired ? "bg-rose-600" : "bg-amber-500"
                          }`}
                        >
                          {member.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{member.full_name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {member.phone}
                          </p>
                        </div>
                      </div>

                      {/* Expiry Badge */}
                      <Badge
                        variant={isExpired ? "destructive" : "warning"}
                        className="text-xs font-bold px-2.5 py-0.5"
                      >
                        {isExpired ? `Expired (${Math.abs(days)}d ago)` : `Expires in ${days} days`}
                      </Badge>
                    </div>

                    {/* Middle details */}
                    <div className="mt-3.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Current Tier</span>
                        <span className="font-bold text-slate-800">{member.plan?.name || "Standard Plan"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Renewal Amount</span>
                        <span className="font-extrabold text-slate-900">{formatCurrency(planPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 PROMINENT ACTION BUTTONS 🌟 */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(member)}
                      disabled={isSending}
                      className="text-xs h-9 px-3 gap-1.5 text-slate-700 border-slate-200 hover:bg-slate-50"
                    >
                      {isSending ? (
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <span>Email Reminder</span>
                    </Button>

                    {/* BIG EYE-CATCHING RENEW BUTTON */}
                    <button
                      onClick={() => onRenewMember(member)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      <span>Renew Membership</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
