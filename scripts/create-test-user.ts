import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Creating Test User...');

    const testUser = {
        name: 'Test Verify',
        email: 'testverify@example.com',
        phone_number: '+1000000000',
        preferred_language: 'en',
        password: 'password123'
    };

    // Check if exists
    const { data: existing } = await supabase
        .from('passengers')
        .select('id')
        .eq('email', testUser.email)
        .single();

    if (existing) {
        console.log('Test user already exists.');
        return;
    }

    const { error, data } = await supabase
        .from('passengers')
        .insert(testUser)
        .select()
        .single();

    if (error) {
        console.error('Failed to create user:', error.message);
    } else {
        console.log('✅ Created user:', data.email);
    }
}

main();
