import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Config Check ---');
console.log('URL defined:', !!url);
if (url) {
    console.log('URL starts with https:', url.startsWith('https'));
    try {
        console.log('URL host:', new URL(url).host);
    } catch {
        console.log('URL is invalid format:', url);
    }
}
console.log('Key defined:', !!key);
if (key) {
    console.log('Key length:', key.length);
}
