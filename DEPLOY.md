# 🚀 Deployment Guide — CleanFlow Pro

## Option A: Vercel + Neon (Recommended — Free Tier Available)

### Step 1: Database (Neon)
1. Go to [neon.tech](https://neon.tech) → Create project
2. Copy connection string (Pooled connection)
3. This is your `DATABASE_URL`

### Step 2: Deploy to Vercel
```bash
npm i -g vercel
vercel
```
Follow prompts. Select your GitHub repo or deploy from local.

### Step 3: Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Webhooks (after setup) |
| `LICENSE_KEY` | Your license key |
| `RESEND_API_KEY` | From resend.com (optional) |
| `ADMIN_EMAIL` | Your admin notification email |

### Step 4: Initialize Database
After first deploy, run in your local terminal:
```bash
# Make sure DATABASE_URL points to production Neon DB
npx prisma db push
npx prisma db seed
```

### Step 5: Stripe Webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed` + `checkout.session.expired`
4. Copy signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel → Redeploy

### Step 6: Create Admin User
```bash
# Run in your project directory with production DATABASE_URL
npx ts-node scripts/create-admin.ts admin@yourdomain.com yourpassword
```
Or update directly in database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@yourdomain.com';
```

### Step 7: Custom Domain
Vercel Dashboard → Your Project → Domains → Add domain
Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the new domain → Redeploy.

---

## Option B: VPS / Self-hosted

```bash
# On your server
git clone ... && cd cleaning-service-pro
npm install
cp .env.example .env
# Edit .env with your values
npx prisma db push && npx prisma db seed
npm run build
npm start
```

Use PM2 for process management:
```bash
npm i -g pm2
pm2 start npm --name "cleanflow" -- start
pm2 save && pm2 startup
```

Use Nginx as reverse proxy on port 80/443.
