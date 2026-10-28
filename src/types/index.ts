export type MembershipStatus = "active" | "expiring" | "expired" | "inactive";

export type PaymentMethod = "credit_card" | "debit_card" | "cash" | "bank_transfer" | "upi" | "stripe";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  emergency_contact: string;
  gender?: "male" | "female" | "other" | "unspecified";
  date_of_birth?: string;
  plan_id: string;
  plan?: Plan;
  start_date: string;
  end_date: string;
  status: MembershipStatus;
  notes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  member?: {
    full_name: string;
    email: string;
  };
  plan_id: string;
  plan?: {
    name: string;
  };
  amount: number;
  payment_method: PaymentMethod;
  receipt_number: string;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  member?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    plan_name?: string;
    status: MembershipStatus;
  };
  check_in_time: string;
  notes?: string;
}

export interface EmailLog {
  id: string;
  member_id: string;
  recipient: string;
  email_type: "welcome" | "receipt" | "reminder";
  subject: string;
  status: "sent" | "failed" | "simulated";
  sent_at: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  expiringMembers: number;
  expiredMembers: number;
  todayCheckIns: number;
  monthlyRevenue: number;
  totalRevenue: number;
  revenueByPlan: {
    planName: string;
    count: number;
    totalAmount: number;
  }[];
  monthlyRevenueTrend: {
    month: string;
    amount: number;
  }[];
}

