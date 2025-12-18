-- Run this in your Supabase SQL Editor

-- Tables (Create if not exists)
CREATE TABLE IF NOT EXISTS public.flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    status flight_status NOT NULL DEFAULT 'ON_TIME',
    delay_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    preferred_language TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES public.flights(id),
    passenger_id UUID REFERENCES public.passengers(id),
    seat_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id),
    channel notification_channel NOT NULL,
    status TEXT NOT NULL,
    payload JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);
