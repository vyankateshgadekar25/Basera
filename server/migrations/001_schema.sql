-- Basera PG/Hostel Management Database Schema
-- PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('owner', 'renter');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

CREATE TYPE gender_pref AS ENUM ('male', 'female', 'any');

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    gender_pref gender_pref NOT NULL DEFAULT 'any',
    rules TEXT,
    contact_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_gender ON properties(gender_pref);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_property ON rooms(property_id);

CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_beds_room ON beds(room_id);

CREATE TYPE tenancy_status AS ENUM ('active', 'archived');

CREATE TABLE tenancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE RESTRICT,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    move_in_date DATE NOT NULL,
    move_out_date DATE,
    monthly_rent NUMERIC(10,2) NOT NULL,
    deposit NUMERIC(10,2) NOT NULL DEFAULT 0,
    status tenancy_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenancies_bed ON tenancies(bed_id);
CREATE INDEX idx_tenancies_property ON tenancies(property_id);
CREATE INDEX idx_tenancies_renter ON tenancies(renter_id);
CREATE INDEX idx_tenancies_status ON tenancies(status);

CREATE UNIQUE INDEX idx_one_active_tenancy_per_bed ON tenancies(bed_id) WHERE status = 'active';

CREATE TYPE bill_status AS ENUM ('pending', 'submitted', 'paid', 'rejected');

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
    month CHAR(7) NOT NULL,
    amount_due NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2),
    status bill_status NOT NULL DEFAULT 'pending',
    utr TEXT,
    proof_image_url TEXT,
    proof_hash TEXT,
    flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    submitted_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bills_tenancy ON bills(tenancy_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_month ON bills(month);
CREATE UNIQUE INDEX idx_one_bill_per_month ON bills(tenancy_id, month);

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE RESTRICT,
    renter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    cleanliness INTEGER NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
    responsiveness INTEGER NOT NULL CHECK (responsiveness BETWEEN 1 AND 5),
    safety INTEGER NOT NULL CHECK (safety BETWEEN 1 AND 5),
    comment TEXT,
    owner_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ratings_property ON ratings(property_id);
CREATE INDEX idx_ratings_tenancy ON ratings(tenancy_id);
CREATE INDEX idx_ratings_renter ON ratings(renter_id);
CREATE UNIQUE INDEX idx_one_rating_per_renter_property ON ratings(renter_id, property_id);

CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_codes(phone);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);

-- Views
CREATE OR REPLACE VIEW property_vacancy_summary AS
SELECT 
    p.id AS property_id,
    COUNT(b.id) AS total_beds,
    COUNT(t.id) FILTER (WHERE t.status = 'active') AS occupied_beds,
    COUNT(b.id) - COUNT(t.id) FILTER (WHERE t.status = 'active') AS vacant_beds
FROM properties p
LEFT JOIN rooms r ON r.property_id = p.id
LEFT JOIN beds b ON b.room_id = r.id
LEFT JOIN tenancies t ON t.bed_id = b.id AND t.status = 'active'
GROUP BY p.id;

CREATE OR REPLACE VIEW tenant_bill_summary AS
SELECT 
    t.id AS tenancy_id,
    u.name AS renter_name,
    p.name AS property_name,
    r.label AS room_label,
    b.label AS bed_label,
    t.monthly_rent,
    bl.month AS current_month,
    bl.status AS bill_status,
    bl.amount_due,
    bl.amount_paid
FROM tenancies t
JOIN users u ON u.id = t.renter_id
JOIN properties p ON p.id = t.property_id
JOIN rooms r ON r.property_id = p.id
JOIN beds b ON b.id = t.bed_id AND b.room_id = r.id
LEFT JOIN bills bl ON bl.tenancy_id = t.id AND bl.month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
WHERE t.status = 'active';
