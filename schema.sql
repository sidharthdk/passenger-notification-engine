-- Run this in your Supabase SQL Editor

-- Tables (Create if not exists)
CREATE TABLE IF NOT EXISTS public.flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'ON_TIME', -- Changed enum to text for flexibility/simplicity in this context
    delay_minutes INTEGER NOT NULL DEFAULT 0,
    gate TEXT,
    terminal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    preferred_language TEXT DEFAULT 'en',
    password TEXT -- ADDED for MVP Auth
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES public.flights(id),
    passenger_id UUID REFERENCES public.passengers(id),
    seat_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- NEW FIELDS FOR PASSENGER PORTAL
    passenger_status TEXT DEFAULT 'ON_TIME', -- 'ON_TIME', 'RUNNING_LATE', 'MIGHT_MISS'
    ticket_price DECIMAL DEFAULT 0,
    fare_class TEXT DEFAULT 'ECONOMY' -- 'ECONOMY', 'BUSINESS'
);

CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id),
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    payload JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Other tables: notification_jobs, mcp_decisions, admin_overrides remain same, ensuring we cover them if needed)
CREATE TABLE IF NOT EXISTS public.notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES public.flights(id),
    booking_id UUID REFERENCES public.bookings(id),
    channel TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'BLOCKED', 'RETRYING')),
    payload JSONB,
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS public.mcp_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES public.flights(id),
    decision TEXT NOT NULL CHECK (decision IN ('APPROVE', 'FLAG', 'BLOCK')),
    severity TEXT NOT NULL,
    risk_score FLOAT NOT NULL,
    reason TEXT,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES public.flights(id),
    overridden_by UUID REFERENCES auth.users(id), 
    reason TEXT NOT NULL,
    original_decision TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
