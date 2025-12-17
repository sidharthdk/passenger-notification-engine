import { supabase } from './supabase';
import { Booking, NotificationChannel, NotificationLog } from '@/types';

export async function sendNotification(
    bookingId: string,
    passengerId: string, // passed to avoid extra fetch if possible
    channel: NotificationChannel,
    payload: any // e.g., { message: "..." }
) {
    console.log(`[MOCK SEND] Channel: ${channel}, Recipient: ${passengerId}, payload:`, payload);

    // In a real app, we would use an external provider here.
    const status = 'SENT';

    // Log to DB
    const { error } = await supabase.from('notification_logs').insert([
        {
            booking_id: bookingId,
            channel: channel,
            status: status,
            payload: payload,
            sent_at: new Date().toISOString(),
        },
    ]);

    if (error) {
        console.error('Failed to log notification:', error);
    }
}
