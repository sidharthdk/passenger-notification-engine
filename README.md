# Passenger Notification Engine

A comprehensive Flight Notification System MVP built with **Next.js**, **Supabase**, and **Nodemailer**. This system allows airlines to manage flight statuses and automatically notifies passengers via email when flights are delayed or cancelled.

## Features

- **Admin Dashboard**: Interface for airline staff to view flight details and update statuses (e.g., Delay, Cancel).
- **Automated Notifications**: Triggers email notifications to passengers immediately upon status changes.
- **Passenger Status Page**: Public-facing page for passengers to check real-time flight status using their booking ID.
- **Multi-channel & Multi-language Support**: Designed with a scalable schema to support SMS/WhatsApp and multiple languages (currently MVP implements Email in English).

## Tech Stack

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: PostgreSQL (via [Supabase](https://supabase.com/))
- **Email Service**: Nodemailer (SMTP)
- **Styling**: CSS Modules / Global CSS

## Prerequisites

- **Node.js**: v18 or higher
- **Supabase Account**: For the PostgreSQL database.
- **SMTP Server**: A working SMTP server (e.g., Gmail, SendGrid, or Ethereal for testing) to send emails.

## Setup Instructions

1.  **Clone the Repository**

    ```bash
    git clone <repository-url>
    cd passenger-notification-engine
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Environment Configuration**

    Create a `.env` file in the root directory and configure the following variables:

    ```env
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

    # SMTP Configuration (for Nodemailer)
    SMTP_HOST=smtp.example.com
    SMTP_PORT=587
    SMTP_USER=your_email@example.com
    SMTP_PASS=your_email_password
    SMTP_FROM="Airline Notifications <no-reply@airline.com>"
    ```

4.  **Database Setup**

    Run the `schema.sql` script in your Supabase SQL Editor to create the necessary tables (`flights`, `passengers`, `bookings`, `notification_logs`).

5.  **Seed Data (Optional)**

    You can populate the database with test data using the provided script:

    ```bash
    npx ts-node scripts/seed-demo.ts
    ```

## Usage

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

- **Admin View**: Navigate to `/admin` (or the configured admin route) to manage flights.
- **Passenger View**: Navigate to `/status/[bookingId]` to see flight status.

### Running Scripts

The `scripts/` folder contains utility scripts for testing and verification:

- **Seed Data**: `npx ts-node scripts/seed-demo.ts`
- **Test Notifications**: `npx ts-node scripts/test-notification-flow.ts`
- **Verify Cancellation API**: `npx ts-node scripts/verify-cancellation-api.ts`

## Project Structure

- `app/`: Next.js App Router application source code.
    - `api/`: Backend API routes (e.g., for sending notifications).
    - `admin/`: Admin dashboard pages.
    - `status/`: Passenger status pages.
- `lib/`: Shared utilities (Supabase client, email templates, database helpers).
- `scripts/`: TypeScript scripts for seeding data, testing APIs, and verifying notification flows.
- `types/`: TypeScript type definitions.

## Future Scope

- **Real-time Updates**: Implement WebSockets or Server-Sent Events (SSE) for live flight status updates on the client side.
- **Live Flight Data**: Integrate with external aviation APIs to fetch real-world flight schedules and statuses.
- **Expanded Channels**: Fully enable SMS and WhatsApp notification channels (database schema already supports this).
- **Passenger Authentication**: Add user accounts for passengers to view booking history and manage preferences.
