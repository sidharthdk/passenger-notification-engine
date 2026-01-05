import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function main() {
    const { data, error } = await supabase
        .from('passengers')
        .select('email, password')
        .order('id', { ascending: false }) // Get latest
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data && data.length > 0) {
            console.log(`LATEST_PASSENGER_EMAIL=${data[0].email}`);
            console.log(`LATEST_PASSENGER_PASSWORD=${data[0].password}`);
        } else {
            console.log('No passengers found.');
        }
    }
}

main();
