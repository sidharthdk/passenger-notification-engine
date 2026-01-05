-- WARNING: This will delete existing data in these tables.
-- Run this in Supabase SQL Editor to reset the schema to the correct state.

DROP TABLE IF EXISTS public.notification_logs;
DROP TABLE IF EXISTS public.bookings;
DROP TABLE IF EXISTS public.passengers;
DROP TABLE IF EXISTS public.flights;

-- Re-create tables
CREATE TABLE public.flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    status flight_status NOT NULL DEFAULT 'ON_TIME',
    delay_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    preferred_language TEXT DEFAULT 'en'
);

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES public.flights(id),
    passenger_id UUID REFERENCES public.passengers(id),
    seat_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id),
    channel notification_channel NOT NULL,
);

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
