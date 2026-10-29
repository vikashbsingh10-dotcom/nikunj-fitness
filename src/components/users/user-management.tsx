"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppUser, UserRole } from "@/types";
import { AuthService, MASTER_ADMIN_EMAIL } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { useToast } from "../ui/toast-context";
import { formatDate } from "@/lib/utils";
import {
  UserPlus,
  ShieldCheck,
  UserCheck,
  Trash2,
  Lock,
  Mail,
  User,
  Shield,
  RotateCw,
  Power,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

interface UserManagementProps {
  currentUser: AppUser;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("staff");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const list = await AuthService.getStaffUsers();
      setUsers(list);
    } catch (err) {
      console.error("Failed to load staff users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    AuthService.getStaffUsers().then((list) => {
      if (!ignore) {
        setUsers(list);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPassword) {
      toast.error("Required fields missing", "Name, email/username, and password are required.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AuthService.createStaffUser({
        full_name: newFullName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });

      if (res.user) {
        toast.success(
          `User ${res.user.full_name} created!`,
          `Role: ${res.user.role.toUpperCase()}. User can now sign in immediately.`
        );
        // Reset form & reload
        setNewFullName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("staff");
        setIsModalOpen(false);
        await loadUsers();
      } else {
        toast.error("Failed to create user", res.error);
      }
    } catch {
      toast.error("Creation error", "Could not create user account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AppUser) => {
    if (user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      toast.error("Action denied", "Cannot deactivate the Master Admin account.");
      return;
    }

    try {
      const res = await AuthService.toggleStaffStatus(user.id);
      if (res.success) {
        toast.info(
          `User ${user.full_name} ${user.is_active ? "Deactivated" : "Activated"}`,
          `Login access has been ${user.is_active ? "disabled" : "enabled"}.`
        );
        await loadUsers();
      } else {
        toast.error("Action failed", res.error);
      }
    } catch {
      toast.error("Error", "Could not toggle user status.");
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      toast.error("Action denied", "Cannot delete the primary Master Admin account.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete staff account: ${user.full_name} (${user.email})?`);
    if (!confirmed) return;

    try {
      const res = await AuthService.deleteStaffUser(user.id);
      if (res.success) {
        toast.success("User deleted", `Removed account for ${user.full_name}.`);
        await loadUsers();
      } else {
        toast.error("Deletion failed", res.error);
      }
    } catch {
      toast.error("Error", "Could not delete user account.");
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const activeCount = users.filter((u) => u.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              User &amp; Staff Access Management
            </h2>
            <Badge variant="outline" className="text-[11px] font-bold text-amber-800 bg-amber-50 border-amber-300">
              Admin Exclusive
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <strong className="text-slate-800">{currentUser.full_name}</strong>. Create front-desk staff accounts, manage administrator privileges, and control portal sign-in credentials.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          + Add New User / Staff
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Users</span>
            <UserCheck className="h-4 w-4 text-slate-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{users.length}</p>
          <span className="text-[10px] text-slate-400">Authorized accounts</span>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Administrators</span>
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">{adminCount}</p>
          <span className="text-[10px] text-slate-400">Full control access</span>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Staff / Front Desk</span>
            <User className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{staffCount}</p>
          <span className="text-[10px] text-slate-400">Check-in &amp; Billing</span>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Accounts</span>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-green-600 mt-2">{activeCount}</p>
          <span className="text-[10px] text-slate-400">Enabled sign-ins</span>
        </Card>
      </div>

      {/* Users List Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-700" />
            <CardTitle className="text-sm font-bold">Authorized System Users</CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadUsers}
            disabled={loading}
            className="text-xs h-7 px-2 gap-1 text-slate-500 hover:text-slate-900"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 font-semibold">User Details</th>
                  <th className="py-3 px-3 font-semibold">Username / Email</th>
                  <th className="py-3 px-3 font-semibold">Role</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Created</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isMaster = user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              user.role === "admin"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {user.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.full_name}</span>
                              {isMaster && (
                                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full uppercase">
                                  Master Admin
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">ID: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700 font-medium">
                        {user.email}
                      </td>

                      <td className="py-3.5 px-3">
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          className={`text-[10px] font-bold gap-1 ${
                            user.role === "admin"
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <>
                              <ShieldCheck className="h-3 w-3" /> Administrator
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3" /> Staff / Front Desk
                            </>
                          )}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3">
                        <Badge
                          variant={user.is_active ? "success" : "destructive"}
                          className="text-[10px]"
                        >
                          {user.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 font-medium text-[11px]">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isMaster ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleStatus(user)}
                                className={`text-[11px] h-7 px-2 gap-1 ${
                                  user.is_active
                                    ? "text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
                                    : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                                }`}
                              >
                                <Power className="h-3 w-3" />
                                {user.is_active ? "Disable" : "Enable"}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(user)}
                                className="text-[11px] h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic px-2">Primary Master</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add New User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Add New Portal User</DialogTitle>
              <DialogDescription>
                Create credentials for staff or secondary administrators.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Staff Full Name *</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                required
                placeholder="e.g. Ramesh Kumar"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Email / Username */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Email Address / Username *</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                required
                type="text"
                placeholder="ramesh@nikunjfitness.com or ramesh_frontdesk"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              This will be used as their login identity on the login screen.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Login Password *</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                required
                type="text"
                placeholder="Minimum 6 characters (e.g. Ramesh@2026)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Account Role *</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div
                onClick={() => setNewRole("staff")}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  newRole === "staff"
                    ? "border-emerald-500 bg-emerald-50/60 text-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-emerald-600" /> Staff
                  </span>
                  {newRole === "staff" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-slate-500">
                  Can register members, take payments, and run check-ins. No user management access.
                </p>
              </div>

              <div
                onClick={() => setNewRole("admin")}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  newRole === "admin"
                    ? "border-indigo-500 bg-indigo-50/60 text-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Administrator
                  </span>
                  {newRole === "admin" && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />}
                </div>
                <p className="text-[10px] text-slate-500">
                  Full control including membership pricing, database settings, and staff credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <KeyRound className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Instant Activation:</strong> Once created, this user can immediately sign in at the login screen using the email and password set above.
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isSubmitting ? "Creating User..." : "Create Account & Grant Access"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
