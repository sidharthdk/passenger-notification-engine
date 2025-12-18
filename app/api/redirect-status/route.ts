import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (bookingId) {
        redirect(`/status/${bookingId}`);
    } else {
        redirect('/');
    }
}
