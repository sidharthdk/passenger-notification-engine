
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verifyAuth() {
    console.log('--- Verifying Auth Configuration ---');

    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.AUTH_KEYCLOAK_SECRET;

    console.log(`Keycloak URL: ${keycloakUrl}`);
    console.log(`Realm: ${realm}`);
    console.log(`Client ID: ${clientId}`);
    console.log(`Client Secret: ${clientSecret ? '******' : '(missing)'}`);

    if (!keycloakUrl || !realm || !clientId || !clientSecret) {
        console.error('❌ Missing required Keycloak variables.');
        process.exit(1);
    }

    // Forbidden variables
    const forbidden = [
        'NEXT_PUBLIC_OIDC_AUTH_URL',
        'OIDC_TOKEN_URL'
    ];

    let hasError = false;
    for (const v of forbidden) {
        if (process.env[v]) {
            console.error(`❌ Forbidden variable found: ${v} = ${process.env[v]}`);
            hasError = true;
        } else {
            console.log(`✅ Forbidden variable ${v} is clean.`);
        }
    }

    // Construct URLs
    const authUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth`;
    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

    console.log('\n--- Constructed URLs ---');
    console.log(`Expected Auth URL:  ${authUrl}`);
    console.log(`Expected Token URL: ${tokenUrl}`);

    if (authUrl.includes('okta.com') || tokenUrl.includes('okta.com')) {
        console.error('❌ URLs contain "okta.com". Check your NEXT_PUBLIC_KEYCLOAK_URL!');
        hasError = true;
    } else {
        console.log('✅ URLs look correct (Keycloak pattern).');
    }

    if (hasError) {
        console.error('\n❌ Verification FAILED.');
        process.exit(1);
    } else {
        console.log('\n✅ Verification PASSED.');
    }
}

verifyAuth();
