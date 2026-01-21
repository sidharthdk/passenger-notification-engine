import { ClientCredentials } from '@okta/okta-sdk-nodejs';

const oktaClient = new ClientCredentials({
    clientId: process.env.OKTA_CLIENT_ID!,
    clientSecret: process.env.OKTA_CLIENT_SECRET!,
    scopes: ['okta.users.manage'],
    tokenUrl: 'https://trial-1983613.okta.com/oauth2/default/v1/token',
});

export async function provisionUser(user: {
    email: string;
    firstName: string;
    lastName: string;
}) {
    const mgmt = new oktaClient.Management({
        orgUrl: 'https://trial-1983613.okta.com',
        token: await oktaClient.getToken(),
    });

    // Simple random password generator for initial setup
    const generateTempPassword = () => {
        return Math.random().toString(36).slice(-8) + "Aa1!";
    };

    const newUser = await mgmt.createUser({
        profile: {
            login: user.email,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        credentials: {
            password: { value: generateTempPassword() },
        },
    });

    // Assign to My Web App
    await mgmt.assignUserToApplication({
        userId: newUser.id,
        appId: '0oazcf5h9pPKrfvOP697',
    });

    return newUser;
}

export async function suspendUser(userId: string) {
    const mgmt = new oktaClient.Management({
        orgUrl: 'https://trial-1983613.okta.com',
        token: await oktaClient.getToken(),
    });
    await mgmt.deactivateUser({ userId });
}
