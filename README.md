<p align="center">
  <img src="docs/banner.svg" alt="Backlink Prospector: competitor backlinks in, ready-to-pitch prospects out" width="100%" />
</p>

<p align="center">
  <img alt="Next.js 14" src="https://img.shields.io/badge/Next.js-14_App_Router-0F1535?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="React 18" src="https://img.shields.io/badge/React-18-2E4BF0?style=flat-square&logo=react&logoColor=white" />
  <img alt="MongoDB Atlas" src="https://img.shields.io/badge/MongoDB-Atlas-1D7A4A?style=flat-square&logo=mongodb&logoColor=white" />
  <img alt="Deploys to Vercel" src="https://img.shields.io/badge/Deploy-Vercel-0F1535?style=flat-square&logo=vercel&logoColor=white" />
  <img alt="Node 18.17 or later" src="https://img.shields.io/badge/Node-%E2%89%A518.17-7B3FE4?style=flat-square&logo=nodedotjs&logoColor=white" />
</p>

<p align="center">
  <a href="#overview">Overview</a> &nbsp;•&nbsp;
  <a href="#architecture">Architecture</a> &nbsp;•&nbsp;
  <a href="#project-structure">Structure</a> &nbsp;•&nbsp;
  <a href="#getting-started">Setup</a> &nbsp;•&nbsp;
  <a href="#user-guide">User guide</a> &nbsp;•&nbsp;
  <a href="#troubleshooting">Troubleshooting</a>
</p>

---

## Overview

**Backlink Prospector** is a desktop and self-hosted tool for SEO teams. It takes an Ahrefs or Semrush backlink export of a competitor and returns a ready-to-pitch outreach list: every relevant site, the best page to pitch, why it fits, the author and a verified email.

This repository is the **sales website and customer portal** for that tool. It does four jobs:

| Job | Where | Who uses it |
| --- | --- | --- |
| Explain the product and sell it | `/` | Visitors |
| Take orders in US dollars or Taka | `/order` | Visitors and customers |
| Let customers follow orders and copy license keys | `/account` | Customers |
| Let the seller manage orders and issue keys | `/admin` | The seller |

No card details are ever collected on the site. Payment (bKash, Nagad, bank transfer, PayPal or Payoneer) is confirmed by the seller, who then issues a license key that the customer copies from **My account**.

### Highlights

- **Interactive landing page.** A live demo window that runs a sample export, an animated link-graph hero, a six-step pipeline explorer with a funnel chart, a "point at a field" prospect explainer, an ROI calculator and animated pricing with a USD and Taka switch.
- **Customer accounts.** An account is created during the first order. Customers see each order's progress, send their Machine ID and payment transaction ID, and copy their license key at any time.
- **Admin dashboard.** Filter orders by status, store Machine IDs and license keys, email keys with a ready-written message and reset customer passwords.
- **One exchange rate.** Taka prices are worked out from dollar prices with a single `USD_TO_BDT` rate, so the two never drift apart.
- **Accessible by default.** Keyboard focus styles, ARIA on interactive widgets, layouts that adapt from phones to wide screens, and every animation turns off for visitors who prefer reduced motion.

## Screenshots

| Landing page | Six-step pipeline explorer |
| --- | --- |
| <img src="docs/screenshot-home.png" alt="Landing page hero with the live demo window" /> | <img src="docs/screenshot-pipeline.png" alt="Pipeline section with steps and funnel chart" /> |
| **My account (customer)** | **Orders dashboard (admin)** |
| <img src="docs/screenshot-account.png" alt="Customer dashboard with order progress" /> | <img src="docs/screenshot-admin.png" alt="Admin dashboard with an open order" /> |

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 14 (App Router) | Pages and API routes in one project, free hosting on Vercel |
| UI | React 18, plain CSS with design tokens | No CSS framework to learn or update, one stylesheet |
| Database | MongoDB Atlas (free M0 tier) via the official `mongodb` 6 driver | Flexible order documents, free to start |
| Auth | Signed HTTP-only cookies, scrypt password hashes (Node `crypto`) | No third-party auth service or extra packages |
| Fonts | Bricolage Grotesque (display), Public Sans (body) | Loaded from Google Fonts |
| Hosting | Vercel | Detects Next.js automatically |

The project has only four runtime dependencies: `next`, `react`, `react-dom` and `mongodb`.

## Architecture

### System overview

```mermaid
flowchart LR
    subgraph Browser
        V[Visitor]
        C[Customer]
        A[Admin]
    end

    subgraph NextJS["Next.js app (Vercel)"]
        P1["/ landing page"]
        P2["/order"]
        P3["/account"]
        P4["/admin"]
        API1["/api/orders"]
        API2["/api/account/*"]
        API3["/api/admin/*"]
        L1["lib/customer-auth.js<br/>sessions and passwords"]
        L2["lib/admin-auth.js<br/>admin cookie"]
        L3["lib/mongodb.js<br/>cached client"]
        L4["lib/plans.js<br/>prices and USD_TO_BDT"]
    end

    DB[("MongoDB Atlas<br/>orders, customers")]

    V --> P1 --> P2
    C --> P2 & P3
    A --> P4
    P2 --> API1
    P3 --> API2
    P4 --> API3
    API1 --> L1 & L3 & L4
    API2 --> L1 & L3
    API3 --> L2 & L3
    L3 --> DB
```

- **Pages** are server components that render the static parts. Anything interactive (demo, pricing switch, forms, dashboards) is a client component in `components/`.
- **API routes** in `app/api/` are the only code that talks to the database. Every route validates its input on the server and runs with `dynamic = "force-dynamic"`.
- **`lib/mongodb.js`** keeps one MongoDB client per server instance, reuses it across requests and hot reloads, and creates indexes the first time a collection is used.

### Order lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Site as Website
    participant DB as MongoDB
    actor Admin

    Customer->>Site: Fill order form (plan, details, password)
    Site->>DB: Create or match account in customers
    Site->>DB: Insert order (status: new, linked by customerId)
    Site-->>Customer: Signed-in cookie, order number
    Customer->>Site: Pay, then add transaction ID in My account
    Admin->>Site: Confirm payment, status to paid
    Customer->>Site: Install app, add Machine ID in My account
    Admin->>Site: Paste license key, status to licensed
    Site->>DB: Save key on the order
    Customer->>Site: Open My account and copy the key
```

### Order status

```mermaid
stateDiagram-v2
    direction LR
    [*] --> new: order placed
    new --> contacted: seller replies
    contacted --> paid: payment confirmed
    new --> paid
    paid --> licensed: key issued
    new --> cancelled
    contacted --> cancelled
    paid --> cancelled
    licensed --> [*]
```

| Status | Admin label | Customer sees | Customer can still change |
| --- | --- | --- | --- |
| `new` | New | Order placed | Machine ID, transaction ID |
| `contacted` | Contacted | In progress | Machine ID, transaction ID |
| `paid` | Paid | Payment confirmed (Trial approved for the free trial) | Machine ID |
| `licensed` | License sent | License ready, with the key | Nothing (message the seller to move a key) |
| `cancelled` | Cancelled | Cancelled | Nothing |

### Authentication

| | Customers | Admin |
| --- | --- | --- |
| Sign in with | Email and password | One shared `ADMIN_PASSWORD` |
| Password storage | scrypt with a random 16-byte salt per customer | Not stored, compared to the environment variable |
| Cookie | `bp_customer`, HTTP-only, SameSite Lax, 30 days | `bp_admin`, HTTP-only, SameSite Lax, 7 days |
| Cookie contents | `customerId.expiry.version.signature` (HMAC-SHA256 with `AUTH_SECRET`) | HMAC of a fixed value with `ADMIN_PASSWORD` |
| Sign out everywhere | Password change or admin reset increases `sessionVersion`, which invalidates every old cookie | Change `ADMIN_PASSWORD` |
| Brute-force slowdown | 700 ms delay on every failed attempt | 800 ms delay on every failed attempt |

### Data model

Both collections and their indexes are created automatically. There is nothing to set up in Atlas beyond the cluster and a database user.

**`orders`**

| Field | Type | Notes |
| --- | --- | --- |
| `orderNumber` | string | `BP-YYMMDD-XXXX`, unique index |
| `customerId` | ObjectId | Owner account. Missing on orders placed before accounts existed |
| `status` | string | `new`, `contacted`, `paid`, `licensed`, `cancelled` |
| `plan`, `planName` | string | From `lib/plans.js` |
| `currency`, `price`, `amount` | string, string, number | Price shown and amount charged, in USD or BDT |
| `name`, `email`, `company`, `country`, `phone` | string | Customer details at the time of the order |
| `paymentMethod`, `transactionId` | string | `bkash`, `nagad`, `bank`, `paypal`, `later` or `none` |
| `machineId` | string | `XXXX-XXXX-XXXX-XXXX` from the app's Activate page |
| `licenseKey` | string | Shown to the customer unless the order is cancelled |
| `adminNotes` | string | Private, never sent to customers |
| `notes` | string | The customer's message |
| `createdAt`, `updatedAt`, `customerUpdatedAt` | Date | `customerUpdatedAt` marks the last change made from My account |

Indexes: `orderNumber` (unique), `createdAt`, `email`, `customerId + createdAt`.

**`customers`**

| Field | Type | Notes |
| --- | --- | --- |
| `email` | string | Lower case, unique index, cannot be changed by the customer |
| `name`, `phone`, `company`, `country` | string | Editable in My account |
| `passwordHash` | string | `scrypt$salt$hash` |
| `sessionVersion` | number | Increased on password change or reset |
| `claimFails` | number | Failed tries at adding an older order, capped at 10 |
| `createdAt`, `updatedAt`, `lastLoginAt` | Date | |

## Project structure

```text
backlink-prospector-website/
├── app/
│   ├── layout.js                  Fonts, metadata, page-wide effects
│   ├── page.js                    Landing page
│   ├── globals.css                All styles and design tokens
│   ├── icon.svg                   Favicon
│   ├── order/
│   │   ├── page.js                Order page
│   │   └── success/page.js        Order confirmation
│   ├── account/page.js            My account (customer portal)
│   ├── admin/page.js              Orders dashboard
│   └── api/
│       ├── orders/route.js                  POST  place an order, create or link the account
│       ├── account/
│       │   ├── register/route.js            POST  create an account
│       │   ├── login/route.js               POST  sign in
│       │   ├── logout/route.js              POST  sign out
│       │   ├── me/route.js                  GET   profile and orders, PATCH profile
│       │   ├── password/route.js            POST  change password
│       │   ├── claim/route.js               POST  add an older order by its number
│       │   └── orders/[id]/route.js         PATCH send Machine ID or transaction ID
│       └── admin/
│           ├── login/route.js               POST  admin sign in
│           ├── logout/route.js              POST  admin sign out
│           ├── orders/route.js              GET   list orders
│           ├── orders/[id]/route.js         PATCH update, DELETE remove
│           └── customers/reset/route.js     POST  temporary customer password
├── components/
│   ├── SiteHeader.js              Glass header, mobile menu, reading progress bar
│   ├── SiteFooter.js              Footer with creator credit
│   ├── Effects.js                 Reveal on scroll, header state
│   ├── LinkGraph.js               Animated link-graph canvas in the hero
│   ├── HeroDemo.js                Live demo window
│   ├── Pipeline.js                Six-step explorer with funnel chart
│   ├── Anatomy.js                 "Point at a field" prospect explainer
│   ├── RoiCalculator.js           Hours and cost calculator
│   ├── Deploy.js                  "Where it runs" tabs
│   ├── Pricing.js                 Plans with animated currency switch
│   ├── CurrencySwitch.js          USD and Taka toggle
│   ├── Creator.js                 "Built by Manik Hossain" section
│   ├── Faq.js                     Animated accordion
│   ├── OrderForm.js               Order form with the account step
│   ├── AccountApp.js              Customer sign in and dashboard
│   ├── AdminApp.js                Admin sign in and dashboard
│   ├── PasswordInput.js           Password field with show and hide
│   ├── CountUp.js                 Number count-up on scroll
│   └── useTween.js                Smooth number transitions
├── lib/
│   ├── mongodb.js                 Cached client, collections, indexes
│   ├── customer-auth.js           Customer passwords, sessions, safe output
│   ├── admin-auth.js              Admin cookie check
│   ├── plans.js                   Plans, prices, USD_TO_BDT
│   └── site.js                    Seller details and payment methods
├── docs/                          README banner and screenshots
├── .env.example                   Environment variable template
├── next.config.mjs
├── jsconfig.json                  The @/ import alias
└── package.json
```

## Getting started

### Prerequisites

- **Node.js 18.17 or later** (20.6 or later if you want to use the connection test below)
- A **MongoDB Atlas** account with a free M0 cluster
- A **Vercel** account for hosting (optional for local work)

### 1. Install

```bash
git clone <your-repository-url>
cd backlink-prospector-website
npm install
```

### 2. Set up MongoDB Atlas

1. Create a free **M0** cluster. A region close to your customers (Singapore for Bangladesh) keeps it fast.
2. **Database Access:** add a database user with a password. Letters and numbers only avoid encoding problems.
3. **Network Access:** add `0.0.0.0/0`. Vercel uses changing IP addresses.
4. **Connect > Drivers > Node.js:** copy the connection string and replace `<db_password>` with the real password.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority` | Atlas connection string |
| `MONGODB_DB` | No | `backlink_prospector` | Database name (this is the default) |
| `ADMIN_PASSWORD` | Yes | a long password | Sign in to `/admin` |
| `AUTH_SECRET` | Yes | 64 random hex characters | Signs customer sessions |
| `MONGODB_DNS_SERVERS` | No | `8.8.8.8,1.1.1.1` | Only if you see `querySrv ECONNREFUSED` locally |

Generate an `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> [!IMPORTANT]
> Never commit `.env.local`. It is already listed in `.gitignore`. Restart `npm run dev` after every change to it.

### 4. Check the database connection

```bash
node --env-file=.env.local -e "const {MongoClient}=require('mongodb');new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000}).connect().then(c=>c.db(process.env.MONGODB_DB).command({ping:1})).then(()=>{console.log('Connected to MongoDB');process.exit(0)}).catch(e=>{console.error('Failed:',e.message);process.exit(1)})"
```

### 5. Run it

```bash
npm run dev
```

Open the address shown in the terminal, usually **http://localhost:3000**. Keep the terminal open while you use the site.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Next.js lint |

### 6. Deploy to Vercel

1. Push the project to a GitHub repository.
2. On vercel.com choose **Add New > Project** and import the repository.
3. Under **Environment Variables**, add `MONGODB_URI`, `MONGODB_DB`, `ADMIN_PASSWORD` and `AUTH_SECRET`.
4. Press **Deploy**. Add your domain later under **Settings > Domains**.

> [!NOTE]
> Changing an environment variable on Vercel only takes effect after a **Redeploy**.

## User guide

### Visitors

1. Read about the tool on `/`. Try the demo window, the pipeline steps and the ROI calculator.
2. Compare plans in US dollars or Taka and choose one, or start the 7-day free trial.

### Customers

```mermaid
flowchart LR
    A[Choose a plan] --> B[Enter details<br/>and a password]
    B --> C[Account created<br/>and signed in]
    C --> D[Pay and add the<br/>transaction ID]
    D --> E[Install the app and<br/>add the Machine ID]
    E --> F[Copy the license key<br/>from My account]
```

- **Ordering.** New customers choose a password on the order form, and their account is created from the order details. Customers who are already signed in only pick a plan and a payment method. If the email already has an account, the form asks for its password.
- **My account** (`/account`, in the menu and footer):
  - **Orders and licenses:** progress for each order, the license key with a Copy button, and fields for the Machine ID and the bKash, Nagad or bank transaction ID.
  - **Profile:** name, phone, company, country, and a password change.
- **Older orders.** Orders placed before accounts existed are not added automatically. Create an account with the same email, then choose **Missing an order? Add it with its order number**.
- **Forgotten password.** Message the seller on WhatsApp or by email with the order number to get a temporary password.

### Admin (seller)

1. Sign in at `/admin` with `ADMIN_PASSWORD`.
2. New orders appear at the top with status **New**. Filter by status with the buttons above the table.
3. Click an order to open it. Contact the customer and set the status to **Contacted**.
4. Confirm the payment (the customer's transaction ID appears on the order) and set the status to **Paid**.
5. When the Machine ID arrives, issue a key with `license-admin`, paste it into **License key** and press **Save changes**.
6. Press **Email the key** for a ready-written email, then set the status to **License sent**. The key now also shows in the customer's My account.

| Task | How |
| --- | --- |
| Customer forgot the password | Open their order, press **Reset account password**, then **Email it to the customer** |
| See what the customer changed | The order shows **Customer update** with the time of their last change |
| Remove a spam or test order | Open the order and press **Delete** |

## Customization

| What to change | File |
| --- | --- |
| Plan names, dollar prices, features | `lib/plans.js` |
| Dollar to Taka rate (`USD_TO_BDT`, currently 123) | `lib/plans.js` |
| Email, WhatsApp, website, booking link, portrait | `lib/site.js` |
| bKash and Nagad numbers, payment instructions | `lib/site.js` (`PAYMENT_METHODS`) |
| Landing page text, FAQ, comparison table | `app/page.js` |
| Demo rows in the hero | `components/HeroDemo.js` |
| Example numbers in the pipeline funnel | `components/Pipeline.js` |
| Creator section | `components/Creator.js` |
| Colors, fonts, spacing | `app/globals.css` (tokens at the top) |

> [!TIP]
> Taka prices are calculated as `dollar price × USD_TO_BDT`, rounded to the nearest 10 Taka. Change the rate in one place and every Taka price on the site, the order page and new orders follows.

### Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `--night` | `#0F1535` | Hero, header, dark bands |
| `--link` | `#2E4BF0` | Actions and links (hyperlink blue) |
| `--visited` | `#7B3FE4` | Gradients and accents (visited purple) |
| `--mark` | `#FFE45C` | Highlights, "this one is a keeper" |
| `--good` | `#1D7A4A` | Verified, done, passed |
| `--paper` | `#F5F7FC` | Page background |

The palette comes from the web's own link colors: hyperlink blue, visited purple and a highlighter yellow.

## Security

- Passwords are hashed with scrypt and a unique salt. Plain passwords are never stored or logged.
- Session cookies are HTTP-only, signed with HMAC-SHA256 and checked with timing-safe comparison.
- A customer can only read and change their own orders. Every order query includes the signed-in `customerId`.
- Private admin notes are never sent to customers.
- Older orders can only be added with a matching email and order number, with at most 10 failed tries per account.
- Redirects after sign-in only go to paths on this site.
- The order form has a hidden honeypot field that quietly drops simple spam bots.
- No card or bank details are collected by the site.

## Troubleshooting

| Problem | Likely cause | Fix |
| --- | --- | --- |
| `localhost refused to connect` | The dev server is not running | Run `npm run dev` yourself and keep the terminal open. Use the port it prints. |
| "Could not create the account" | The database is not reachable | Check the terminal for the real error and run the connection test above |
| `MONGODB_URI is not set` | `.env.local` missing or misnamed | Put `.env.local` next to `package.json` and restart the server |
| `querySrv ECONNREFUSED` | Your DNS refuses the SRV lookup (common on Windows and some ISPs) | Add `MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1` to `.env.local`, or set Windows DNS to 8.8.8.8 |
| `bad auth : authentication failed` | Wrong user or password, or unencoded special characters | Reset the database user's password to letters and numbers |
| `Server selection timed out` | Your IP is not allowed in Atlas | Add `0.0.0.0/0` under **Network Access** |
| Works locally, not on Vercel | Missing environment variables or no redeploy | Add all variables on Vercel, then **Redeploy** |
| Admin page says "ADMIN_PASSWORD is not set" | Variable missing on the server | Add `ADMIN_PASSWORD` and restart or redeploy |

## Roadmap ideas

- Self-service password reset by email (Resend or Brevo)
- Online payments (Stripe, Paddle or SSLCommerz)
- Automatic license key issue from the app's Machine ID
- Profile photos with image storage (Cloudinary)

## Credits

Designed, built and supported by **[Manik Hossain](https://manikhossain.in/)**, web designer, WordPress developer and SEO specialist.

| | |
| --- | --- |
| Website | [manikhossain.in](https://manikhossain.in/) |
| Email | [admin@manikhossain.in](mailto:admin@manikhossain.in) |
| WhatsApp | [+880 16500-43801](https://wa.me/8801650043801) |
| Book a call | [30-minute session](https://calendly.com/developermanikhossain/30min) |
| GitHub | [procoder-manik](https://github.com/procoder-manik/) |

Ahrefs, Semrush, Hunter.io, OpenAI and Anthropic are trademarks of their owners.

## License

© 2026 Manik Hossain. All rights reserved. This code is proprietary and may not be copied, modified or distributed without written permission.