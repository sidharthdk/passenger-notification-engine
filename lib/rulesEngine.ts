import { Flight, BookingWithPassenger } from '@/types';
import { supabase } from './supabase';
import { sendNotification } from './notificationService';
import { getTemplate, NEXT_STEPS } from './templates';

/**
 * Processes a flight update to determine if notifications should be sent.
 * @param oldFlight The flight data before the update
 * @param newFlight The flight data after the update
 */
export async function processFlightUpdate(oldFlight: Flight | null, newFlight: Flight) {
    const isDelayTrigger =
        (oldFlight?.delay_minutes || 0) < 30 && newFlight.delay_minutes >= 30;

    const isCancellationTrigger =
        oldFlight?.status !== 'CANCELLED' && newFlight.status === 'CANCELLED';

    if (!isDelayTrigger && !isCancellationTrigger) {
        return; // No notification needed
    }

    // Fetch bookings with passenger details
    // Note: We need to join with passengers. 
    // Supabase join syntax: bookings(..., passengers(...))
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
      id,
      flight_id,
      passenger_id,
      passengers (
        id,
        name,
        email,
        phone_number,
        preferred_language
      )
    `)
        .eq('flight_id', newFlight.id);

    if (error) {
        console.error('Error fetching bookings:', error);
        return;
    }

    if (!bookings || bookings.length === 0) return;

    const type = isCancellationTrigger ? 'CANCELLED' : 'DELAY';

    for (const booking of bookings) {
        // Cast to expected type including join
        const b = booking as any;
        const passenger = b.passengers;
        const lang = passenger.preferred_language || 'en';

        // Determine channels
        const channels = ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP'];
        // In reality, might depend on user preferences. 
        // Requirement says: "Channels: Email, SMS, WhatsApp, In-app". 
        // We send to ALL for MVP? "Each notification must ... be written to logs".
        // Or maybe specific logic? "mock with console.log". 
        // I'll send to all to demonstrate capability as requested.

        for (const channel of channels) {
            // Mock simple logic for channel selection (all)

            let message = getTemplate(lang, type, channel.toLowerCase());

            // Replace variables
            message = message
                .replace('{flightNumber}', newFlight.flight_number)
                .replace('{delayMinutes}', newFlight.delay_minutes.toString());

            if (type === 'CANCELLED') {
                const steps = (NEXT_STEPS as any)[lang] || NEXT_STEPS['en'];
                message = message.replace('{nextSteps}', steps);
            }

            await sendNotification(b.id, passenger.id, channel as any, {
                message,
                type,
                flight_id: newFlight.id
            });
        }
    }
}
