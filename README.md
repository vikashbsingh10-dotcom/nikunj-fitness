# 🏋️‍♂️ Nikunj Fitness — Gym Membership Management System

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Resend-Transactional_Email-black?style=for-the-badge&logo=resend" alt="Resend" />
  <img src="https://img.shields.io/badge/Vercel-Ready_to_Deploy-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

---

## 📖 Overview

**Nikunj Fitness** is a modern, responsive, high-performance **Gym Membership Management System** designed for gym owners, front-desk managers, and fitness studio operators. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Supabase PostgreSQL**, and **Resend**.

Engineered for real-world gym operations: fast 1-tap front-desk check-ins, automated expiry alerts, flexible owner-negotiable fee structures, digital GST invoices in **Indian Rupees (₹)**, and transactional email automation.

---

## ⚡ Key Highlights & Features

### 1. 👥 Member Registration & Directory
- **Custom Owner Fee Structure:** Standard plan duration (e.g. 30, 90, 365 days) is preserved, but the gym owner can customize the exact fee charged per member at registration and renewal.
- **Optional Phone Numbers:** Flexible member profiles where mobile number is optional.
- **Instant Search & Filters:** Real-time search across member names, emails, and phone numbers with status pills (🟢 *Active*, 🟡 *Expiring Soon*, 🔴 *Expired*).
- **Prominent Navigation:** Quick-action **+ Add Member** buttons and an ever-present **← Back to Dashboard** button on all sub-screens.

### 2. ⚡ Front-Desk Attendance Station
- **1-Tap Quick Check-in:** Designed for tablets, iPads, and front-desk monitors.
- **Live Stream:** Real-time log of today's gym entries with timestamps and plan badges.
- **Expiry Guard:** Alerts front-desk staff immediately if an expired member attempts to check in.

### 3. ⏰ Automated Expiry & Renewal Hub
- **Dynamic Date Math:** Automatically categorizes memberships into Active, Expiring within 7 days, and Overdue Expired.
- **1-Click Renewal:** Automatically extends valid memberships from their current end date or restarts expired memberships from today.
- **Owner Custom Renewal Fee:** Enter custom negotiated renewal rates with instant digital receipt generation.

### 4. 🧾 Billing Ledger & Receipts (INR ₹)
- **Indian Rupee Standard:** Native formatting across all KPI cards, revenue charts, and billing records (`₹1,499`, `₹12,000`).
- **Payment Methods:** Support for UPI, Cash, Credit Card, Debit Card, Net Banking, and Cheque.
- **Printable Invoices:** Clean digital receipt modal with print and email delivery options.

### 5. 📧 Transactional Email Automation (Resend)
- **Welcome Confirmation:** Sent automatically upon member registration with member details and agreed fees.
- **Payment Receipts:** Generated and delivered on every payment transaction.
- **Renewal Alerts:** 1-click renewal reminders sent directly from the dashboard.
- **Smart Sandbox Mode:** In test mode (`onboarding@resend.dev`), outgoing test emails are safely forwarded to the verified owner address (`vikashbsingh10@gmail.com`) with a preview banner. Once a domain is verified, emails deliver directly to each member.

### 6. 📊 Revenue Analytics Dashboard
- **Executive KPIs:** Active Members, Expiring Members, Monthly Recurring Revenue (MRR), and Today's Check-ins.
- **6-Month Visual Trend:** Interactive revenue chart displaying financial performance in INR.
- **Plan Breakdown:** Revenue distribution by membership tier.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Turbopack, Server & Client components, Route handlers |
| **UI Library** | [React 19](https://react.dev/) | Modern hooks, microtask scheduling, zero cascading renders |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Minimalist design system with high-contrast UI and responsive layouts |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, lightweight SVG iconography |
| **Database** | [Supabase](https://supabase.com/) | Hosted PostgreSQL with Row Level Security (RLS) policies |
| **Email API** | [Resend](https://resend.com/) | Transactional email delivery with HTML email templates |
| **Hosting** | [Vercel](https://vercel.com/) | Serverless edge deployment with automatic SSL and custom domains |

---

## 📁 Project Structure

```text
nikunj-fitness/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── email/
│   │   │   │   ├── receipt/route.ts      # Resend payment receipt endpoint
│   │   │   │   ├── reminder/route.ts     # Resend renewal reminder endpoint
│   │   │   │   └── welcome/route.ts      # Resend welcome confirmation endpoint
│   │   │   └── status/route.ts           # Cloud services health check
│   │   ├── favicon.ico
│   │   ├── globals.css                   # Tailwind CSS v4 styling
│   │   ├── layout.tsx                    # Root HTML layout & fonts
│   │   └── page.tsx                      # Main app shell & view coordinator
│   ├── components/
│   │   ├── attendance/                   # 1-Tap front-desk check-in station
│   │   ├── dashboard/                    # KPI stats cards, renewal hub, revenue charts
│   │   ├── members/                      # Member list, registration modal, details modal
│   │   ├── navbar.tsx                    # Header with prominent Back and Add Member buttons
│   │   ├── payments/                     # Billing ledger, invoice modal, payment recording
│   │   ├── plans/                        # Membership tiers and pricing management
│   │   ├── settings/                     # Supabase & Resend connection monitor
│   │   └── ui/                           # Reusable UI primitives (Button, Card, Badge, etc.)
│   ├── lib/
│   │   ├── resend.ts                     # Resend email templates & sandbox auto-fallback
│   │   ├── store.ts                      # Unified data access layer (Supabase + local fallback)
│   │   ├── utils.ts                      # INR currency formatting, date calculations
│   │   └── supabase/
│   │       ├── client.ts                 # Browser Supabase client
│   │       └── server.ts                 # Server-side Supabase client
│   └── types/
│       └── index.ts                      # Strict TypeScript interfaces
├── supabase/
│   └── schema.sql                        # PostgreSQL tables, indexes, and RLS policies
├── .env.example                          # Safe environment variable template
├── .gitignore                            # Ignores sensitive keys, node_modules, and build outputs
├── next.config.ts                        # Next.js configuration
├── package.json                          # Dependencies and build scripts
├── tsconfig.json                         # Strict TypeScript configuration
└── README.md                             # Project documentation
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** v20.x or higher
- **npm** or **yarn** / **pnpm**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/<your-username>/nikunj-fitness.git
cd nikunj-fitness
npm install
```

### 3. Environment Configuration
Copy the template `.env.example` into `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration in `.env.local`:
```env
# 1. Supabase PostgreSQL Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# 2. Resend Email Service Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Nikunj Fitness <onboarding@resend.dev>

# 3. Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a free account and project at **[supabase.com](https://supabase.com)**.
2. In the Supabase Dashboard, navigate to the **SQL Editor**.
3. Open [`supabase/schema.sql`](file:///z:/Nikunj/supabase/schema.sql) from this repository, paste its contents, and click **Run**.
4. The script provisions:
   - `plans`: Membership tiers, duration in days, standard pricing, and features.
   - `members`: Profiles with full contact info, optional phone, owner `custom_fee`, validity dates, and status triggers.
   - `payments`: Digital transaction history, receipt IDs, and payment methods.
   - `attendances`: Daily entry timestamps with member references.
   - `email_logs`: Message audit log.
   - **Row Level Security (RLS)** policies enabled across all tables.
5. In your Supabase Project Settings under **API**, copy the **Project URL** and **Anon Public Key** into your `.env.local`.

---

## 📧 Resend Email Setup

1. Sign up at **[resend.com](https://resend.com)** and create an API Key under **API Keys**.
2. Add your key to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```
3. **Sandbox Testing Mode:**
   - Resend provides a free test sender: `onboarding@resend.dev`.
   - By Resend security policy, sandbox emails are only delivered to your verified account email (`vikashbsingh10@gmail.com`).
   - The system automatically handles this by routing testing emails to your owner inbox with a preview banner indicating the intended member recipient.
4. **Sending Directly to Member Mailboxes:**
   - Go to **[resend.com/domains](https://resend.com/domains)** and click **Add Domain** (e.g. `nikunjfitness.com`).
   - Add the 3 DNS records (DKIM, SPF) provided by Resend to your domain registrar.
   - Update `.env.local` or your Vercel Environment Variables:
     ```env
     RESEND_FROM_EMAIL=Nikunj Fitness <info@nikunjfitness.com>
     ```

---

## ☁️ Deploy to Vercel (Step-by-Step)

The project is **100% verified and optimized for zero-downtime deployment on Vercel**.

### Step 1: Push Repository to GitHub
*(Run these commands in your local terminal when you are ready to push)*
```bash
# Initialize and verify git branch
git branch -M main

# Add your GitHub remote repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Push code to GitHub
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to **[vercel.com](https://vercel.com)**.
2. Click **Add New...** > **Project**.
3. Select your GitHub repository (`nikunj-fitness` or `gym-management`) and click **Import**.

### Step 3: Configure Environment Variables in Vercel
Under the **Environment Variables** section before deploying, add the following:

| Key | Example Value | Where to find |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Dashboard > Settings > API (Optional, for admin) |
| `RESEND_API_KEY` | `re_123456...` | Resend Dashboard > API Keys |
| `RESEND_FROM_EMAIL` | `Nikunj Fitness <onboarding@resend.dev>` | Resend Sender or verified domain |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Your deployed Vercel domain |

### Step 4: Deploy & Verify
1. Click **Deploy**. Vercel will build the application in ~1 minute.
2. Once complete, visit your live URL: `https://your-app.vercel.app`.
3. Check the **System Status** tab in the app to confirm both **Supabase** and **Resend** report green connected status.

---

## 🌐 Custom Domain Setup (via Vercel)

1. In your Vercel Project Dashboard, navigate to **Settings** > **Domains**.
2. Enter your domain (e.g., `gym.nikunjfitness.com` or `nikunjfitness.com`) and click **Add**.
3. In your DNS provider (GoDaddy, Cloudflare, Namecheap, Hostinger, etc.):
   - **For Subdomains** (e.g. `gym.nikunjfitness.com`):
     - Type: `CNAME`
     - Name: `gym`
     - Target: `cname.vercel-dns.com`
   - **For Apex/Root Domain** (e.g. `nikunjfitness.com`):
     - Type: `A`
     - Name: `@`
     - Target: `76.76.21.21`
4. Vercel will automatically verify DNS and issue a free SSL certificate within minutes.

---

## 🔒 Security & Code Quality

- **Zero TypeScript Errors:** Strict typechecking passes cleanly (`npm run build`).
- **Zero ESLint Warnings:** Lint suite runs with 0 errors and 0 warnings (`npm run lint`).
- **Secret Protection:** `.env*` files are strictly excluded from git via [`.gitignore`](file:///z:/Nikunj/.gitignore). Only the safe [`.env.example`](file:///z:/Nikunj/.env.example) is committed.
- **PostgreSQL Row Level Security:** Built-in RLS policies on Supabase ensure protected database access.
- **Resend Anti-Spam Compliance:** Automatic fallback keeps outgoing emails secure and prevents sandbox bounce penalties.

---

## 📄 License
This project is open-source and available under the **MIT License**. Free for commercial and personal gym operations.
