"use client";

import React, { useState, useEffect } from "react";
import { Plan, PaymentMethod } from "@/types";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/toast-context";
import { GymStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { User, Phone, Mail, ShieldAlert, CreditCard, Calendar, Check, Send } from "lucide-react";

interface MemberRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  onMemberRegistered: () => void;
}

export function MemberRegistrationModal({
  open,
  onOpenChange,
  plans,
  onMemberRegistered,
}: MemberRegistrationModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [customFee, setCustomFee] = useState<number>(1499);
  const [startDate, setStartDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Payment states
  const [recordPayment, setRecordPayment] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");

  // Initialize selected plan, default start date and custom fee
  useEffect(() => {
    if (!startDate) {
      setStartDate(new Date().toISOString().split("T")[0]);
    }
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
      setCustomFee(plans[0].price);
    }
  }, [plans, selectedPlanId, startDate]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setCustomFee(plan.price);
    }
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // Calculated end date
  const calculatedEndDate = React.useMemo(() => {
    if (!startDate || !selectedPlan) return "";
    const start = new Date(startDate);
    start.setDate(start.getDate() + selectedPlan.duration_days);
    return start.toISOString().split("T")[0];
  }, [startDate, selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !selectedPlanId) {
      toast.error("Please fill required fields", "Name, email, and plan are mandatory.");
      return;
    }

    setLoading(true);
    try {
      await GymStore.registerMember({
        full_name: fullName,
        email,
        phone: phone || undefined,
        emergency_contact: emergencyContact,
        plan_id: selectedPlanId,
        custom_fee: Number(customFee),
        start_date: startDate,
        end_date: calculatedEndDate,
        notes,
        initialPayment:
          recordPayment
            ? {
                amount: Number(customFee),
                method: paymentMethod,
              }
            : undefined,
      });

      toast.success(
        `Member ${fullName} registered!`,
        `Assigned to ${selectedPlan?.name} at ${formatCurrency(customFee)}. Confirmation email dispatched.`
      );

      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setEmergencyContact("");
      setNotes("");
      onOpenChange(false);
      onMemberRegistered();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register member";
      toast.error("Registration Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Register New Gym Member</DialogTitle>
        <DialogDescription>
          Create a new member profile, assign membership tier, and generate initial billing receipt.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-xs font-semibold text-slate-700">Full Name *</label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              required
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Email Address *</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                required
                type="email"
                placeholder="rahul.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Phone Number (Optional)</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="+91 98765 43210 (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="text-xs font-semibold text-slate-700">Emergency Contact (Optional)</label>
          <div className="relative mt-1">
            <ShieldAlert className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Name & Relationship (e.g. Priya - Sister +91 98765 11223)"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* Membership Plan Selection */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-700">Select Membership Plan *</label>
          <select
            value={selectedPlanId}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="mt-1 w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Standard: {formatCurrency(p.price)} ({p.duration_days} days)
              </option>
            ))}
          </select>
        </div>

        {/* 🌟 OWNER CUSTOM FEE STRUCTURE 🌟 */}
        <div className="p-3.5 rounded-xl bg-amber-50/90 border-2 border-amber-300">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>Owner Custom Fee to Charge (₹) *</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                Owner Discretion
              </span>
            </label>
            <span className="text-[11px] text-amber-800 font-semibold">
              Standard: {selectedPlan ? formatCurrency(selectedPlan.price) : "₹0"}
            </span>
          </div>
          <div className="mt-2 relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-600">₹</span>
            <Input
              type="number"
              min="0"
              step="1"
              value={customFee}
              onChange={(e) => setCustomFee(parseFloat(e.target.value) || 0)}
              className="pl-8 text-sm font-extrabold text-slate-900 bg-white border-2 border-amber-300 focus-visible:border-slate-900"
              placeholder="Enter fee amount..."
            />
          </div>
          <p className="text-[10px] text-amber-900 mt-1.5 font-medium">
            Plan rules and duration ({selectedPlan?.duration_days} days) remain standard for everyone, but you can set any fee you negotiate for this member.
          </p>
        </div>

        {/* Start Date & Expiration preview */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
            />
          </div>
          <div>
            <span className="text-slate-500 font-medium">Expires On:</span>
            <div className="mt-2 font-semibold text-slate-900">{calculatedEndDate}</div>
          </div>
        </div>

        {/* Initial Payment Record */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 select-none">
            <input
              type="checkbox"
              checked={recordPayment}
              onChange={(e) => setRecordPayment(e.target.checked)}
              className="rounded text-emerald-600 h-4 w-4 accent-emerald-600"
            />
            Record initial payment ({formatCurrency(customFee)})
          </label>

          {recordPayment && (
            <div className="mt-2.5 grid grid-cols-2 gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div>
                <label className="text-[11px] font-bold text-emerald-900">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mt-1 w-full h-8 rounded-lg border border-emerald-300 bg-white px-2 text-xs font-semibold text-slate-800"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">Cash (Front Desk)</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Net Banking / NEFT</option>
                  <option value="stripe">Online Payment</option>
                </select>
              </div>
              <div className="text-[11px] text-emerald-800 flex flex-col justify-end">
                <span>GST Tax Receipt # generated automatically & sent via Resend.</span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-700">Staff / Health Notes</label>
          <textarea
            placeholder="Medical conditions, fitness goals, or locker preferences..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? "Registering..." : "✨ Complete Registration"}
          </button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

