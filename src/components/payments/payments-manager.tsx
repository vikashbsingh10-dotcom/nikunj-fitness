"use client";

import React, { useState, useMemo } from "react";
import { Payment, Member, Plan, PaymentMethod } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { GymStore } from "@/lib/store";
import { useToast } from "../ui/toast-context";
import {
  CreditCard,
  Plus,
  Receipt,
  Search,
  Mail,
  RotateCw,
  Printer,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

interface PaymentsManagerProps {
  payments: Payment[];
  members: Member[];
  plans: Plan[];
  onPaymentRecorded: () => void;
}

export function PaymentsManager({
  payments,
  members,
  plans,
  onPaymentRecorded,
}: PaymentsManagerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [receiptModalPayment, setReceiptModalPayment] = useState<Payment | null>(null);

  // New payment form
  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState<number>(49);
  const [method, setMethod] = useState<PaymentMethod>("credit_card");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingReceiptId, setSendingReceiptId] = useState<string | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.receipt_number.toLowerCase().includes(q) ||
        (p.member?.full_name && p.member.full_name.toLowerCase().includes(q)) ||
        (p.plan?.name && p.plan.name.toLowerCase().includes(q));

      const matchesMethod = selectedMethod === "all" || p.payment_method === selectedMethod;

      return matchesSearch && matchesMethod;
    });
  }, [payments, searchTerm, selectedMethod]);

  const totalCollected = useMemo(() => {
    return payments.reduce((acc, p) => acc + Number(p.amount), 0);
  }, [payments]);

  const handleMemberSelect = (selectedId: string) => {
    setMemberId(selectedId);
    const m = members.find((x) => x.id === selectedId);
    if (m && m.plan_id) {
      setPlanId(m.plan_id);
      const plan = plans.find((p) => p.id === m.plan_id);
      if (plan) setAmount(plan.price);
    }
  };

  const handlePlanSelect = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const pl = plans.find((p) => p.id === selectedPlanId);
    if (pl) setAmount(pl.price);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !planId || amount <= 0) {
      toast.error("Invalid payment data", "Select a member, plan, and enter an amount > $0.");
      return;
    }

    setLoading(true);
    try {
      await GymStore.addPayment({
        member_id: memberId,
        plan_id: planId,
        amount: Number(amount),
        payment_method: method,
        notes,
      });

      toast.success("Payment recorded!", `Receipt created and queued for email delivery.`);
      setModalOpen(false);
      onPaymentRecorded();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record payment";
      toast.error("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailReceipt = async (p: Payment) => {
    setSendingReceiptId(p.id);
    try {
      const m = members.find((x) => x.id === p.member_id);
      const email = m?.email || p.member?.email;
      if (!email) {
        toast.error("No email on file", "Member does not have a registered email.");
        return;
      }

      const res = await fetch("/api/email/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          name: m?.full_name || p.member?.full_name || "Valued Member",
          planName: p.plan?.name || "Membership",
          amount: p.amount,
          receiptNumber: p.receipt_number,
          paymentMethod: p.payment_method,
          paymentDate: formatDate(p.payment_date),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          `Receipt sent to ${email}`,
          data.isSimulated
            ? "(Simulated console preview)"
            : "Successfully delivered via Resend"
        );
      } else {
        toast.error("Failed to email receipt", data.error);
      }
    } catch {
      toast.error("Network error sending receipt");
    } finally {
      setSendingReceiptId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Billing & Payment Ledger</h2>
          <p className="text-xs text-slate-500">
            Track member transaction history, issue receipts, and manage collections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Collected</span>
            <p className="text-base font-bold text-slate-900">{formatCurrency(totalCollected)}</p>
          </div>
          <Button onClick={() => setModalOpen(true)} size="sm" className="gap-1.5 bg-slate-900">
            <Plus className="h-3.5 w-3.5" />
            Record Payment
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search receipt # or member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
              >
                <option value="all">All Payment Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="stripe">Stripe</option>
                <option value="upi">UPI</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
              No payment records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 font-semibold">Receipt #</th>
                    <th className="py-3 px-3 font-semibold">Member</th>
                    <th className="py-3 px-3 font-semibold">Plan Description</th>
                    <th className="py-3 px-3 font-semibold">Amount</th>
                    <th className="py-3 px-3 font-semibold">Method</th>
                    <th className="py-3 px-3 font-semibold">Date</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => {
                    const isSending = sendingReceiptId === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                          {p.receipt_number}
                        </td>

                        <td className="py-3 px-3 font-medium text-slate-900">
                          {p.member?.full_name || "Member"}
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          {p.plan?.name || "Membership Fee"}
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-900">
                          {formatCurrency(p.amount)}
                        </td>

                        <td className="py-3 px-3">
                          <span className="capitalize text-slate-600 text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {p.payment_method.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-500">{formatDate(p.payment_date)}</td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendEmailReceipt(p)}
                              disabled={isSending}
                              title="Resend receipt email"
                              className="h-8 px-2 text-slate-600"
                            >
                              {isSending ? (
                                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Mail className="h-3.5 w-3.5" />
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReceiptModalPayment(p)}
                              className="h-8 text-xs gap-1"
                            >
                              <Receipt className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Log a new transaction in the ledger and automatically send a receipt to the athlete.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Member *</label>
            <select
              required
              value={memberId}
              onChange={(e) => handleMemberSelect(e.target.value)}
              className="mt-1 w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Membership Tier *</label>
            <select
              required
              value={planId}
              onChange={(e) => handlePlanSelect(e.target.value)}
              className="mt-1 w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800"
            >
              <option value="">-- Choose Plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Amount (USD) *</label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="mt-1 w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash (Front Desk)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="stripe">Stripe</option>
                <option value="upi">UPI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Notes / Reference</label>
            <Input
              placeholder="e.g. POS Terminal #2, Cashier John"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Recording..." : "Record & Send Receipt"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Printable / View Receipt Dialog */}
      {receiptModalPayment && (
        <Dialog open={Boolean(receiptModalPayment)} onOpenChange={() => setReceiptModalPayment(null)}>
          <div className="p-4 bg-slate-900 text-white rounded-t-xl -m-6 mb-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Official Receipt</span>
              <h3 className="font-bold text-sm">{receiptModalPayment.receipt_number}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-400">PAID IN FULL</span>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-slate-400 text-[11px]">Billed To</p>
                <p className="font-bold text-slate-900 mt-0.5">{receiptModalPayment.member?.full_name}</p>
                <p className="text-slate-500">{receiptModalPayment.member?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[11px]">Payment Date</p>
                <p className="font-semibold text-slate-800 mt-0.5">{formatDate(receiptModalPayment.payment_date)}</p>
                <p className="text-slate-500 capitalize">{receiptModalPayment.payment_method.replace(/_/g, " ")}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">{receiptModalPayment.plan?.name || "Membership Fee"}</p>
                <p className="text-slate-400 text-[11px]">{receiptModalPayment.notes || "Gym Facility Access"}</p>
              </div>
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(receiptModalPayment.amount)}
              </span>
            </div>

            <div className="text-center pt-2 text-[11px] text-slate-400">
              Apex Performance Club • All rights reserved
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Receipt
              </Button>
              <Button
                size="sm"
                onClick={() => setReceiptModalPayment(null)}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}
    </div>
  );
}

