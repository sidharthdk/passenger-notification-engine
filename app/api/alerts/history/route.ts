import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Fetch MCP Decisions (The "Brain")
        const { data: decisions, error: mcpError } = await supabase
            .from('mcp_decisions')
            .select(`
                *,
                flights ( flight_number )
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        if (mcpError) throw mcpError;

        // 2. Fetch Notification Jobs (The "Action")
        const { data: jobs, error: jobError } = await supabase
            .from('notification_jobs')
            .select(`
                *,
                flights ( flight_number )
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        if (jobError) throw jobError;

        // 3. Normalize for UI
        // We'll return them separately so the UI can have tabs or sections.
        // Or we can return a unified "Timeline" if we sort them by time.
        // For "Observability", separate tables are often clearer for "Decisions" vs "Jobs".

        const history = {
            decisions: decisions.map(d => ({
                id: d.id,
                type: 'DECISION',
                timestamp: d.created_at,
                flight: d.flights?.flight_number,
                data: {
                    decision: d.decision,
                    score: d.risk_score,
                    severity: d.severity,
                    reason: d.reason
                }
            })),
            jobs: jobs.map(j => ({
                id: j.id,
                type: 'JOB',
                timestamp: j.created_at,
                flight: j.flights?.flight_number,
                status: j.status,
                channel: j.channel,
                retry: j.retry_count,
                data: j.payload
            }))
        };

        return NextResponse.json(history);

    } catch (error: any) {
        console.error('History API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
