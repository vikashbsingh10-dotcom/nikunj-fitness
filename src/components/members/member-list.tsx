"use client";

import React, { useState, useMemo } from "react";
import { Member, Plan } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import {
  Search,
  Filter,
  UserPlus,
  Phone,
  Mail,
  MoreVertical,
  QrCode,
  RotateCw,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface MemberListProps {
  members: Member[];
  plans: Plan[];
  onSelectMember: (member: Member) => void;
  onRenewMember: (member: Member) => void;
  onCheckIn: (memberId: string) => void;
  onOpenNewMember: () => void;
}

export function MemberList({
  members,
  plans,
  onSelectMember,
  onRenewMember,
  onCheckIn,
  onOpenNewMember,
}: MemberListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        member.full_name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search) ||
        (member.phone ? member.phone.toLowerCase().includes(search) : false);

      // Status
      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;

      // Plan
      const matchesPlan =
        planFilter === "all" || member.plan_id === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [members, searchTerm, statusFilter, planFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: members.length,
      active: members.filter((m) => m.status === "active").length,
      expiring: members.filter((m) => m.status === "expiring").length,
      expired: members.filter((m) => m.status === "expired").length,
    };
  }, [members]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <CardTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
            Member Directory
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Manage athlete profiles, subscriptions, and access statuses
          </p>
        </div>
        <button
          onClick={onOpenNewMember}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40 active:scale-95 transition-all cursor-pointer self-start sm:self-center"
        >
          <UserPlus className="h-4 w-4 stroke-[2.5]" />
          <span>+ Add New Member</span>
        </button>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-2">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
            >
              <option value="all">All Membership Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {[
            { id: "all", label: "All Members", count: statusCounts.all },
            { id: "active", label: "Active", count: statusCounts.active },
            { id: "expiring", label: "Expiring Soon", count: statusCounts.expiring },
            { id: "expired", label: "Expired", count: statusCounts.expired },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-slate-700 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Members List Table / Responsive Cards */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm font-medium text-slate-700">No members match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting the search terms or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 font-semibold">Member</th>
                  <th className="py-3 px-3 font-semibold">Plan</th>
                  <th className="py-3 px-3 font-semibold">Status & Expiry</th>
                  <th className="py-3 px-3 font-semibold hidden md:table-cell">Emergency Contact</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => {
                  const days = getDaysRemaining(member.end_date);
                  const isExpired = days < 0;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectMember(member)}
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 group-hover:bg-slate-200 transition-colors">
                            {member.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {member.full_name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {member.phone ? `${member.phone} • ` : ""}{member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800">
                          {member.plan?.name || "Standard Plan"}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Joined {formatDate(member.start_date)}
                        </p>
                      </td>

                      {/* Status & Expiry */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant={
                              member.status === "active"
                                ? "success"
                                : member.status === "expiring"
                                ? "warning"
                                : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {member.status === "active"
                              ? `Active (${days}d left)`
                              : member.status === "expiring"
                              ? `Expiring in ${days}d`
                              : `Expired (${Math.abs(days)}d ago)`}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            Valid until {formatDate(member.end_date)}
                          </span>
                        </div>
                      </td>

                      {/* Emergency Contact */}
                      <td className="py-3.5 px-3 hidden md:table-cell text-slate-500">
                        {member.emergency_contact || "Not provided"}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCheckIn(member.id)}
                            title="Check-in to Gym"
                            className="h-8 px-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <QrCode className="h-3.5 w-3.5 mr-1" />
                            Check-in
                          </Button>

                          <button
                            onClick={() => onRenewMember(member)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-xs transition-all cursor-pointer"
                            title="Renew Membership"
                          >
                            <Zap className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
                            <span>Renew</span>
                          </button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectMember(member)}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900" />
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
  );
}

