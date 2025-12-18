import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const { data, error } = await supabase.from('bookings').select('id').limit(1).single();
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('BOOKING_ID:', data?.id);
    }
}

main();
