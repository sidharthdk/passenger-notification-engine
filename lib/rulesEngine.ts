import { Flight, BookingWithPassenger } from '@/types';
import { supabase } from './supabase';
import { sendNotification } from './notificationService';
import { getTemplate, NEXT_STEPS } from './templates';
import { MCPDecisionEngine } from './mcp/engine';
import { MCPContext, MCPResponse } from './mcp/types';
import { enqueueNotificationJob } from './queue';
import { v4 as uuidv4 } from 'uuid';

/**
 * Processes a flight update to determine if notifications should be sent.
 * @param oldFlight The flight data before the update
 * @param newFlight The flight data after the update
 */
export async function processFlightUpdate(oldFlight: Flight | null, newFlight: Flight, isSimulation: boolean = false): Promise<MCPResponse | void> {
    const isDelayTrigger =
        (oldFlight?.delay_minutes || 0) < 30 && newFlight.delay_minutes >= 30;

    const isCancellationTrigger =
        oldFlight?.status !== 'CANCELLED' && newFlight.status === 'CANCELLED';

    // Check for gate/terminal changes (New Trigger)
    const isGateChange = oldFlight?.gate !== newFlight.gate && !!newFlight.gate;
    const isTerminalChange = oldFlight?.terminal !== newFlight.terminal && !!newFlight.terminal;

    console.log('[RulesEngine] Evaluation:', {
        oldStatus: oldFlight?.status,
        newStatus: newFlight.status,
        isCancellationTrigger,
        isDelayTrigger,
        isGateChange,
        isTerminalChange,
        isSimulation
    });

    if (!isDelayTrigger && !isCancellationTrigger && !isGateChange && !isTerminalChange) {
        console.log('[RulesEngine] No triggers met.');
        return; // No notification needed
    }

    // --- COOLDOWN CHECK (10 Minutes) ---
    // Check if any SENT job exists for this flight in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentJobs } = await supabase
        .from('notification_jobs')
        .select('id')
        .eq('flight_id', newFlight.id)
        .eq('status', 'SENT')
        .gt('updated_at', tenMinutesAgo)
        .limit(1);

    if (recentJobs && recentJobs.length > 0) {
        console.warn(`[RulesEngine] 🛑 Cooldown Active. Alert skipped for Flight ${newFlight.flight_number}.`);
        return;
    }

    // --- MCP DECISION ENGINE INTEGRATION ---
    // 1. Context Data Collection
    const { count: passengerCount } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('flight_id', newFlight.id);

    const mcpContext: MCPContext = {
        flight_id: newFlight.id,
        flight_status: newFlight.status,
        delay_minutes: newFlight.delay_minutes,
        passenger_count: passengerCount || 0,
        alerts_sent_last_10_min: 0, // Simplified for MVP
        gate_change: isGateChange,
        terminal_change: isTerminalChange,
        is_simulation: isSimulation
    };

    // 2. Get Decision
    const decision = await MCPDecisionEngine.evaluate(mcpContext);
    console.log('[RulesEngine] MCP Decision:', decision);

    // [NEW] Persist MCP Decision
    await supabase.from('mcp_decisions').insert({
        flight_id: newFlight.id,
        decision: decision.decision,
        severity: decision.severity,
        risk_score: decision.risk_score,
        reason: decision.reason,
        context: mcpContext
    });

    // 3. Enforcement
    if (decision.decision === 'BLOCK') {
        // Auto-Override for Cancellations (Business Critical)
        if (newFlight.status === 'CANCELLED') {
            console.log('⚠️ [Override] MCP Blocked (High Risk), but proceeding for PROVEN CANCELLED status.');
        } else {
            console.log('🛑 Action Blocked by MCP Security Layer.');
            return decision;
        }
    }

    if (isSimulation) {
        console.log('[RulesEngine] Simulation Mode: Notification skipped.');
        return decision;
    }

    // --- END MCP INTEGRATION ---

    // Fetch bookings with passenger details
    // Note: We need to join with passengers. 
    // Supabase join syntax: bookings(..., passengers(...))
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
      id,
      flight_id,
      passenger_id,
      seat_number,
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
        return decision;
    }

    if (!bookings || bookings.length === 0) return decision;

    const type = isCancellationTrigger ? 'CANCELLED' : 'DELAY';

    const requestId = uuidv4();

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

            // [NEW] Enqueue Job instead of immediate send
            // Idempotency Key: RequestID + BookingID + Channel (Unique for this batch run)
            const idempotencyKey = `job_${requestId}_${b.id}_${channel}`;

            await enqueueNotificationJob(
                newFlight.id,
                b.id,
                channel,
                {
                    message,
                    type,
                    flight_id: newFlight.id,
                    mcp_decision: decision.decision,
                    mcp_risk_score: decision.risk_score,
                    mcp_severity: decision.severity,
                    mcp_reason: decision.reason
                },
                idempotencyKey
            );
        }
    }


    return decision;
}
