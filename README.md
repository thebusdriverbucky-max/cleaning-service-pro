# CleanFlow — Professional Cleaning Service Template

Production-ready cleaning service web application built with Next.js 14, 
Prisma ORM, PostgreSQL, Tailwind CSS, and Stripe.

## Features

- 🧹 **Service Booking** — Multi-step booking form with service type selection, 
  area size, date/time picker
- 💳 **Dual Payment Mode** — Stripe online payment OR cash on site
- 👤 **Customer Portal** — Order history, profile, saved addresses
- 🛠 **Admin Dashboard (CRM)** — Manage orders, customers, cleaners, statuses
- 📝 **CMS** — Edit services, pricing, site content from admin panel
- 🔑 **License Protection** — Requires valid license key from OwnYourWebsite.app
- 📧 **Email Notifications** — Order confirmation, status updates
- 🗺 **SEO Optimized** — sitemap, robots.txt, metadata
- 🌍 **i18n Ready** — Easily localizable

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Stripe Checkout
- **Styling**: Tailwind CSS
- **Email**: Resend
- **Deployment**: Vercel + Neon

## Getting Started

1. Clone the repo
2. Copy `.env.example` → `.env.local` and fill in your values
3. Add your `LICENSE_KEY` from [OwnYourWebsite.app](https://ownyourwebsite.app)
4. Run `npx prisma migrate dev`
5. Run `npm run dev`

## License

This template requires a valid license key. Purchase at [OwnYourWebsite.app](https://ownyourwebsite.app).
