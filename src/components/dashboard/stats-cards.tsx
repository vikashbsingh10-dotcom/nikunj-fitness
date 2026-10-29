"use client";

import React from "react";
import { Users, AlertTriangle, QrCode, IndianRupee } from "lucide-react";
import { DashboardMetrics } from "@/types";
import { Card } from "../ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  metrics: DashboardMetrics;
  onFilterClick?: (status: string) => void;
}

export function StatsCards({ metrics, onFilterClick }: StatsCardsProps) {
  const cards = [
    {
      title: "Active Members",
      value: metrics.activeMembers,
      subtext: `${metrics.totalMembers} total registered`,
      icon: <Users className="h-4 w-4 text-emerald-600" />,
      badge: "Healthy",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      onClick: () => onFilterClick?.("active"),
    },
    {
      title: "Expiring Soon",
      value: metrics.expiringMembers,
      subtext: `${metrics.expiredMembers} expired accounts`,
      icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      badge: metrics.expiringMembers > 0 ? "Action Needed" : "All Clear",
      badgeColor: metrics.expiringMembers > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200",
      onClick: () => onFilterClick?.("expiring"),
    },
    {
      title: "Today's Attendance",
      value: metrics.todayCheckIns,
      subtext: "Live front desk check-ins",
      icon: <QrCode className="h-4 w-4 text-blue-600" />,
      badge: "Real-time",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      onClick: () => onFilterClick?.("attendance"),
    },
    {
      title: "Monthly Revenue (MRR)",
      value: formatCurrency(metrics.monthlyRevenue),
      subtext: `${formatCurrency(metrics.totalRevenue)} all-time`,
      icon: <IndianRupee className="h-4 w-4 text-slate-900" />,
      badge: "+14% MoM",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      onClick: () => onFilterClick?.("payments"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card
          key={i}
          onClick={c.onClick}
          className="cursor-pointer hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">{c.title}</span>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">{c.icon}</div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">{c.value}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 truncate">{c.subtext}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.badgeColor}`}>
              {c.badge}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

