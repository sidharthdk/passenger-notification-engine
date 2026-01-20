# Passenger Notification Engine

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Status](https://img.shields.io/badge/Status-MVP-orange)

A comprehensive **Flight Notification System MVP** built with **Next.js**, **Supabase**, and **Nodemailer**. This system allows airlines to manage flight statuses and automatically notifies passengers via email when flights are delayed, rescheduled, or cancelled.

It features a sophisticated **MCP (Model Context Protocol) Decision Engine** that intelligently filters alerts based on risk and severity to prevent notification fatigue.

## Features

- **✈️ Admin Dashboard**: Interface for airline staff to view flight details and update statuses (e.g., Delay, Cancel).
- **🔔 Smart Notifications**: The **MCP Decision Engine** evaluates every status change to determine if a notification is necessary, preventing spam for minor updates.
- **📧 Automated Emails**: Triggers email notifications to passengers immediately upon meaningful status changes.
- **📱 Passenger Status Page**: Public-facing page for passengers to check real-time flight status using their booking ID.
- **🌍 Scalable Architecture**: Designed with a schema to support SMS/WhatsApp and multiple languages (MVP implements Email in English).

## Core Architecture

### MCP Decision Engine
The heart of the system is the implementation of the Model Context Protocol (MCP) to make smart decisions about when to notify passengers.
- **Risk Scoring**: Calculates a risk score (0.0 - 1.0) based on delay duration, cancellation status, and gate changes.
- **Smart Filtering**:
    - **BLOCK** (Risk > 0.8): specific risky scenarios might require manual override.
    - **FLAG** (Risk > 0.5): Alerts that need attention.
    - **APPROVE**: Standard notifications sent automatically.

### Tech Stack
- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: PostgreSQL (via [Supabase](https://supabase.com/))
- **Email Service**: Nodemailer (SMTP)
- **Real-time Data**: Aviationstack API (integration ready)
- **Styling**: CSS Modules / Global CSS

## Prerequisites

- **Node.js**: v18 or higher
- **Supabase Account**: For the PostgreSQL database.
- **SMTP Server**: A working SMTP server (e.g., Gmail, SendGrid, or Ethereal for testing) to send emails.

## Setup Instructions

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/sidharthdk/passenger-notification-engine.git
    cd passenger-notification-engine
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Environment Configuration**

    Copy `.env.example` to `.env` in the root directory:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your credentials:

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

    # Aviation Stack API (Optional for real-time data)
    AVIATIONSTACK_API_KEY=your_aviationstack_key
    ```

4.  **Database Setup**

    Run the `schema.sql` script in your Supabase SQL Editor to create the necessary tables:
    - `flights`
    - `passengers`
    - `bookings`
    - `notification_logs`
    - `mcp_decisions`

5.  **Seed Data (Optional)**

    Populate the database with test data:

    ```bash
    npx ts-node scripts/seed-demo.ts
    ```

## Usage

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

- **Admin View**: Navigate to `/admin` to manage flights.
- **Passenger View**: Navigate to `/status/[bookingId]` to see flight status.

### Running Verification Scripts

The `scripts/` folder contains utility scripts for testing:

- **Seed Data**: `npx ts-node scripts/seed-demo.ts`
- **Test Notifications**: `npx ts-node scripts/test-notification-flow.ts`
- **Verify Cancellation API**: `npx ts-node scripts/verify-cancellation-api.ts`

## Project Structure

```
passenger-notification-engine/
├── app/                  # Next.js App Router source
│   ├── api/              # Backend API routes
│   ├── admin/            # Admin dashboard
│   ├── status/           # Passenger status pages
│   └── monitor/          # Real-time monitoring
├── lib/                  # Shared utilities
│   ├── mcp/              # MCP Decision Engine Logic
│   └── auth/             # Authentication helpers
├── scripts/              # TypeScript utility scripts
├── types/                # Type definitions
└── public/               # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
