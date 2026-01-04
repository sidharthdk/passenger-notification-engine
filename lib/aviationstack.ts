import axios from 'axios';

export interface AviationStackFlight {
    flight_date: string;
    flight_status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted';
    departure: {
        airport: string;
        timezone: string;
        iata: string;
        icao: string;
        terminal: string | null;
        gate: string | null;
        delay: number | null;
        scheduled: string;
        estimated: string;
        actual: string | null;
        estimated_runway: string | null;
        actual_runway: string | null;
    };
    arrival: {
        airport: string;
        timezone: string;
        iata: string;
        icao: string;
        terminal: string | null;
        gate: string | null;
        baggage: string | null;
        delay: number | null;
        scheduled: string;
        estimated: string;
        actual: string | null;
        estimated_runway: string | null;
        actual_runway: string | null;
    };
    airline: {
        name: string;
        iata: string;
        icao: string;
    };
    flight: {
        number: string;
        iata: string;
        icao: string;
        codeshared: any;
    };
}

export interface AviationStackResponse {
    pagination: {
        limit: number;
        offset: number;
        count: number;
        total: number;
    };
    data: AviationStackFlight[];
}

export class AviationStackClient {
    private apiKey: string;
    private baseUrl: string = 'https://api.aviationstack.com/v1';

    constructor() {
        this.apiKey = process.env.AVIATIONSTACK_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ AVIATIONSTACK_API_KEY is missing. Flight data sync will fail.');
        }
    }

    /**
     * Fetch flight status by flight number (IATA).
     * @param flightIata e.g. "AA123"
     */
    async getFlightStatus(flightIata: string): Promise<AviationStackFlight | null> {
        if (!this.apiKey) return null;

        try {
            const response = await axios.get<AviationStackResponse>(`${this.baseUrl}/flights`, {
                params: {
                    access_key: this.apiKey,
                    flight_iata: flightIata,
                    limit: 1 // We only need the latest status usually
                }
            });

            if (response.data.data && response.data.data.length > 0) {
                return response.data.data[0];
            }
            return null;
        } catch (error) {
            console.error(`[AviationStack] Error fetching flight ${flightIata}:`, error);
            return null;
        }
    }

    /**
     * Checks if a user is in "Simulate" mode via query or context, 
     * but this client just fetches real data. 
     * Simulation logic largely lives in the MCP layer or API routes.
     */
}

export const aviationStack = new AviationStackClient();
