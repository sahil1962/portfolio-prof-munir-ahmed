# Dr Munir Ahmed Tuition — Website

Marketing, booking-enquiry, and paid-checkout website for Professor Dr Munir Ahmed. Built with Next.js 16, Tailwind CSS v4, shadcn/ui, React Hook Form, Resend, Stripe, Google Calendar, and Zoom.

## Stack

| Layer           | Choice                                                        |
| --------------- | ------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)                            |
| Language        | TypeScript 5 (strict)                                         |
| Styling         | Tailwind CSS v4                                               |
| UI components   | shadcn/ui                                                     |
| Forms           | React Hook Form + Zod                                         |
| Email           | Resend + react-email                                          |
| Payments        | Stripe Checkout (hosted, dynamic pricing)                     |
| Scheduling      | Google Calendar API (availability + recurring-event blocking) |
| Video           | Zoom Server-to-Server OAuth (recurring meeting links)         |
| Spam protection | Cloudflare Turnstile                                          |
| Analytics       | Plausible (script tag)                                        |
| Deployment      | Vercel                                                        |

## Setup

**Prerequisites:** Node.js 24+ (see `.nvmrc`), pnpm.

```bash
git clone <repo>
cd munir-tuition
pnpm install
```

Copy the env example and fill in values:

```bash
cp .env.example .env.local
```

Start the dev server:

```bash
pnpm dev
```

## Environment variables

See `.env.example` for all required variables:

| Variable                           | Description                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                 | Resend API key for sending emails                                                         |
| `TUTOR_EMAIL`                    | Where enquiry notifications are sent                                                      |
| `FROM_EMAIL`                     | Verified Resend sender address                                                            |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public sitekey                                                       |
| `TURNSTILE_SECRET_KEY`           | Cloudflare Turnstile secret (server-side)                                                 |
| `NEXT_PUBLIC_SITE_URL`           | Canonical site URL (no trailing slash)                                                    |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`   | Plausible domain (leave empty to disable)                                                 |
| `STRIPE_SECRET_KEY`              | Stripe secret key, used to create Checkout Sessions and retrieve them on the success page |
| `STRIPE_WEBHOOK_SECRET`          | Stripe webhook signing secret — verifies `checkout.session.completed` events           |
| `GOOGLE_CALENDAR_ID`             | The calendar to check for availability and write recurring booking events to              |
| `GOOGLE_SERVICE_ACCOUNT_KEY`     | JSON key for a Google Cloud service account with Calendar API access (single-line string) |
| `ZOOM_ACCOUNT_ID`                | Zoom account ID for the Server-to-Server OAuth app                                        |
| `ZOOM_CLIENT_ID`                 | Zoom Server-to-Server OAuth app client ID                                                 |
| `ZOOM_CLIENT_SECRET`             | Zoom Server-to-Server OAuth app client secret                                             |

Without `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`, the enquiry/checkout forms still render locally but emails will not send and Turnstile will be bypassed. Without `STRIPE_SECRET_KEY`, checkout creation will fail. Without `GOOGLE_CALENDAR_ID`/`GOOGLE_SERVICE_ACCOUNT_KEY`, availability checks always report "available" and slot-blocking is skipped (logged as a warning). Without `ZOOM_ACCOUNT_ID`, a placeholder Zoom link is used instead of creating a real meeting — useful for local dev.

### One-time setup: Google Calendar

1. In Google Cloud Console, create a project (or reuse one) and enable the **Google Calendar API**.
2. Create a **Service Account**, then create a JSON key for it — this is `GOOGLE_SERVICE_ACCOUNT_KEY` (paste the whole JSON as a single-line string).
3. Open the calendar you want to use for bookings (a personal Gmail calendar works fine) and share it with the service account's `client_email`, granting **"Make changes to events"** access.
4. Set `GOOGLE_CALENDAR_ID` to that calendar's ID (your Gmail address for the primary calendar, or the ID shown in Calendar settings for a secondary calendar).

### One-time setup: Zoom

1. In the [Zoom App Marketplace](https://marketplace.zoom.us/), create a **Server-to-Server OAuth** app.
2. Grant it the `meeting:write` scope (and `meeting:write:admin` if creating meetings under a different host).
3. Copy the Account ID, Client ID, and Client Secret into `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`.

### One-time setup: Stripe webhook

For local testing, run the Stripe CLI alongside `pnpm dev`:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`. In production, add a webhook endpoint in the Stripe Dashboard pointing at `https://yourdomain.com/api/webhooks/stripe`, subscribed to `checkout.session.completed`, and use its signing secret.

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add all environment variables from `.env.example`.
4. Deploy — Vercel auto-detects Next.js.

```bash
vercel --prod
```

## Content

All site content lives in typed TypeScript files under `src/content/`. Edit these files to update pricing, testimonials, schedule, packages, and copy. No CMS or database required.

| File                               | Contains                    |
| ---------------------------------- | --------------------------- |
| `src/content/pricing.ts`         | All pricing tables          |
| `src/content/packages.ts`        | Lesson packages             |
| `src/content/testimonials.ts`    | Student testimonials        |
| `src/content/strengths.ts`       | Tutor strengths             |
| `src/content/schedule.ts`        | Weekend session schedule    |
| `src/content/groupConditions.ts` | Group tuition requirements  |
| `src/content/copy.ts`            | Hero text and booking notes |

## Routes

| Route                          | Description                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `/`                          | Home                                                                          |
| `/about`                     | About Dr Munir Ahmed                                                          |
| `/subjects/maths`            | Maths tuition                                                                 |
| `/subjects/science`          | Science tuition                                                               |
| `/subjects/a-level-physics`  | A-level Physics                                                               |
| `/subjects/research-methods` | Research Methods                                                              |
| `/packages`                  | All packages                                                                  |
| `/testimonials`              | All testimonials                                                              |
| `/schedule`                  | Weekend schedule                                                              |
| `/group-tuition`             | Group tuition info                                                            |
| `/book`                      | Booking enquiry form (free, no payment)                                       |
| `/thank-you`                 | Post-enquiry confirmation                                                     |
| `/checkout`                  | Paid checkout — single sessions or packages, with live availability checking |
| `/checkout/success`          | Post-payment confirmation (fulfillment happens via webhook, not here)         |
| `/contact`                   | Contact page                                                                  |
| `/privacy`                   | Privacy policy                                                                |
