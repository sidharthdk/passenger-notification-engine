export type FlightStatus = 'ON_TIME' | 'DELAYED' | 'CANCELLED';

export type NotificationChannel = 'SMS' | 'EMAIL' | 'WHATSAPP' | 'IN_APP';

export interface Flight {
    id: string; // uuid
    flight_number: string;
    status: FlightStatus;
    delay_minutes: number;
    departure_time: string; // ISO string
    arrival_time: string; // ISO string
    created_at: string;
}

export interface Passenger {
    id: string; // uuid
    name: string;
    email: string | null;
    phone_number: string | null;
    preferred_language: string; // default 'en'
}

export interface Booking {
    id: string; // uuid
    flight_id: string;
    passenger_id: string;
    seat_number: string | null;
    created_at: string;
}

export interface NotificationLog {
    id: string; // uuid
    booking_id: string;
    channel: NotificationChannel;
    status: 'SENT' | 'FAILED';
    payload: any; // JSON
    sent_at: string;
}

// Join types for convenience if needed
export interface BookingWithPassenger extends Booking {
    passengers: Passenger; // Join
}
