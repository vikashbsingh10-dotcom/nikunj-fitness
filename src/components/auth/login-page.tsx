"use client";

import React, { useState } from "react";
import { AppUser } from "@/types";
import { AuthService, MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD } from "@/lib/auth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dumbbell, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, KeyRound } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await AuthService.login(email, password);
      if (res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || "Failed to sign in. Please verify your credentials.");
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdminCredentials = () => {
    setEmail(MASTER_ADMIN_EMAIL);
    setPassword(MASTER_ADMIN_PASSWORD);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 sm:p-6 text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20 mb-4 ring-4 ring-emerald-500/10">
            <Dumbbell className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Nikunj Fitness
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Gym Membership & Front-Desk Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Staff & Admin Sign In</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter your authorized credentials to access the system
              </p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  required
                  type="text"
                  placeholder="name@nikunjfitness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 bg-slate-950/70 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-xs"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 bg-slate-950/70 border-slate-700/80 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-2 shadow-lg shadow-emerald-500/20 transition-all mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Master Admin Quick Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                  Primary Admin Credentials
                </span>
                <button
                  type="button"
                  onClick={handleFillAdminCredentials}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1">
                <div>
                  <span className="text-slate-500">Email:</span>{" "}
                  <span className="text-slate-200 font-semibold">{MASTER_ADMIN_EMAIL}</span>
                </div>
                <div>
                  <span className="text-slate-500">Password:</span>{" "}
                  <span className="text-slate-200 font-semibold">{MASTER_ADMIN_PASSWORD}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Logged-in Admin can add new staff usernames &amp; passwords from the <strong>Users &amp; Staff</strong> tab.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Protected by Supabase Auth with Row-Level Security</span>
        </div>
      </div>
    </div>
  );
}
