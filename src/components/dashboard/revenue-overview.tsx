"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { DashboardMetrics, Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { IndianRupee, CreditCard, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/badge";

interface RevenueOverviewProps {
  metrics: DashboardMetrics;
  recentPayments: Payment[];
  onViewAllPayments: () => void;
}

export function RevenueOverview({
  metrics,
  recentPayments,
  onViewAllPayments,
}: RevenueOverviewProps) {
  // Find highest month for relative bar heights
  const maxAmount = Math.max(...metrics.monthlyRevenueTrend.map((m) => m.amount), 1000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Monthly Revenue Chart (Pure minimalist SVG/CSS) */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Revenue Analytics</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Monthly collection trend over the last 6 months</p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold gap-1 text-emerald-700 bg-emerald-50 border-emerald-200">
            <ArrowUpRight className="h-3 w-3" /> Recurring Revenue
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {metrics.monthlyRevenueTrend.map((item, idx) => {
              const heightPct = Math.max(12, Math.round((item.amount / maxAmount) * 100));
              const isCurrent = idx === metrics.monthlyRevenueTrend.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-md overflow-hidden flex items-end h-40">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isCurrent
                          ? "bg-slate-900 group-hover:bg-slate-800"
                          : "bg-slate-300 group-hover:bg-slate-400"
                      }`}
                    />
                  </div>
                  <span className={`text-xs ${isCurrent ? "font-bold text-slate-900" : "text-slate-500"}`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Revenue By Plan Breakdown */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Revenue Breakdown by Plan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.revenueByPlan.map((plan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{plan.planName}</p>
                    <p className="text-[11px] text-slate-500">{plan.count} subscriptions</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(plan.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Recent Payment Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Latest billing ledger</p>
          </div>
          <button
            onClick={onViewAllPayments}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline"
          >
            View all
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No payments recorded yet.</p>
            ) : (
              recentPayments.slice(0, 5).map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                      <CreditCard className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {pay.member?.full_name || "Member"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {pay.receipt_number} • {formatDate(pay.payment_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900">{formatCurrency(pay.amount)}</span>
                    <p className="text-[10px] text-emerald-600 font-medium">Completed</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

