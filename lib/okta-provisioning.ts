import { Client } from '@okta/okta-sdk-nodejs';

// We need to handle the token exchange ourselves since the SDK expects SSWS or Private Key.
async function getAccessToken() {
    const tokenUrl = 'https://trial-1983613.okta.com/oauth2/default/v1/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'okta.users.manage'); // Adjust scope as needed

    const auth = Buffer.from(`${process.env.OKTA_CLIENT_ID}:${process.env.OKTA_CLIENT_SECRET}`).toString('base64');

    const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get access token: ${text}`);
    }

    const data = await res.json();
    return data.access_token;
}

export async function provisionUser(user: {
    email: string;
    firstName: string;
    lastName: string;
}) {
    const accessToken = await getAccessToken();

    const orgUrl = 'https://trial-1983613.okta.com';

    // 1. Create User
    const createUserRes = await fetch(`${orgUrl}/api/v1/users?activate=true`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile: {
                login: user.email,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            credentials: {
                password: { value: Math.random().toString(36).slice(-8) + "Aa1!" }
            }
        })
    });

    if (!createUserRes.ok) {
        const err = await createUserRes.text();
        throw new Error(`Okta User Create Failed: ${err}`);
    }

    const newUser = await createUserRes.json();

    // 2. Assign to App
    const appId = '0oazcf5h9pPKrfvOP697';
    const assignRes = await fetch(`${orgUrl}/api/v1/apps/${appId}/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: newUser.id,
            scope: "USER"
        })
    });

    // Assignment might fail if already assigned, logic to ignore 400?
    if (!assignRes.ok && assignRes.status !== 400) {
        console.error("Failed to assign user to app", await assignRes.text());
    }

    return newUser;
}

export async function suspendUser(userId: string) {
    const accessToken = await getAccessToken();
    const orgUrl = 'https://trial-1983613.okta.com';

    await fetch(`${orgUrl}/api/v1/users/${userId}/lifecycle/deactivate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
}
