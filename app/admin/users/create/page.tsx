import { provisionUser } from '@/lib/okta-provisioning';
import { redirect } from 'next/navigation';

export default function CreateUserPage() {
    async function create(formData: FormData) {
        'use server';

        const user = {
            email: formData.get('email') as string,
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
        };

        try {
            await provisionUser(user);
            // In a real app, you'd save to your DB here too.
        } catch (error) {
            console.error("Failed to provision user", error);
            throw error;
        }

        redirect('/admin');
    }

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create Staff User</h1>
            <form action={create} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input name="email" type="email" required className="w-full p-2 border rounded text-black" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input name="firstName" type="text" required className="w-full p-2 border rounded text-black" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input name="lastName" type="text" required className="w-full p-2 border rounded text-black" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Create User (Okta)
                </button>
            </form>
        </div>
    );
}
