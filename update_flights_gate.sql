-- Add gate and terminal columns to flights table
ALTER TABLE public.flights 
ADD COLUMN IF NOT EXISTS gate TEXT,
ADD COLUMN IF NOT EXISTS terminal TEXT;
