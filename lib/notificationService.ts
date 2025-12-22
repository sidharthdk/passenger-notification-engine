import { supabase } from './supabase';
import { Booking, NotificationChannel, NotificationLog } from '@/types';
import nodemailer from 'nodemailer';

// Configure Transporter (Reuse server-side)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendNotification(
    bookingId: string,
    passengerId: string,
    channel: NotificationChannel,
    payload: any
) {
    console.log(`[SENDING] Channel: ${channel}, Recipient: ${passengerId}`);

    let status = 'SENT';
    let errorMsg = null;

    try {
        // 1. Fetch Passenger Email if needed
        // In a real localized app, pass the email in args or fetch it.
        // We'll fetch it just to suffice the "Real Email" requirement.
        const { data: passenger } = await supabase
            .from('passengers')
            .select('email')
            .eq('id', passengerId)
            .single();

        const email = passenger?.email;

        if (channel === 'EMAIL' && email) {
            if (!process.env.SMTP_USER) {
                console.warn('⚠️ SMTP_USER not set. Email not sent (Mock mode).');
            } else {
                const info = await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"SkyAlert" <no-reply@example.com>',
                    to: email,
                    subject: payload.type === 'CANCELLED' ? 'Flight Cancelled' : 'Flight Delay Update',
                    text: payload.message, // Fallback
                    html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: ${payload.type === 'CANCELLED' ? 'red' : 'orange'}">
                            ${payload.type === 'CANCELLED' ? 'Flight Cancelled' : 'Flight Delayed'}
                        </h2>
                        <p style="font-size: 16px;">${payload.message}</p>
                        <p style="color: #666; font-size: 12px; margin-top: 20px;">
                           Reference: Flight ${payload.flight_id}
                        </p>
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/status/${bookingId}" 
                           style="display: inline-block; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
                           View Status
                        </a>
                       </div>`
                });
                console.log('📧 Email sent:', info.messageId);
            }
        } else {
            // Mock other channels
            console.log(`[MOCK ${channel}] ${JSON.stringify(payload)}`);
        }

    } catch (err: any) {
        console.error('Notification Failed:', err);
        status = 'FAILED';
        errorMsg = err.message;
    }

    // Log to DB
    const { error } = await supabase.from('notification_logs').insert([
        {
            booking_id: bookingId,
            channel: channel,
            status: status,
            payload: { ...payload, error: errorMsg },
            sent_at: new Date().toISOString(),
        },
    ]);

    if (error) {
        console.error('Failed to log notification:', error);
    }
}
