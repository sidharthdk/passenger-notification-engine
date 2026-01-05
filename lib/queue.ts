import { supabase } from './supabase';
import { sendNotification } from './notificationService';
import { v4 as uuidv4 } from 'uuid';

export type JobStatus = 'PENDING' | 'SENT' | 'FAILED' | 'BLOCKED' | 'RETRYING';

interface NotificationJob {
    id: string;
    flight_id: string;
    booking_id: string;
    channel: string;
    status: JobStatus;
    payload: any;
    idempotency_key: string;
    retry_count: number;
    error_message?: string;
}

/**
 * Enqueues a notification job instead of sending it immediately.
 * Enforces idempotency via the database constraint on `idempotency_key`.
 */
export async function enqueueNotificationJob(
    flightId: string,
    bookingId: string,
    channel: string,
    payload: any,
    idempotencyKey: string // Must be unique per logical alert
) {
    console.log(`[Queue] Enqueueing job for Booking ${bookingId} on ${channel}`);

    const { data, error } = await supabase
        .from('notification_jobs')
        .insert({
            flight_id: flightId,
            booking_id: bookingId,
            channel: channel,
            status: 'PENDING',
            payload: payload,
            idempotency_key: idempotencyKey,
            retry_count: 0
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            console.warn(`[Queue] Duplicate job blocked by idempotency: ${idempotencyKey}`);
            return { status: 'BLOCKED_DUPLICATE' };
        }
        console.error('[Queue] Failed to enqueue:', error);
        throw error;
    }

    return { status: 'ENQUEUED', jobId: data.id };
}

/**
 * MOCK Job Processor (In production, this would be a separate worker).
 * For this MVP/Monolith, we can call this via an API route (Cron) or after enqueueing (Direct/Async).
 * 
 * Rules:
 * - Fetch PENDING jobs
 * - Send
 * - Update status
 */
export async function processPendingJobs() {
    console.log('[Queue] Processing pending jobs...');

    // 1. Fetch pending
    const { data: jobs, error } = await supabase
        .from('notification_jobs')
        .select('*')
        .eq('status', 'PENDING')
        .limit(50); // Batch size

    if (error) {
        console.error('[Queue] Fetch error:', error);
        return;
    }

    if (!jobs || jobs.length === 0) {
        console.log('[Queue] No jobs to process.');
        return;
    }

    console.log(`[Queue] Found ${jobs.length} jobs.`);

    for (const job of jobs) {
        await processSingleJob(job);
    }
}

async function processSingleJob(job: NotificationJob) {
    try {
        console.log(`[Queue] Processing Job ${job.id}...`);

        // Send via unmodified notification logic (which logs to existing tables too)
        // Note: 'sendNotification' in 'notificationService' handles the actual Email/SMS logic
        // We assume 'sendNotification' is safe to call.
        // It requires: bookingId, passengerId, channel, payload.
        // Wait, 'notificationService' needs 'passengerId'. 
        // Our 'notification_jobs' has 'booking_id'. We should fetch passenger_id or store it.
        // Let's check schema/code. 'bookings' has 'passenger_id'.

        // Retrieve passenger_id
        const { data: booking } = await supabase
            .from('bookings')
            .select('passenger_id')
            .eq('id', job.booking_id)
            .single();

        if (!booking) {
            throw new Error('Booking not found for job');
        }

        await sendNotification(job.booking_id, booking.passenger_id, job.channel as any, job.payload);

        // Mark as SENT
        await supabase
            .from('notification_jobs')
            .update({ status: 'SENT', updated_at: new Date().toISOString() })
            .eq('id', job.id);

    } catch (err: any) {
        console.error(`[Queue] Job ${job.id} FAILED:`, err);

        const newRetryCount = (job.retry_count || 0) + 1;
        const newStatus = newRetryCount >= 3 ? 'FAILED' : 'RETRYING'; // Max 3 retries

        await supabase
            .from('notification_jobs')
            .update({
                status: newStatus,
                retry_count: newRetryCount,
                error_message: err.message,
                updated_at: new Date().toISOString()
            })
            .eq('id', job.id);
    }
}
