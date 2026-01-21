import { Client } from '@okta/okta-sdk-nodejs';

const client = new Client({
    orgUrl: 'https://trial-1983613.okta.com',
    authorizationMode: 'ClientCredentials',
    clientId: process.env.OKTA_CLIENT_ID!,
    clientSecret: process.env.OKTA_CLIENT_SECRET!,
    scopes: ['okta.users.manage'],
});

export async function provisionUser(user: {
    email: string;
    firstName: string;
    lastName: string;
}) {
    const createdUser = await client.createUser({
        profile: {
            login: user.email,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        credentials: {
            password: { value: 'TempPass123!' },  // TODO: randomize
        },
    });

    // SDK v7 method for assignment
    // Note: Function name might need verification, user provided createApplicationUserAssignment
    await client.createApplicationUserAssignment(
        '0oazcf5h9pPKrfvOP697',  // My Web App Client ID
        { id: createdUser.id }
    );

    return createdUser;
}

export async function suspendUser(oktaUserId: string) {
    await client.deactivateUser(oktaUserId);
}
