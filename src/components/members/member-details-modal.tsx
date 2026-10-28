"use client";

import React, { useState } from "react";
import { Member, Plan, PaymentMethod, Payment, Attendance } from "@/types";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { formatDate, formatDateTime, formatCurrency, getDaysRemaining } from "@/lib/utils";
import { GymStore } from "@/lib/store";
import { useToast } from "../ui/toast-context";
import {
  User,
  Phone,
  Mail,
  ShieldAlert,
  Calendar,
  CreditCard,
  QrCode,
  RotateCw,
  Send,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface MemberDetailsModalProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  payments: Payment[];
  attendances: Attendance[];
  onDataUpdated: () => void;
}

export function MemberDetailsModal({
  member,
  open,
  onOpenChange,
  plans,
  payments,
  attendances,
  onDataUpdated,
}: MemberDetailsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "renew" | "history">("overview");

  // Renewal form state
  const [renewalPlanId, setRenewalPlanId] = useState<string>(member?.plan_id || "");
  const [renewalCustomFee, setRenewalCustomFee] = useState<number>(1499);
  const [renewalPaymentMethod, setRenewalPaymentMethod] = useState<PaymentMethod>("upi");
  const [isRenewing, setIsRenewing] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Sync renewal custom fee when plan or member changes
  React.useEffect(() => {
    if (member) {
      setRenewalPlanId(member.plan_id);
      const pl = plans.find((p) => p.id === member.plan_id);
      setRenewalCustomFee(member.custom_fee || pl?.price || 1499);
    }
  }, [member, plans]);

  const handleRenewalPlanSelect = (planId: string) => {
    setRenewalPlanId(planId);
    const pl = plans.find((p) => p.id === planId);
    if (pl) {
      setRenewalCustomFee(pl.price);
    }
  };

  if (!member) return null;

  const daysRemaining = getDaysRemaining(member.end_date);
  const isExpired = daysRemaining < 0;

  // Filter member-specific records
  const memberPayments = payments.filter((p) => p.member_id === member.id);
  const memberAttendances = attendances.filter((a) => a.member_id === member.id);

  // Send renewal email
  const handleSendReminder = async () => {
    setIsSendingReminder(true);
    try {
      const res = await fetch("/api/email/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: member.email,
          name: member.full_name,
          planName: member.plan?.name || "Membership",
          endDate: formatDate(member.end_date),
          daysRemaining,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          `Renewal reminder sent to ${member.full_name}`,
          data.isSimulated
            ? "(Simulated preview logged in console)"
            : `Delivered to ${member.email} via Resend`
        );
      } else {
        toast.error("Failed to send email", data.error);
      }
    } catch {
      toast.error("Network error sending renewal reminder");
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Perform renewal
  const handleRenew = async () => {
    if (!renewalPlanId) return;
    setIsRenewing(true);
    try {
      await GymStore.renewMember(member.id, renewalPlanId, renewalPaymentMethod, Number(renewalCustomFee));
      toast.success(
        `Membership renewed for ${member.full_name}!`,
        `Renewed at ${formatCurrency(renewalCustomFee)}. Receipt sent to member's email.`
      );
      onDataUpdated();
      setActiveTab("overview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Renewal failed";
      toast.error("Renewal Error", msg);
    } finally {
      setIsRenewing(false);
    }
  };

  // Check in
  const handleCheckIn = async () => {
    try {
      await GymStore.checkInMember(member.id, "Front desk manual check-in");
      toast.success(`Checked in ${member.full_name}!`, "Attendance recorded.");
      onDataUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Check-in failed";
      toast.error("Check-in Error", msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-start justify-between pr-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {member.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-base">{member.full_name}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Member ID: {member.id.slice(0, 8)} • Joined {formatDate(member.start_date)}
              </DialogDescription>
            </div>
          </div>
          <Badge
            variant={
              member.status === "active"
                ? "success"
                : member.status === "expiring"
                ? "warning"
                : "destructive"
            }
          >
            {member.status === "active"
              ? `Active (${daysRemaining}d)`
              : member.status === "expiring"
              ? `Expiring (${daysRemaining}d)`
              : `Expired (${Math.abs(daysRemaining)}d)`}
          </Badge>
        </div>
      </DialogHeader>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs mb-4">
        {[
          { id: "overview", label: "Profile & Plan" },
          { id: "renew", label: "Renew Membership" },
          { id: "history", label: `History (${memberAttendances.length} visits)` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`py-2 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4 text-xs">
          {/* Plan Summary Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Current Membership
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{member.plan?.name || "Standard Plan"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-500">
                    Valid: <span className="font-medium text-slate-800">{formatDate(member.start_date)}</span> —{" "}
                    <span className="font-medium text-slate-800">{formatDate(member.end_date)}</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                    Agreed Fee: {formatCurrency(member.custom_fee || member.plan?.price || 0)}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRenewalPlanId(member.plan_id);
                  setActiveTab("renew");
                }}
                className="text-xs h-7"
              >
                Renew
              </Button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email Address
              </span>
              <p className="font-semibold text-slate-800 mt-1">{member.email}</p>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Phone Number
              </span>
              <p className="font-semibold text-slate-800 mt-1">{member.phone || "Not provided"}</p>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-white sm:col-span-2">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="h-3 w-3" /> Emergency Contact
              </span>
              <p className="font-semibold text-slate-800 mt-1">
                {member.emergency_contact || "No emergency contact listed"}
              </p>
            </div>
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-slate-400 text-[11px]">Notes & Preferences</span>
              <p className="text-slate-700 mt-1 whitespace-pre-wrap">{member.notes}</p>
            </div>
          )}

          {/* Quick Action Bar */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendReminder}
              disabled={isSendingReminder}
              className="text-xs h-8 gap-1.5"
            >
              {isSendingReminder ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Email Reminder
            </Button>

            <Button
              size="sm"
              onClick={handleCheckIn}
              className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <QrCode className="h-3.5 w-3.5" />
              Check-in Now
            </Button>
          </div>
        </div>
      )}

      {/* 2. Renew Tab */}
      {activeTab === "renew" && (
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl border-2 border-amber-300 bg-amber-50/70 text-slate-900">
            <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
              ⚡ Instant Renewal Engine
            </span>
            <p className="text-[11px] text-amber-900 mt-1">
              If already expired, validity starts fresh today. If active, validity extends seamlessly from current expiry date.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800">Select Renewal Plan *</label>
            <select
              value={renewalPlanId}
              onChange={(e) => handleRenewalPlanSelect(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border-2 border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-xs focus-visible:outline-none focus-visible:border-slate-900"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Standard: {formatCurrency(p.price)} ({p.duration_days} days)
                </option>
              ))}
            </select>
          </div>

          {/* 🌟 OWNER CUSTOM RENEWAL FEE 🌟 */}
          <div className="p-3.5 rounded-xl bg-amber-50/90 border-2 border-amber-300">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                <span>Renewal Fee Charged (₹) *</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Custom Fee
                </span>
              </label>
              <span className="text-[11px] text-amber-800 font-semibold">
                Standard: {formatCurrency(plans.find((p) => p.id === renewalPlanId)?.price || 0)}
              </span>
            </div>
            <div className="mt-2 relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-600">₹</span>
              <Input
                type="number"
                min="0"
                step="1"
                value={renewalCustomFee}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenewalCustomFee(parseFloat(e.target.value) || 0)}
                className="pl-8 text-sm font-extrabold text-slate-900 bg-white border-2 border-amber-300 focus-visible:border-slate-900"
              />
            </div>
            <p className="text-[10px] text-amber-900 mt-1.5 font-medium">
              Owner can set any custom negotiated fee for this renewal. Receipt will show this exact amount.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800">Payment Collection Method</label>
            <select
              value={renewalPaymentMethod}
              onChange={(e) => setRenewalPaymentMethod(e.target.value as PaymentMethod)}
              className="mt-1 w-full h-10 rounded-xl border-2 border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-xs focus-visible:outline-none focus-visible:border-slate-900"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="cash">Cash (Front Desk Counter)</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Net Banking / NEFT</option>
              <option value="stripe">Online Payment</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <span className="font-bold">Automated Member Actions:</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-emerald-800">
              <li>Extends athlete membership end date & restores Active badge</li>
              <li>Generates an official GST Receipt # in INR (₹)</li>
              <li>Dispatches digital payment receipt to {member.email} via Resend</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("overview")}
              disabled={isRenewing}
            >
              Back
            </Button>
            <button
              type="button"
              onClick={handleRenew}
              disabled={isRenewing}
              className="h-10 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isRenewing ? "Renewing..." : "⚡ Process Renewal & Issue Invoice"}
            </button>
          </DialogFooter>
        </div>
      )}

      {/* 3. History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4 text-xs">
          {/* Check-ins list */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" /> Recent Check-ins ({memberAttendances.length})
            </h4>
            {memberAttendances.length === 0 ? (
              <p className="text-slate-400 py-3">No check-ins logged yet.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {memberAttendances.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50"
                  >
                    <span>{formatDateTime(a.check_in_time)}</span>
                    <span className="text-[11px] text-slate-500">{a.notes || "Check-in"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments list */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-slate-500" /> Payment History ({memberPayments.length})
            </h4>
            {memberPayments.length === 0 ? (
              <p className="text-slate-400 py-3">No payment records found.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {memberPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded border border-slate-100 bg-white"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{formatCurrency(p.amount)}</span>
                      <span className="text-slate-400 ml-2">{p.receipt_number}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{formatDate(p.payment_date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}

