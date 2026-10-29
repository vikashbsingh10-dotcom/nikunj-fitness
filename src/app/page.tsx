"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar, NavTab } from "@/components/navbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueOverview } from "@/components/dashboard/revenue-overview";
import { ExpiringMembersAlert } from "@/components/dashboard/expiring-members-alert";
import { MemberList } from "@/components/members/member-list";
import { MemberRegistrationModal } from "@/components/members/member-registration-modal";
import { MemberDetailsModal } from "@/components/members/member-details-modal";
import { AttendanceTracker } from "@/components/attendance/attendance-tracker";
import { PlansManager } from "@/components/plans/plans-manager";
import { PaymentsManager } from "@/components/payments/payments-manager";
import { SupabaseResendStatus } from "@/components/settings/supabase-resend-status";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToastProvider, useToast } from "@/components/ui/toast-context";
import { LoginPage } from "@/components/auth/login-page";
import { UserManagement } from "@/components/users/user-management";
import { AuthService } from "@/lib/auth";
import { GymStore } from "@/lib/store";
import { Member, Plan, Payment, Attendance, DashboardMetrics, AppUser } from "@/types";
import { Search, QrCode, RotateCw, ArrowLeft, Dumbbell } from "lucide-react";

function GymAppContent() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [previousTab, setPreviousTab] = useState<NavTab>("dashboard");
  const [loading, setLoading] = useState(true);

  // Check initial authentication
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    queueMicrotask(() => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
  }, []);

  const handleTabChange = (newTab: NavTab) => {
    // If not admin and trying to open users tab, redirect to dashboard
    if (newTab === "users" && currentUser?.role !== "admin") {
      toast.error("Access Restricted", "Staff accounts cannot access User Management.");
      return;
    }
    setPreviousTab(activeTab);
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    setActiveTab("dashboard");
    toast.info("Signed Out", "You have been logged out of the portal.");
  };

  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMembers: 0,
    activeMembers: 0,
    expiringMembers: 0,
    expiredMembers: 0,
    todayCheckIns: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    revenueByPlan: [],
    monthlyRevenueTrend: [],
  });

  // Modal states
  const [newMemberModalOpen, setNewMemberModalOpen] = useState(false);
  const [quickCheckInModalOpen, setQuickCheckInModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Quick Check-in search inside modal
  const [quickSearch, setQuickSearch] = useState("");

  const loadAllData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [allPlans, allMembers, allPayments, allAttendances, dashMetrics] = await Promise.all([
        GymStore.getPlans(),
        GymStore.getMembers(),
        GymStore.getPayments(),
        GymStore.getAttendances(),
        GymStore.getDashboardMetrics(),
      ]);

      setPlans(allPlans);
      setMembers(allMembers);
      setPayments(allPayments);
      setAttendances(allAttendances);
      setMetrics(dashMetrics);
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;
    (async () => {
      try {
        const [allPlans, allMembers, allPayments, allAttendances, dashMetrics] = await Promise.all([
          GymStore.getPlans(),
          GymStore.getMembers(),
          GymStore.getPayments(),
          GymStore.getAttendances(),
          GymStore.getDashboardMetrics(),
        ]);
        if (!ignore) {
          setPlans(allPlans);
          setMembers(allMembers);
          setPayments(allPayments);
          setAttendances(allAttendances);
          setMetrics(dashMetrics);
        }
      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [currentUser]);

  // Action handlers
  const handleOpenMemberDetails = (member: Member) => {
    setSelectedMember(member);
    setDetailsModalOpen(true);
  };

  const handleRenewMember = (member: Member) => {
    setSelectedMember(member);
    setDetailsModalOpen(true);
  };

  const handle1TapCheckIn = async (memberId: string) => {
    try {
      const member = members.find((m) => m.id === memberId);
      await GymStore.checkInMember(memberId, "1-Tap Desk Check-in");
      toast.success(
        `Checked in: ${member?.full_name || "Member"}`,
        `Timestamp: ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      );
      setQuickCheckInModalOpen(false);
      setQuickSearch("");
      loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Check-in error";
      toast.error("Check-in Error", msg);
    }
  };

  // Filter candidates for quick check-in modal
  const quickCandidates = members
    .filter(
      (m) =>
        quickSearch.trim() &&
        (m.full_name.toLowerCase().includes(quickSearch.toLowerCase()) ||
          (m.phone ? m.phone.toLowerCase().includes(quickSearch.toLowerCase()) : false) ||
          m.email.toLowerCase().includes(quickSearch.toLowerCase()))
    )
    .slice(0, 6);

  // 1. Loading screen while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-pulse mb-4">
          <Dumbbell className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-slate-200">Nikunj Fitness</p>
        <p className="text-xs text-slate-400 mt-1">Verifying access session...</p>
      </div>
    );
  }

  // 2. Unauthenticated: Render Login Page (blocks access to entire site!)
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        previousTab={previousTab}
        onOpenNewMember={() => setNewMemberModalOpen(true)}
        onOpenQuickCheckIn={() => setQuickCheckInModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Big prominent Back bar on Secondary Tabs */}
        {activeTab !== "dashboard" && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Viewing</span>
              <span className="text-slate-300">/</span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 capitalize tracking-tight">
                {activeTab} Management
              </h2>
            </div>
            {/* BIG PROMINENT BACK BUTTON ON TOP RIGHT */}
            <button
              onClick={() => handleTabChange("dashboard")}
              className="flex items-center gap-2 h-10 px-5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-95 transition-all cursor-pointer group"
            >
              <ArrowLeft className="h-4 w-4 stroke-[2.5] group-hover:-translate-x-1 transition-transform" />
              <span>← Back to Dashboard</span>
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
            <RotateCw className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading Gym Data...</span>
          </div>
        ) : (
          <>
            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* 1. Metric Stats */}
                <StatsCards
                  metrics={metrics}
                  onFilterClick={(filter) => {
                    if (filter === "attendance") setActiveTab("attendance");
                    else if (filter === "payments") setActiveTab("payments");
                    else setActiveTab("members");
                  }}
                />

                {/* 2. Expiring Members Watchlist */}
                <ExpiringMembersAlert
                  members={members}
                  onRenewMember={handleRenewMember}
                  onRefresh={loadAllData}
                />

                {/* 3. Revenue Overview & Activity */}
                <RevenueOverview
                  metrics={metrics}
                  recentPayments={payments}
                  onViewAllPayments={() => setActiveTab("payments")}
                />
              </div>
            )}

            {/* TAB: MEMBERS */}
            {activeTab === "members" && (
              <div className="animate-in fade-in duration-150">
                <MemberList
                  members={members}
                  plans={plans}
                  onSelectMember={handleOpenMemberDetails}
                  onRenewMember={handleRenewMember}
                  onCheckIn={handle1TapCheckIn}
                  onOpenNewMember={() => setNewMemberModalOpen(true)}
                />
              </div>
            )}

            {/* TAB: ATTENDANCE */}
            {activeTab === "attendance" && (
              <div className="animate-in fade-in duration-150">
                <AttendanceTracker
                  attendances={attendances}
                  members={members}
                  onAttendanceLogged={loadAllData}
                />
              </div>
            )}

            {/* TAB: PLANS */}
            {activeTab === "plans" && (
              <div className="animate-in fade-in duration-150">
                <PlansManager plans={plans} onPlansUpdated={loadAllData} />
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === "payments" && (
              <div className="animate-in fade-in duration-150">
                <PaymentsManager
                  payments={payments}
                  members={members}
                  plans={plans}
                  onPaymentRecorded={loadAllData}
                />
              </div>
            )}

            {/* TAB: USERS & STAFF MANAGEMENT (ADMIN ONLY) */}
            {activeTab === "users" && (
              <div className="animate-in fade-in duration-150">
                {currentUser.role === "admin" ? (
                  <UserManagement currentUser={currentUser} />
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Access restricted to Administrator.
                  </div>
                )}
              </div>
            )}

            {/* TAB: SETTINGS & CLOUD CONFIG */}
            {activeTab === "settings" && (
              <div className="animate-in fade-in duration-150">
                <SupabaseResendStatus />
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Quick Check-in Modal */}
      <Dialog open={quickCheckInModalOpen} onOpenChange={setQuickCheckInModalOpen}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-slate-800" />
            <DialogTitle>Quick Front Desk Check-in</DialogTitle>
          </div>
          <DialogDescription>
            Search member by name or phone to log attendance instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              autoFocus
              placeholder="Start typing name or phone..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {!quickSearch.trim() ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Type above to look up active gym members.
              </p>
            ) : quickCandidates.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No matching member found.
              </p>
            ) : (
              quickCandidates.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{m.full_name}</span>
                      <Badge
                        variant={m.status === "active" ? "success" : m.status === "expiring" ? "warning" : "destructive"}
                        className="text-[9px]"
                      >
                        {m.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {m.phone} • {m.plan?.name}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handle1TapCheckIn(m.id)}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    Check In
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Dialog>

      {/* Member Registration Modal */}
      <MemberRegistrationModal
        open={newMemberModalOpen}
        onOpenChange={setNewMemberModalOpen}
        plans={plans}
        onMemberRegistered={loadAllData}
      />

      {/* Member Details & Renewal Modal */}
      <MemberDetailsModal
        member={selectedMember}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        plans={plans}
        payments={payments}
        attendances={attendances}
        onDataUpdated={loadAllData}
      />
    </div>
  );
}

export default function GymManagementApp() {
  return (
    <ToastProvider>
      <GymAppContent />
    </ToastProvider>
  );
}
