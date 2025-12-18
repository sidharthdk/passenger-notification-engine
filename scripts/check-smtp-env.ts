import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const optionalVars = ['SMTP_FROM'];

console.log('Checking SMTP Environment Variables...');

let missing = false;

requiredVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ Missing required variable: ${key}`);
        missing = true;
    } else {
        // Mask password in logs
        const value = key === 'SMTP_PASS' ? '********' : process.env[key];
        console.log(`✅ ${key} is set: ${value}`);
    }
});

optionalVars.forEach((key) => {
    if (!process.env[key]) {
        console.warn(`⚠️ Optional variable missing: ${key} (Using defaults if available)`);
    } else {
        console.log(`✅ ${key} is set: ${process.env[key]}`);
    }
});

if (missing) {
    console.error('\n❌ SMTP setup is incomplete. Please update .env file.');
    process.exit(1);
} else {
    console.log('\n✅ SMTP setup looks properly configured!');
}
