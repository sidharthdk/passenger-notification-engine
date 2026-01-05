import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function main() {
    console.log('--- Debugging Login ---');
    const email = 'sidharthdkannan@gmail.com';

    // 1. Check Row Count
    const { data: rows, error: countErr } = await supabase
        .from('passengers')
        .select('id, email')
        .eq('email', email);

    if (countErr) {
        console.error('Count Error:', countErr);
    } else {
        console.log(`Found ${rows?.length} rows for ${email}`);
        rows?.forEach(r => console.log(` - ID: ${r.id}`));
    }

    // 2. Simulate Login Query (as used in route.ts)
    const { data: passenger, error: loginErr } = await supabase
        .from('passengers')
        .select('*')
        .eq('email', email)
        .single();

    if (loginErr) {
        console.error('Login Query Error:', loginErr);
    } else {
        console.log('Login Query Success:', passenger);
    }
}

main();
