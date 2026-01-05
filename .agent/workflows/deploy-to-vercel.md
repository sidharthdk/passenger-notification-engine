---
description: Deploy the Passenger Notification Engine to Vercel
---

# Deploying to Vercel

This application is built with **Next.js**, making it natively optimized for the Vercel platform.

## Prerequisites
1.  **GitHub Repository**: Ensure your code is pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Supabase Project**: Your database must be accessible from the internet (Vercel cannot access a localhost DB).

## Step-by-Step Guide

### 1. Import Project
1.  Log in to your Vercel Dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository (`passenger-notification-engine`).
4.  Vercel will auto-detect "Next.js".

### 2. Configure Environment Variables
Expand the **"Environment Variables"** section and add the following keys from your local `.env`:

| Key | Value (Source) |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Key (Backend Only) |
| `AVIATIONSTACK_API_KEY` | Your Aviationstack API Key |
| `NEXT_PUBLIC_AUTH_MODE` | `oidc` (if using Keycloak) or `local` |
| `ADMIN_PASSWORD` | Set a strong password (defaults to `admin123`) |

> [!IMPORTANT]
> **Database Connection**: In Vercel, use the **Connection Pooler (Transaction Mode)** configuration from Supabase (usually port `6543`) for better performance in serverless environments.
> `DATABASE_URL="postgres://postgres.xxxx:pass@aws-0-region.pooler.supabase.com:6543/postgres"`

### 3. Deploy
1.  Click **"Deploy"**.
2.  Wait for the build to complete (approx 1-2 mins).
3.  Your app will be live at `https://your-project.vercel.app`.

## Troubleshooting

### "User not found" or DB Errors
- Ensure you ran the SQL schema migration on your Supabase production database. 
- You may need to run the seeding SQL again in the Supabase SQL Editor.

### Admin Dashboard / Cron Jobs
- To automate the notification engine, set up a **Vercel Cron** or use an external cron service (like GitHub Actions or a simple script) to ping:
- `https://your-project.vercel.app/api/cron/process-jobs`
