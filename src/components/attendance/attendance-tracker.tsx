"use client";

import React, { useState, useMemo } from "react";
import { Attendance, Member } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { GymStore } from "@/lib/store";
import { useToast } from "../ui/toast-context";
import { formatDateTime, formatDate } from "@/lib/utils";
import {
  QrCode,
  Search,
  Clock,
  UserCheck,
} from "lucide-react";

interface AttendanceTrackerProps {
  attendances: Attendance[];
  members: Member[];
  onAttendanceLogged: () => void;
}

export function AttendanceTracker({
  attendances,
  members,
  onAttendanceLogged,
}: AttendanceTrackerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayStr, setTodayStr] = useState<string>("");

  React.useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    queueMicrotask(() => {
      setTodayStr(today);
    });
  }, []);

  // Filter members matching search for quick check-in
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return members
      .filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          (m.phone ? m.phone.toLowerCase().includes(q) : false) ||
          m.email.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [members, searchQuery]);

  // Today's attendances
  const todaysLogs = useMemo(() => {
    if (!todayStr) return attendances;
    return attendances.filter((a) => a.check_in_time.startsWith(todayStr));
  }, [attendances, todayStr]);

  const handleQuickCheckIn = async (member: Member) => {
    // Check if membership is expired
    if (member.status === "expired") {
      const confirmExpired = window.confirm(
        `WARNING: ${member.full_name}'s membership is EXPIRED. Do you want to allow temporary check-in anyway?`
      );
      if (!confirmExpired) return;
    }

    setLoading(true);
    try {
      await GymStore.checkInMember(member.id, "Front desk entry");
      toast.success(
        `Welcome, ${member.full_name}!`,
        `Checked in at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`
      );
      setSearchQuery("");
      onAttendanceLogged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record check-in";
      toast.error("Check-in Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Check-in Station (Left column) */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Front Desk Station</CardTitle>
              <p className="text-xs text-slate-500">1-Tap Fast Member Check-in</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Member Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Type member name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
                autoFocus
              />
            </div>
          </div>

          {/* Search Result Matches */}
          {searchQuery && (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Members ({filteredCandidates.length})
              </p>
              {filteredCandidates.length === 0 ? (
                <p className="text-xs text-slate-400 p-2">No matching member found.</p>
              ) : (
                filteredCandidates.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.full_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {m.phone} • {m.plan?.name}
                      </p>
                      <Badge
                        variant={m.status === "active" ? "success" : m.status === "expiring" ? "warning" : "destructive"}
                        className="text-[9px] mt-1"
                      >
                        {m.status}
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleQuickCheckIn(m)}
                      disabled={loading}
                      className="text-xs h-7 px-3 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Check In
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Station stats */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Check-ins Today:</span>
              <span className="font-bold text-slate-900 text-sm">{todaysLogs.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total All-Time Logs:</span>
              <span className="font-semibold text-slate-700">{attendances.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Live Attendance Feed (Right columns) */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-base font-bold">Today&apos;s Live Attendance Log</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time check-in stream for {formatDate(todayStr)}
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold gap-1 text-blue-700 bg-blue-50 border-blue-200">
            <UserCheck className="h-3 w-3" /> {todaysLogs.length} checked in today
          </Badge>
        </CardHeader>

        <CardContent className="pt-4">
          {todaysLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              No check-ins recorded for today yet. Use the Front Desk Station on the left to check in members!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">Member</th>
                    <th className="py-2.5 px-3 font-semibold">Plan</th>
                    <th className="py-2.5 px-3 font-semibold">Check-in Time</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaysLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                            {log.member?.full_name ? log.member.full_name.slice(0, 2).toUpperCase() : "??"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{log.member?.full_name || "Unknown Member"}</p>
                            <p className="text-[10px] text-slate-400">{log.member?.phone || ""}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {log.member?.plan_name || "Standard Member"}
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800">
                        {formatDateTime(log.check_in_time)}
                      </td>

                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            log.member?.status === "active"
                              ? "success"
                              : log.member?.status === "expiring"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {log.member?.status || "active"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

