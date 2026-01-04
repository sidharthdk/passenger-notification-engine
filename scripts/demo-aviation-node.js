require('dotenv').config();
const axios = require('axios');

async function checkFlights() {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;

    if (!apiKey || apiKey === 'PASTE_AVIATIONSTACK_KEY_HERE') {
        throw new Error('Missing AVIATIONSTACK_API_KEY. Please check your .env file and replace the placeholder.');
    }

    console.log('Using API Key:', apiKey.substring(0, 4) + '...');

    try {
        const response = await axios.get('https://api.aviationstack.com/v1/flights', {
            params: {
                access_key: apiKey,
                limit: 5
            }
        });

        console.log('API Request Successful!');
        const data = response.data;
        const count = data.pagination ? data.pagination.count : 'N/A';
        console.log(`Flights fetched: ${count}`);
        // console.log('Sample Data:', data.data ? data.data[0] : data);

    } catch (error) {
        if (error.response) {
            console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
            console.error('Details:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

checkFlights();
