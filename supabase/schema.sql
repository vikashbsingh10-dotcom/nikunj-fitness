-- ==============================================================================
-- GYM MEMBERSHIP MANAGEMENT SYSTEM - SUPABASE SCHEMA & SECURITY POLICIES
-- ==============================================================================

-- 1. Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLE: plans
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration_days INTEGER NOT NULL DEFAULT 30,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE TABLE: members
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    emergency_contact VARCHAR(150),
    gender VARCHAR(20) DEFAULT 'unspecified',
    date_of_birth DATE,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    custom_fee NUMERIC(10, 2),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'expired', 'inactive')),
    notes TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE TABLE: payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'credit_card',
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE TABLE: attendances
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

-- 6. CREATE TABLE: email_logs
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    recipient VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    subject TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_end_date ON public.members(end_date);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_attendances_member_id ON public.attendances(member_id);
CREATE INDEX IF NOT EXISTS idx_attendances_check_in_time ON public.attendances(check_in_time);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users & service role full CRUD operations
-- (Also allows anonymous key read/write for demo/staff gym desk deployments)
CREATE POLICY "Allow anon read/write plans" ON public.plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write members" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write attendances" ON public.attendances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write email_logs" ON public.email_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Automatic updated_at timestamp refresher
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_members_updated_at ON public.members;
CREATE TRIGGER trigger_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate member status based on end_date
CREATE OR REPLACE FUNCTION refresh_member_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date < CURRENT_DATE THEN
        NEW.status := 'expired';
    ELSIF NEW.end_date <= CURRENT_DATE + INTERVAL '7 days' THEN
        NEW.status := 'expiring';
    ELSE
        NEW.status := 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_member_status ON public.members;
CREATE TRIGGER trigger_calculate_member_status
    BEFORE INSERT OR UPDATE OF end_date ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION refresh_member_status();

-- ==============================================================================
-- SEED DATA (Default Plans & Members in INR ₹)
-- ==============================================================================
INSERT INTO public.plans (id, name, description, price, duration_days, features, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Standard Monthly', 'Unlimited gym floor access, cardio equipment & locker rooms.', 1499.00, 30, '["Gym floor access", "Cardio zone", "Locker room", "Free Wi-Fi"]'::jsonb, true),
    ('22222222-2222-2222-2222-222222222222', 'Quarterly Strength', '3-month access plus 2 complimentary personal training sessions.', 3999.00, 90, '["All Standard benefits", "2 Personal Training sessions", "Body scan analysis", "10% nutrition bar discount"]'::jsonb, true),
    ('33333333-3333-3333-3333-333333333333', 'Elite Annual VIP', 'Full 365-day all-inclusive membership, sauna, steam room & guest passes.', 12999.00, 365, '["All Quarterly benefits", "Sauna & Steam room access", "Unlimited guest passes", "Custom workout programming", "Towel service"]'::jsonb, true),
    ('44444444-4444-4444-4444-444444444444', 'Day Pass', 'Full access for a single day trial or traveling athlete.', 299.00, 1, '["1-day gym floor access", "Locker room access"]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- Sample Members
INSERT INTO public.members (id, full_name, email, phone, emergency_contact, plan_id, start_date, end_date, status, notes)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Aryan Sharma', 'aryan.sharma@example.com', '+91 98201 23456', 'Sunita Sharma: +91 98201 99887', '33333333-3333-3333-3333-333333333333', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '305 days', 'active', 'Focuses on powerlifting and hypertrophy.'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Priya Patel', 'priya.patel@example.com', '+91 98982 34567', 'Ketan Patel: +91 98982 11223', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '86 days', CURRENT_DATE + INTERVAL '4 days', 'expiring', 'Prefers morning classes and HIIT zone.'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Rohan Verma', 'rohan.verma@example.com', '+91 97112 45678', 'Anita Verma: +91 97112 77889', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '10 days', 'expired', 'Expired last week. Follow up for renewal.'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Ananya Iyer', 'ananya.iyer@example.com', '+91 99401 56789', 'Suresh Iyer: +91 99401 33445', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'active', 'Attends evening yoga and core training.')
ON CONFLICT (id) DO NOTHING;

-- Sample Payments
INSERT INTO public.payments (id, member_id, plan_id, amount, payment_method, receipt_number, payment_date, notes)
VALUES
    (uuid_generate_v4(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 12999.00, 'upi', 'REC-2026-001', timezone('utc'::text, now() - INTERVAL '60 days'), 'Annual Elite VIP via UPI'),
    (uuid_generate_v4(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 3999.00, 'credit_card', 'REC-2026-002', timezone('utc'::text, now() - INTERVAL '86 days'), 'Quarterly payment'),
    (uuid_generate_v4(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 1499.00, 'cash', 'REC-2026-003', timezone('utc'::text, now() - INTERVAL '15 days'), 'Standard monthly upfront cash')
ON CONFLICT DO NOTHING;

-- Sample Attendances
INSERT INTO public.attendances (id, member_id, check_in_time, notes)
VALUES
    (uuid_generate_v4(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', timezone('utc'::text, now() - INTERVAL '2 hours'), 'Front desk check-in'),
    (uuid_generate_v4(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', timezone('utc'::text, now() - INTERVAL '4 hours'), 'Morning workout'),
    (uuid_generate_v4(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', timezone('utc'::text, now() - INTERVAL '1 day 3 hours'), 'Evening session')
ON CONFLICT DO NOTHING;

