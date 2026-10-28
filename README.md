# 🏋️‍♂️ Apex GymOps — Modern Gym Membership Management System

A modern, minimalist, responsive **Gym Membership Management System** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** aesthetics. Powered by **Supabase PostgreSQL** for secure storage and **Resend** for transactional member emails.

Designed for gym owners, front-desk staff, and personal training studios who demand **speed, zero-clutter UI/UX, mobile responsiveness, and accurate membership expiry tracking**.

---

## ⚡ Key Features

- **Member Registration & Directory:**
  - Create athlete profiles with full contact details, emergency contacts, notes, and plan assignment.
  - Automatic calculation of membership duration and expiry date based on selected tier.
  - Search members instantly by name, phone, or email. Filter by status (*Active, Expiring Soon, Expired*) or membership plan.

- **Membership Plans & Pricing:**
  - Configurable tiers (e.g., *Standard Monthly, Quarterly Strength, Elite Annual VIP, Day Pass*).
  - Customize validity duration in days, pricing, and facility privileges.

- **Automated Expiry Tracking:**
  - Dynamic status calculation with real-time badges:
    - 🟢 **Active:** Membership in good standing.
    - 🟡 **Expiring Soon:** 7 days or fewer remaining (triggers alert watchlist).
    - 🔴 **Expired:** Overdue membership access.

- **Payment Records & Digital Receipts:**
  - Auto-generated receipt numbers (`REC-YYYY-XXXX`).
  - Support for multiple payment methods (*Credit Card, Debit Card, Cash, Bank Transfer, Stripe, UPI*).
  - Clean digital invoice modal with instant browser print or email delivery.

- **Transactional Emails via Resend:**
  - 📩 **Welcome Confirmation:** Sent upon member registration with plan duration.
  - 🧾 **Payment Receipt:** Sent upon billing transaction.
  - ⏰ **Renewal Reminders:** 1-click or automated reminder emails sent to expiring/expired members.

- **Attendance & Check-in Station:**
  - 1-Tap fast front desk check-in station (ideal for front-desk iPads/tablets or smartphones).
  - Real-time today's check-in stream, visit logs, and attendance counters.

- **Revenue Dashboard & Analytics:**
  - KPI cards: Monthly Recurring Revenue (MRR), Total Revenue, Active Members, Expiring Count, Today's Check-ins.
  - 6-month visual revenue trend.
  - Plan-by-plan revenue breakdown.

---

## 🛠️ Tech Stack & Philosophy

| Technology | Purpose |
| :--- | :--- |
| **Next.js (App Router)** | High-performance React framework with Server & Client components |
| **TypeScript** | Strict type safety across database models and UI props |
| **Tailwind CSS** | Minimalist, responsive utility styling with high-contrast palette |
| **shadcn/ui Design** | Accessible, clean UI components (Card, Dialog, Button, Badge, Tabs) |
| **Supabase** | PostgreSQL database with Row Level Security (RLS) policies |
| **Resend** | Reliable transactional email delivery for gym notifications |
| **Vercel** | Seamless serverless deployment with instant custom domain support |

> **Minimalist & Zero Lock-in:** Includes an intelligent fallback store that allows full interactive local testing even before configuring Supabase keys, and seamlessly links to Supabase once credentials are set.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/gym-management.git
cd gym-management
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
# Supabase PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Apex Fitness <onboarding@resend.dev>

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** in your Supabase dashboard.
3. Open the provided file `supabase/schema.sql` in this repository and run the script.
4. The script provisions:
   - `plans` table with default gym tiers.
   - `members` table with status calculation triggers and indexes.
   - `payments` table with receipt tracking.
   - `attendances` table with real-time timestamps.
   - `email_logs` table for message audits.
   - **Row Level Security (RLS)** policies enabled for secure operations.
5. In Supabase Dashboard, go to **Project Settings > API**, copy `Project URL` and `anon public` key, and paste into `.env.local`.

---

## 📧 Resend Email Integration

1. Create a free account at [resend.com](https://resend.com).
2. Generate an API Key under **API Keys** and set `RESEND_API_KEY=re_...` in `.env.local`.
3. To test immediately without a domain, use the verified sandbox sender:
   ```env
   RESEND_FROM_EMAIL=Apex Fitness <onboarding@resend.dev>
   ```
4. For production, add your custom domain in Resend (**Domains > Add Domain**) and update DNS records (DKIM, SPF).

---

## ☁️ Vercel Deployment & Custom Domain

### Deploy to Vercel
1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete gym management system"
   git branch -M main
   git remote add origin https://github.com/<your-username>/gym-management.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In **Environment Variables**, paste the keys from your `.env.local`.
4. Click **Deploy**. Vercel will build and deploy the Next.js application in ~1 minute.

### Connect Custom Domain
1. In your Vercel project dashboard, navigate to **Settings > Domains**.
2. Enter your custom domain (e.g., `gym.yourdomain.com` or `yourdomain.com`).
3. Add the required DNS records in your domain registrar:
   - For subdomains (`gym.yourdomain.com`): Add a **CNAME** record pointing to `cname.vercel-dns.com`.
   - For root domains (`yourdomain.com`): Add an **A** record pointing to `76.76.21.21`.
4. Vercel automatically issues an SSL certificate within a few minutes.

---

## 🔒 Security Best Practices

- **Row Level Security (RLS):** All Supabase tables enforce PostgreSQL RLS policies.
- **Environment Isolation:** Sensitive server keys (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) are kept on the server and never exposed to the client bundle.
- **Graceful Error Handling:** System falls back gracefully with notifications if third-party APIs encounter downtime or rate limits.

---

## 📄 License
MIT License. Free for commercial and personal gym operations.
