export const TEMPLATES = {
    en: {
        DELAY: {
            email: 'Flight {flightNumber} is delayed by {delayMinutes} minutes.',
            sms: 'Flight {flightNumber} delayed {delayMinutes} mins.',
            whatsapp: 'Flight {flightNumber} is delayed by {delayMinutes} minutes. Please check status.',
        },
        CANCELLED: {
            email: 'Flight {flightNumber} has been CANCELLED. Next steps: {nextSteps}',
            sms: 'Flight {flightNumber} CANCELLED. Check app for rebooking.',
            whatsapp: 'Flight {flightNumber} CANCELLED. We apologize. Options: {nextSteps}',
        },
    },
    es: {
        DELAY: {
            email: 'El vuelo {flightNumber} tiene un retraso de {delayMinutes} minutos.',
            sms: 'Vuelo {flightNumber} retrasado {delayMinutes} mins.',
            whatsapp: 'Vuelo {flightNumber} retrasado {delayMinutes} mins. Revise estado.',
        },
        CANCELLED: {
            email: 'El vuelo {flightNumber} ha sido CANCELADO. Siguientes pasos: {nextSteps}',
            sms: 'Vuelo {flightNumber} CANCELADO. Revise app.',
            whatsapp: 'Vuelo {flightNumber} CANCELADO. Disculpe. Opciones: {nextSteps}',
        },
    },
    // Add other languages as needed, default to 'en'
};

export const NEXT_STEPS = {
    en: 'Rebook via app or visit valid-url.com',
    es: 'Reserve de nuevo en la app',
};

export function getTemplate(lang: string, type: 'DELAY' | 'CANCELLED', channel: string) {
    const language = (TEMPLATES as any)[lang] || TEMPLATES['en'];
    return language[type][channel] || language[type]['email']; // fallback
}
