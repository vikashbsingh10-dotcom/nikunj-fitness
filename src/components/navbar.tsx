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
  Database,
} from "lucide-react";
import { Button } from "./ui/button";

export type NavTab = "dashboard" | "members" | "attendance" | "plans" | "payments" | "settings";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewMember: () => void;
  onOpenQuickCheckIn: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  onOpenNewMember,
  onOpenQuickCheckIn,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "members", label: "Members", icon: <Users className="h-4 w-4" /> },
    { id: "attendance", label: "Attendance", icon: <QrCode className="h-4 w-4" /> },
    { id: "plans", label: "Plans", icon: <Layers className="h-4 w-4" /> },
    { id: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
    { id: "settings", label: "Config & Docs", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onTabChange("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs group-hover:bg-slate-800 transition-colors">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-900 text-base">APEX</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5 uppercase tracking-wider">GymOps</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenQuickCheckIn}
            className="text-xs h-8 gap-1.5 border-dashed hover:border-solid text-slate-700"
          >
            <QrCode className="h-3.5 w-3.5 text-slate-500" />
            Quick Check-in
          </Button>

          <Button
            size="sm"
            onClick={onOpenNewMember}
            className="text-xs h-8 gap-1.5 bg-slate-900 hover:bg-slate-800"
          >
            <UserPlus className="h-3.5 w-3.5" />
            New Member
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenQuickCheckIn}
            className="h-8 w-8 p-0"
            title="Check In"
          >
            <QrCode className="h-4 w-4" />
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Button
              size="sm"
              onClick={() => {
                onOpenNewMember();
                setMobileMenuOpen(false);
              }}
              className="w-full text-xs gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Register New Member
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

