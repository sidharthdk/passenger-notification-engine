const https = require('http');

// Load env vars manually since we are running with node directly
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed;

const clientId = envConfig.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
const clientSecret = envConfig.AUTH_KEYCLOAK_SECRET;
const issuer = envConfig.KEYCLOAK_ISSUER;

console.log('--- Auth Debugger ---');
console.log('Client ID:', clientId);
console.log('Issuer:', issuer);
console.log('Secret Length:', clientSecret ? clientSecret.length : 0);

if (!clientId || !clientSecret || !issuer) {
    console.error('❌ Missing environment variables!');
    process.exit(1);
}

const tokenEndpoint = `${issuer}/protocol/openid-connect/token`;
console.log('Token Endpoint:', tokenEndpoint);

// Test Basic Auth Construction
const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
console.log('Basic Auth Header constructed (partial):', `Basic ${credentials.substring(0, 10)}...`);

// Code to test: We can't do a full code exchange without a browser code, 
// BUT we can try 'client_credentials' flow if enabled, or just see if the server accepts our credentials.
// Even if flow is disabled, a 'unauthorized_client' vs 'unauthorized_grant_type' error is telling.

const params = new URLSearchParams();
params.append('grant_type', 'client_credentials'); // Try service account flow first

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
    }
};

console.log('\nAttempting Direct Token Request (Client Credentials Flow)...');

const req = https.request(tokenEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
    }
}, (res) => {
    console.log(`\nStatus Code: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Response Body:', data);

        try {
            const json = JSON.parse(data);
            if (res.statusCode === 200) {
                console.log('✅ SUCCESS: Credentials are valid! (Token received)');
            } else if (json.error === 'unauthorized_client') {
                console.error('❌ FAILED: Keycloak rejected the client credentials. Secret or Client ID is wrong.');
            } else if (json.error === 'unauthorized_grant_type') {
                console.log('⚠️ Partial Success: Client authenticated, but "Service Accounts Enabled" is off in Keycloak. Credentials ARE VALID.');
            } else {
                console.log('❓ Unknown Result:', json);
            }
        } catch (e) {
            console.error('Error parsing response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Network Error:', e.message);
    if (e.message.includes('ECONNREFUSED')) {
        console.error('   -> Is Keycloak running on port 8080?');
    }
});

req.write(params.toString());
req.end();
