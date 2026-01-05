import { NextRequest, NextResponse } from 'next/server';
import { processPendingJobs } from '@/lib/queue';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(req: NextRequest) {
    try {
        // Optional: Protect Cron with a specific secret header if needed
        // const cronKey = req.headers.get('x-cron-key');
        // if (cronKey !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await processPendingJobs();
        return NextResponse.json({ status: 'ok', message: 'Jobs processed' });
    } catch (error: any) {
        console.error('Job Processing Failed:', error);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
