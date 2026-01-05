import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function main() {
    const { data: passengers, error } = await supabase
        .from('passengers')
        .select('email')
        .limit(1);

    if (error) {
        console.error('Error fetching passenger:', error.message);
    } else {
        if (passengers && passengers.length > 0) {
            console.log(`EMAIL=${passengers[0].email}`);
        } else {
            console.log('No passengers found.');
        }
    }
}

main();
