-- 1. DELETE Notification Logs (Deepest dependency)
DELETE FROM public.notification_logs
WHERE booking_id IN (
    SELECT id FROM public.bookings
    WHERE flight_id IN (
        SELECT id FROM public.flights 
        WHERE flight_number LIKE 'CANCEL-FLIGHT%'
    )
);

-- 2. DELETE Bookings (Dependent on Flights)
DELETE FROM public.bookings
WHERE flight_id IN (
    SELECT id FROM public.flights 
    WHERE flight_number LIKE 'CANCEL-FLIGHT%'
);

-- 3. DELETE Flights (Root cause)
DELETE FROM public.flights 
WHERE flight_number LIKE 'CANCEL-FLIGHT%';

-- 4. Verify Clean State
SELECT * FROM public.flights;
