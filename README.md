# 🫧 CleanFlow Pro

**Production-ready cleaning service platform** built with Next.js 14, Prisma, PostgreSQL, Stripe.

> Purchased from [OwnYourWebsite.app](https://www.ownyourwebsite.app) — you own this code forever.

## ✨ Features

- 📋 **Online booking** — 3-step form with price calculator
- 💳 **Dual payment** — Stripe online OR cash on arrival
- 🧹 **CRM** — Manage orders, assign cleaners, track status
- 📄 **CMS** — Edit services, prices, and site content from admin
- 🏷️ **Promo codes** — Discount system with usage limits
- 👤 **Customer accounts** — Order history, profile management
- 📧 **Email notifications** — Booking confirmations via Resend or SMTP
- 🔑 **License protection** — Prevents unauthorized use
- 🌙 **Dark/light ready** — Tailwind CSS theming

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/cleaning-service-pro.git
cd cleaning-service-pro
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — PostgreSQL connection string (Neon, Supabase, Railway, etc.)
- `NEXTAUTH_SECRET` — Random secret: `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` — From [stripe.com/dashboard](https://dashboard.stripe.com)
- `LICENSE_KEY` — Your license key from OwnYourWebsite.app
- `RESEND_API_KEY` — Optional: email notifications via [resend.com](https://resend.com)

### 3. Setup Database

```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all environment variables in Vercel Dashboard → Settings → Environment Variables.

After deployment, set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL.

### Stripe Webhook (production)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `checkout.session.expired`
4. Copy webhook secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

## 🔑 License Activation

Add your license key to `.env`:

```env
LICENSE_KEY=CLEAN-XXXXXXXX-XXXXXXXX-XXXXXXXX
```

Your key was emailed after purchase. Contact support@ownyourwebsite.app if you lost it.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js |
| Payments | Stripe Checkout |
| Email | Resend / Nodemailer |
| Styling | Tailwind CSS |
| Hosting | Vercel (recommended) |
| DB Hosting | Neon / Supabase / Railway |

## 📁 Project Structure
app/
├── (dashboard)/
│ ├── admin/ # CRM + CMS admin panel
│ └── account/ # Customer account area
├── api/
│ ├── booking/ # Booking creation API
│ ├── webhooks/ # Stripe webhook handler
│ └── account/ # Profile update API
├── booking/ # Public booking flow
├── services/ # Services listing
└── license-required/ # License gate page

lib/
├── prisma.ts # Prisma client
├── license.ts # License validation
├── email.ts # Email sending
├── settings.ts # CMS settings helper
├── services.ts # Service data helpers
└── admin.ts # Admin data queries

prisma/
├── schema.prisma # Database schema
└── seed.ts # Initial data

text

## 🎨 Customization

### Change branding
Edit `lib/settings.ts` defaults or update via **Admin → Settings**.

### Add a service type
Admin → Services → Add Service (or edit `prisma/seed.ts` and re-seed).

### Change currency
Admin → Settings → Currency Code / Symbol.

### Custom domain
Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your domain in Vercel environment variables.

## 📄 License

This source code is licensed for use by the original purchaser only.
One license = one production deployment.
Redistribution or resale is not permitted.

Purchased from [OwnYourWebsite.app](https://www.ownyourwebsite.app)
