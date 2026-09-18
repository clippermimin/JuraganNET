-- ==============================================================================
-- JURAGAN NET (SaaS Multi-Tenant Database Schema)
-- Designed for Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tenants Table (Multi-tenant SaaS Foundation)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(150) NOT NULL DEFAULT 'Arjuna Net',
    owner_name VARCHAR(150) NOT NULL DEFAULT 'Pak Juragan',
    phone VARCHAR(50) DEFAULT '081234567890',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers Table (Warga RT/RW Net)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    area VARCHAR(100) NOT NULL, -- e.g. 'RW 04 Cipinang', 'RW 02 Cileweun'
    monthly_fee NUMERIC(12, 2) NOT NULL DEFAULT 100000,
    phone VARCHAR(50),
    is_paid BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for speed in querying hundreds of customers per tenant & area
CREATE INDEX IF NOT EXISTS idx_customers_tenant_area ON customers(tenant_id, area);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_paid ON customers(tenant_id, is_paid);

-- 4. Transactions Table (Pencatatan Uang Masuk & Keluar)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    account VARCHAR(20) NOT NULL CHECK (account IN ('BUSINESS', 'PERSONAL')),
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    notes TEXT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_account ON transactions(tenant_id, account, type);

-- 5. Recurring Bills Table (Kewajiban Rutin Bulanan)
CREATE TABLE IF NOT EXISTS recurring_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    account VARCHAR(20) NOT NULL DEFAULT 'BUSINESS' CHECK (account IN ('BUSINESS', 'PERSONAL')),
    due_day INT NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 31),
    is_paid BOOLEAN NOT NULL DEFAULT false,
    last_paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_bills_tenant ON recurring_bills(tenant_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - Siap SaaS Multi-Tenant
-- ==============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;

-- Demo policy
CREATE POLICY "Allow public read-write for demo tenants" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow public read-write for demo customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow public read-write for demo transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow public read-write for demo recurring_bills" ON recurring_bills FOR ALL USING (true);

-- ==============================================================================
-- SEED DATA DEFAULT (Arjuna Net)
-- ==============================================================================
INSERT INTO tenants (id, business_name, owner_name, phone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Arjuna Net', 'Pak Arjuna', '081234567890')
ON CONFLICT (id) DO NOTHING;

-- Seed Kewajiban Rutin
INSERT INTO recurring_bills (tenant_id, title, amount, account, due_day, is_paid)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'ISP Urban Bandwidth Utama', 4500000, 'BUSINESS', 5, false),
    ('00000000-0000-0000-0000-000000000001', 'Gaji Mas Dwi (Teknisi)', 2500000, 'BUSINESS', 1, false),
    ('00000000-0000-0000-0000-000000000001', 'Kas RW 04 Cipinang', 250000, 'BUSINESS', 10, false),
    ('00000000-0000-0000-0000-000000000001', 'Listrik Server & OLT', 650000, 'BUSINESS', 15, true),
    ('00000000-0000-0000-0000-000000000001', 'Sewa Tiang & Kontrakan Hub', 500000, 'BUSINESS', 20, false)
ON CONFLICT DO NOTHING;
