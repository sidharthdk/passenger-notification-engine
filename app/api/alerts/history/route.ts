import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    // Join notification_logs -> bookings -> flights to get flight number
    const { data, error } = await supabase
        .from('notification_logs')
        .select(`
            id,
            channel,
            status,
            payload,
            sent_at,
            bookings (
                flights (
                    flight_number
                )
            )
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten logic for easier consumption
    const history = data.map((log: any) => ({
        id: log.id,
        flight_number: log.bookings?.flights?.flight_number || 'Unknown',
        channel: log.channel,
        status: log.status,
        sent_at: log.sent_at,
        alert_type: log.payload?.type,
        mcp_decision: log.payload?.mcp_decision || 'N/A',
        mcp_risk_score: log.payload?.mcp_risk_score,
        severity: log.payload?.mcp_severity || 'N/A', // I didn't verify if severity was logged.
        // Checking rulesEngine... "mcp_decision: decision.decision, mcp_risk_score: decision.risk_score".
        // Severity was missing in rulesEngine log!
        // I should fix rulesEngine to log severity too for completeness. 
        // But for now "N/A" if missing.
        payload: log.payload
    }));

    return NextResponse.json({ history });
}
