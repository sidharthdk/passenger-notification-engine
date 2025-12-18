-- Insert Flights
INSERT INTO public.flights (flight_number, departure_time, arrival_time, status, delay_minutes)
VALUES
  ('AI-404', NOW() + interval '2 hours', NOW() + interval '5 hours', 'ON_TIME', 0),
  ('BA-123', NOW() + interval '1 day', NOW() + interval '1 day 8 hours', 'ON_TIME', 0),
  ('JP-999', NOW() + interval '3 days', NOW() + interval '3 days 12 hours', 'ON_TIME', 0)
RETURNING id, flight_number;

-- Insert Passengers
INSERT INTO public.passengers (name, email, phone_number, preferred_language)
VALUES
  ('Riya Patel', 'riya@example.com', '+919876543210', 'en'),
  ('Carlos Garcia', 'carlos@example.com', '+34600123456', 'es'),
  ('Rahul Sharma', 'rahul@example.com', '+919988776655', 'en')
RETURNING id, name;

-- NOTE: To link them in 'bookings', you usually need the UUIDs generated above.
-- In a raw SQL script without variables, we can use a CTE (Common Table Expression) to insert and link them directly.

WITH new_flights AS (
  INSERT INTO public.flights (flight_number, departure_time, arrival_time, status)
  VALUES 
    ('UK-777', NOW() + interval '5 hours', NOW() + interval '12 hours', 'ON_TIME'),
    ('US-101', NOW() + interval '2 days', NOW() + interval '2 days 14 hours', 'ON_TIME')
  RETURNING id, flight_number
),
new_passengers AS (
  INSERT INTO public.passengers (name, email, preferred_language)
  VALUES 
    ('Sarah Connor', 'sarah@example.com', 'en'),
    ('John Doe', 'john@example.com', 'en')
  RETURNING id, name, email
)
INSERT INTO public.bookings (flight_id, passenger_id, seat_number)
SELECT 
  (SELECT id FROM new_flights WHERE flight_number = 'UK-777'),
  (SELECT id FROM new_passengers WHERE email = 'sarah@example.com'),
  '12A'
UNION ALL
SELECT 
  (SELECT id FROM new_flights WHERE flight_number = 'US-101'),
  (SELECT id FROM new_passengers WHERE email = 'john@example.com'),
  '14B';
