# Project Context: Passenger Notification Engine

## Overview
The **Passenger Notification Engine** is a comprehensive Flight Notification System MVP. It allows airlines to manage flight statuses and automatically notifies passengers via email (and other potential channels) when flights are delayed or cancelled. It features a sophisticated **MCP (Model Context Protocol) Decision Engine** to filter alerts based on risk and severity, reducing notification fatigue.

## Tech Stack
- **Frontend/Framework**: Next.js 15+ (App Router), React 19.
- **Language**: TypeScript.
- **Database**: PostgreSQL (via Supabase).
- **Styling**: CSS Modules / Global CSS.
- **Email Service**: Nodemailer (SMTP).
- **Real-time Data**: Aviationstack API.
- **Auth**: Hybrid (Admin via Keycloak/Okta, Passenger via PNR/Booking ID).

## Core Architecture
### 1. File Structure
- `app/`: Next.js App Router routes.
    - `app/admin/`: Admin dashboard for flight management.
    - `app/status/[bookingId]`: Passenger view.
    - `app/monitor/`: Real-time flight monitoring dashboard.
    - `app/api/`: Backend API routes (e.g., `api/flights/update` triggers the engine).
- `lib/`: Shared logic.
    - `lib/mcp/`: **MCP Decision Engine**. Contains logic to evaluate flight context (delays, severe weather, crowd size) and return a structured decision (`APPROVE`, `FLAG`, `BLOCK`).
    - `lib/rulesEngine.ts`: **Central Logic**.
        - Detects changes (Delay > 30m, Cancellation, Gate Change).
        - Checks Cooldown (prevents duplicate alerts in 10 mins).
        - Calls MCP Engine for permission to send.
        - Enqueues notification jobs.
    - `lib/queue.ts`: Handles asynchronous job processing (simulated or actual).
    - `lib/auth/`: Authentication logic (Keycloak integration).

### 2. Database Schema (Supabase/PostgreSQL)
- **`flights`**: Stores flight details (status, delay, gate, terminal).
- **`passengers`**: Passenger profiles (name, email, language).
- **`bookings`**: Links passengers to flights (seat, fare, `passenger_status`).
- **`notification_logs`**: History of sent notifications.
- **`notification_jobs`**: Job queue for robust delivery (`PENDING`, `SENT`, `FAILED`).
- **`mcp_decisions`**: Audit log of every decision made by the MCP engine (`APPROVE`/`BLOCK`, risk score, reason).

### 3. Key Features
- **Smart Filtering (MCP)**: Notifies only when meaningful. Uses a risk score (0.0 - 1.0) based on delay duration, cancellation status, and gate changes.
    - Risk > 0.8: **BLOCK** (Requires manual override unless critical like Cancellation).
    - Risk > 0.5: **FLAG**.
    - Else: **APPROVE**.
- **Real-time Monitoring**: `/monitor` page visualizes active flights and delays.
- **Simulation Mode**: Allows testing flows without sending real emails (configurable via `isSimulation` flag).
- **Multi-Channel**: Architecture supports Email, SMS, WhatsApp, In-App.

## Recent Developments (For Context)
- **Real-time Integration**: Connected to Aviationstack for live flight updates.
- **MCP Validator**: Implemented "Smart Form Validator" using MCP to sanitize inputs.
- **Auth Bridge**: Working on bridging Keycloak (Admin) and custom PNR auth (Passenger).

## Environment Variables
Key variables include:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AVIATIONSTACK_API_KEY`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (for emails)
