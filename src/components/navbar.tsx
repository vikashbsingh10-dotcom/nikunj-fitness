"use client";

import React, { useState } from "react";
import {
  Dumbbell,
  Users,
  QrCode,
  CreditCard,
  Layers,
  LayoutDashboard,
  UserPlus,
  Settings,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { Button } from "./ui/button";

export type NavTab = "dashboard" | "members" | "attendance" | "plans" | "payments" | "settings";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewMember: () => void;
  onOpenQuickCheckIn: () => void;
  previousTab?: NavTab;
}

export function Navbar({
  activeTab,
  onTabChange,
  onOpenNewMember,
  onOpenQuickCheckIn,
  previousTab = "dashboard",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "members", label: "Members", icon: <Users className="h-4 w-4" /> },
    { id: "attendance", label: "Attendance", icon: <QrCode className="h-4 w-4" /> },
    { id: "plans", label: "Plans (₹)", icon: <Layers className="h-4 w-4" /> },
    { id: "payments", label: "Payments (₹)", icon: <CreditCard className="h-4 w-4" /> },
    { id: "settings", label: "Config & Docs", icon: <Settings className="h-4 w-4" /> },
  ];

  const handleBack = () => {
    if (activeTab !== "dashboard") {
      onTabChange("dashboard");
    } else if (previousTab && previousTab !== "dashboard") {
      onTabChange(previousTab);
    } else {
      window.history.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onTabChange("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm group-hover:bg-slate-800 transition-colors">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 text-lg">NIKUNJ</span>
                <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded tracking-wide shadow-xs">
                  FITNESS
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider -mt-0.5">
                Club & Gym Ops
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Top Right Actions — High Eye Focus Buttons & Big Back Button */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick Check-in Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenQuickCheckIn}
            className="text-xs h-9 px-3 gap-1.5 border-slate-200 hover:border-slate-400 text-slate-700 bg-white"
          >
            <QrCode className="h-4 w-4 text-slate-600" />
            Quick Check-in
          </Button>

          {/* 🌟 EYE-CATCHING ADD MEMBER BUTTON 🌟 */}
          <button
            onClick={onOpenNewMember}
            className="relative group flex items-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40 hover:ring-emerald-400 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="p-1 rounded-md bg-white/20">
              <UserPlus className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span>+ Add Member</span>
            <span className="hidden md:inline-flex items-center justify-center bg-white/25 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              New
            </span>
          </button>

          {/* 🔙 BIG PROMINENT BACK BUTTON ON TOP RIGHT SIDE 🔙 */}
          <button
            onClick={handleBack}
            title={activeTab === "dashboard" ? "Go back" : "Return to Dashboard"}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-bold border-2 border-slate-800 bg-slate-900 text-white hover:bg-white hover:text-slate-900 hover:border-slate-900 shadow-sm transition-all cursor-pointer active:scale-95 group"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
            <span>{activeTab === "dashboard" ? "Back" : "Back to Home"}</span>
          </button>
        </div>

        {/* Mobile menu toggle & quick actions */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Mobile Add Member */}
          <button
            onClick={onOpenNewMember}
            className="h-9 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>

          {/* Mobile Back Button */}
          {activeTab !== "dashboard" && (
            <button
              onClick={handleBack}
              className="h-9 px-2.5 rounded-lg text-xs font-bold bg-slate-900 text-white flex items-center gap-1 shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                onOpenNewMember();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold text-white bg-emerald-600 shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              + Add Member
            </button>

            <button
              onClick={() => {
                handleBack();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  activeTab === item.id
                    ? "bg-slate-900 text-white font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
