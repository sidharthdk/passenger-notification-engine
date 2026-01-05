import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function main() {
    console.log('--- Fixing Duplicates ---');
    const email = 'sidharthdkannan@gmail.com';

    // 1. Get all duplicates
    const { data: rows, error } = await supabase
        .from('passengers')
        .select('id')
        .eq('email', email);

    if (error || !rows) {
        console.error('Error fetching rows:', error);
        return;
    }

    console.log(`Found ${rows.length} rows.`);

    if (rows.length > 1) {
        // Keep the first one (latest), delete the rest
        const toKeep = rows[0];
        const toDelete = rows.slice(1).map(r => r.id);

        console.log(`Keeping ID: ${toKeep.id}`);
        console.log(`Deleting ${toDelete.length} duplicates...`);

        // 1. Reassign Bookings and Update Password of Survivor
        console.log(`Reassigning bookings to Survivor ${toKeep.id}...`);

        // Update survivor password just in case
        await supabase.from('passengers').update({ password: 'password123' }).eq('id', toKeep.id);

        const { error: updateErr } = await supabase
            .from('bookings')
            .update({ passenger_id: toKeep.id })
            .in('passenger_id', toDelete);

        if (updateErr) {
            console.error('Booking Reassign Error:', updateErr);
            return; // Stop if we can't move bookings
        }

        // 2. Delete Duplicates
        console.log(`Deleting ${toDelete.length} duplicates...`);

        const { error: delErr } = await supabase
            .from('passengers')
            .delete()
            .in('id', toDelete);

        if (delErr) {
            console.error('Delete Error:', delErr);
        } else {
            console.log('✅ Duplicates deleted.');
        }
    } else {
        console.log('No duplicates to fix.');
    }
}

main();
