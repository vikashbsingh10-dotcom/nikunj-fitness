import { AppUser, StoredStaffUser, UserRole } from "@/types";
import { createClient, isSupabaseConfigured } from "./supabase/client";

export const MASTER_ADMIN_EMAIL = "vikashbsingh10@gmail.com";
export const MASTER_ADMIN_PASSWORD = "Vikram@3000";

const AUTH_STORAGE_KEY = "nikunj_gym_auth_user";
const STAFF_STORAGE_KEY = "nikunj_gym_staff_users";

function getInitialStaffUsers(): StoredStaffUser[] {
  return [
    {
      id: "admin-master-id-001",
      email: MASTER_ADMIN_EMAIL,
      full_name: "Vikash Singh (Master Admin)",
      role: "admin",
      plain_password: MASTER_ADMIN_PASSWORD,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "staff-demo-id-002",
      email: "frontdesk@nikunjfitness.com",
      full_name: "Front Desk Staff",
      role: "staff",
      plain_password: "Staff@12345",
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
}

function getStoredStaffList(): StoredStaffUser[] {
  if (typeof window === "undefined") return getInitialStaffUsers();
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialStaffUsers();
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as StoredStaffUser[];
    // Ensure master admin is always present and active
    const hasAdmin = parsed.some((u) => u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase());
    if (!hasAdmin) {
      const updated = [getInitialStaffUsers()[0], ...parsed];
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return parsed;
  } catch {
    return getInitialStaffUsers();
  }
}

function saveStoredStaffList(list: StoredStaffUser[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save staff users list:", err);
  }
}

export class AuthService {
  /**
   * Get current authenticated user from storage or Supabase session
   */
  static getCurrentUser(): AppUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppUser;
    } catch {
      return null;
    }
  }

  /**
   * Log in with Email / Username & Password
   */
  static async login(
    emailInput: string,
    passwordInput: string
  ): Promise<{ user?: AppUser; error?: string }> {
    const emailNormalized = emailInput.trim().toLowerCase();
    const passwordClean = passwordInput.trim();

    if (!emailNormalized || !passwordClean) {
      return { error: "Please provide both email/username and password." };
    }

    // 1. Try Supabase Auth if configured
    let supabaseUser: AppUser | null = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailNormalized,
          password: passwordClean,
        });

        if (!error && data.user) {
          const roleFromMeta = (data.user.user_metadata?.role as UserRole) ||
            (emailNormalized === MASTER_ADMIN_EMAIL.toLowerCase() ? "admin" : "staff");

          supabaseUser = {
            id: data.user.id,
            email: data.user.email || emailNormalized,
            full_name: (data.user.user_metadata?.full_name as string) || (roleFromMeta === "admin" ? "Vikash Singh (Admin)" : "Staff Member"),
            role: roleFromMeta,
            is_active: true,
            created_at: data.user.created_at,
          };
        }
      } catch (err) {
        console.warn("Supabase auth check notice:", err);
      }
    }

    if (supabaseUser) {
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(supabaseUser));
      }
      return { user: supabaseUser };
    }

    // 2. Check Master Admin Credentials
    if (
      emailNormalized === MASTER_ADMIN_EMAIL.toLowerCase() &&
      passwordClean === MASTER_ADMIN_PASSWORD
    ) {
      const adminUser: AppUser = {
        id: "admin-master-id-001",
        email: MASTER_ADMIN_EMAIL,
        full_name: "Vikash Singh (Master Admin)",
        role: "admin",
        is_active: true,
        created_at: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      }
      return { user: adminUser };
    }

    // 3. Check registered Staff Users list
    const staffList = getStoredStaffList();
    const matched = staffList.find(
      (u) =>
        u.email.toLowerCase() === emailNormalized ||
        (u.username && u.username.toLowerCase() === emailNormalized)
    );

    if (matched) {
      if (!matched.is_active) {
        return { error: "This staff account has been deactivated by the Administrator." };
      }

      if (matched.plain_password === passwordClean) {
        const loggedUser: AppUser = {
          id: matched.id,
          email: matched.email,
          username: matched.username,
          full_name: matched.full_name,
          role: matched.role,
          is_active: matched.is_active,
          created_at: matched.created_at,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
        }
        return { user: loggedUser };
      }
    }

    return { error: "Invalid credentials. Please verify your email/username and password." };
  }

  /**
   * Log out and clear session
   */
  static async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut notice:", err);
      }
    }
  }

  /**
   * Fetch all registered staff & admin users (Admin only)
   */
  static async getStaffUsers(): Promise<AppUser[]> {
    const list = getStoredStaffList();
    // Return sanitized users without passwords
    return list.map(({ id, email, username, full_name, role, is_active, created_at }) => ({
      id,
      email,
      username,
      full_name,
      role,
      is_active,
      created_at,
    }));
  }

  /**
   * Create a new Staff / Admin user (Admin only)
   */
  static async createStaffUser(data: {
    email: string;
    username?: string;
    full_name: string;
    password: string;
    role: UserRole;
  }): Promise<{ user?: AppUser; error?: string }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.password.trim();

    if (!cleanEmail || !cleanPass || !data.full_name.trim()) {
      return { error: "All fields (Email, Full Name, Password) are mandatory." };
    }

    if (cleanPass.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const currentList = getStoredStaffList();
    if (currentList.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { error: "A user with this email address already exists." };
    }

    const newId = crypto.randomUUID();
    const newUser: StoredStaffUser = {
      id: newId,
      email: cleanEmail,
      username: data.username?.trim().toLowerCase() || undefined,
      full_name: data.full_name.trim(),
      role: data.role,
      plain_password: cleanPass,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Try Supabase Auth signUp as well so the user exists in Supabase cloud
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: data.full_name.trim(),
              role: data.role,
            },
          },
        });
      } catch (err) {
        console.warn("Supabase user creation notice:", err);
      }
    }

    saveStoredStaffList([newUser, ...currentList]);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        full_name: newUser.full_name,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at,
      },
    };
  }

  /**
   * Delete a staff user (Cannot delete Master Admin)
   */
  static async deleteStaffUser(id: string): Promise<{ success: boolean; error?: string }> {
    const currentList = getStoredStaffList();
    const target = currentList.find((u) => u.id === id);

    if (!target) {
      return { success: false, error: "User not found." };
    }

    if (target.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: "The primary Master Admin account cannot be deleted." };
    }

    const updated = currentList.filter((u) => u.id !== id);
    saveStoredStaffList(updated);

    return { success: true };
  }

  /**
   * Toggle Active / Inactive status of a staff user
   */
  static async toggleStaffStatus(id: string): Promise<{ success: boolean; error?: string }> {
    const currentList = getStoredStaffList();
    const target = currentList.find((u) => u.id === id);

    if (!target) {
      return { success: false, error: "User not found." };
    }

    if (target.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: "The Master Admin account cannot be disabled." };
    }

    const updated = currentList.map((u) =>
      u.id === id ? { ...u, is_active: !u.is_active } : u
    );

    saveStoredStaffList(updated);

    return { success: true };
  }
}

