# Backlink Prospector website

Sales website for Backlink Prospector. Visitors read about the tool, compare plans and place an order. Orders are saved in MongoDB Atlas and managed from a password-protected admin page.

Built with Next.js 14 (App Router) and MongoDB. Deploys to Vercel for free.

## Pages

| URL | What it is |
| --- | --- |
| `/` | Landing page: interactive demo, time calculator, how it works, plans, FAQ |
| `/order` | Order form: plan, currency (USD or Taka), customer details, payment method |
| `/order/success` | Confirmation with the order number and next steps |
| `/account` | My account for customers: sign in or create an account, follow each order, send Machine ID and payment ID, copy license keys, edit profile, change password |
| `/admin` | Orders dashboard: change status, store Machine ID and license key, email the key, reset a customer's password |

## 1. Create the free database (MongoDB Atlas)

1. Sign up at mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access:** add a database user with a password.
3. **Network Access:** add `0.0.0.0/0` (Vercel uses changing IP addresses).
4. **Connect > Drivers:** copy the connection string and put your user's password in it.

The `orders` collection and its indexes are created automatically on the first order.

## 2. Run it on your computer

```bash
npm install
cp .env.example .env.local      # then fill in the values
npm run dev
```

Open http://localhost:3000. The admin page is at http://localhost:3000/admin.

| Variable | Example | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/` | Atlas connection string |
| `MONGODB_DB` | `backlink_prospector` | Database name |
| `ADMIN_PASSWORD` | a long password | Sign-in for `/admin` |
| `AUTH_SECRET` | a long random string | Signs customer sessions for My account |

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com choose **Add New > Project** and import the repository. Vercel detects Next.js by itself.
3. Under **Environment Variables**, add `MONGODB_URI`, `MONGODB_DB`, `ADMIN_PASSWORD` and `AUTH_SECRET`.
4. Press **Deploy**. Add your own domain later under **Settings > Domains**.

## 4. Make it yours

| What | File |
| --- | --- |
| Prices, plan names, features | `lib/plans.js` |
| Your email, WhatsApp, website, booking link, portrait, payment numbers | `lib/site.js` |
| Landing page text | `app/page.js` |
| Demo rows in the hero | `components/HeroDemo.js` |
| Colours and fonts | `app/globals.css` (top of the file) |
| Creator section text | `components/Creator.js` |

All animations respect the visitor's "reduce motion" setting.

## Customer accounts

- Every order belongs to an account. On the order page a new customer chooses a password, and the account is created from their order details. A signed-in customer just orders.
- If the email already has an account, the order form asks for that account's password.
- In **My account** (`/account`, linked in the menu and footer) the customer sees each order's progress, adds their Machine ID and bKash/Nagad/bank transaction ID, and copies the license key once you save it in `/admin`. Private admin notes are never shown to customers.
- Orders placed before accounts existed are not added automatically. The customer creates an account with the same email, then adds the order with its order number.
- Forgotten password: in `/admin`, open the customer's order and press **Reset account password**. Send them the temporary password with the ready-written email.
- Changing a password, or an admin reset, signs the customer out on every other device.
- Customers are stored in the `customers` collection. Passwords are hashed with scrypt.

## Handling an order

1. A new order appears at `/admin` with status **New**.
2. Contact the customer, confirm payment, set status to **Paid**.
3. When they send their Machine ID (it appears on the order when they add it in My account), issue a key with `license-admin`, paste it into the order and press **Save changes**.
4. Press **Email the key** to open a ready-written email, then set status to **License sent**.

## Project structure

```
app/
  layout.js               Fonts, metadata
  page.js                 Landing page
  globals.css             All styles
  icon.svg                Favicon
  order/page.js           Order page
  order/success/page.js   Order confirmation
  admin/page.js           Orders dashboard
  account/page.js         My account (customer dashboard)
  api/orders/route.js                 POST: save a new order and create or link the account
  api/account/*                       Customer register, login, logout, profile, password, orders, claim
  api/admin/customers/reset/route.js  POST: temporary password for a customer
  api/admin/login/route.js            POST: admin sign-in (cookie)
  api/admin/logout/route.js           POST: sign out
  api/admin/orders/route.js           GET: list orders
  api/admin/orders/[id]/route.js      PATCH/DELETE: update or remove an order
components/
  SiteHeader.js       Glass header, mobile menu, reading progress bar
  SiteFooter.js       Footer with creator credit and contact links
  Effects.js          Reveal-on-scroll and header state (whole site)
  LinkGraph.js        Animated link-graph canvas behind the hero
  HeroDemo.js         Interactive pipeline demo window
  Pipeline.js         Six-step explorer with live funnel
  Anatomy.js          "Point at a field" prospect row explainer
  Deploy.js           Where-it-runs tabs
  Creator.js          About the maker (Manik Hossain)
  Faq.js              Animated accordion
  CountUp.js  useTween.js  CurrencySwitch.js   Small animation helpers
  RoiCalculator.js    Hours and cost calculator
  Pricing.js          Plans with animated USD/Taka switch
  OrderForm.js        Order form
  AdminApp.js         Admin sign-in and dashboard
  AccountApp.js       Customer sign-in and My account
  PasswordInput.js    Password field with show/hide
lib/
  plans.js        Plans and prices
  site.js         Seller details and payment methods
  mongodb.js      Cached MongoDB client
  admin-auth.js   Admin cookie check
  customer-auth.js  Customer passwords and sessions
```

## Notes

- No card or payment details are collected on the site. Payment is confirmed by you, which keeps the site simple and safe. An online gateway (Stripe, Paddle or SSLCommerz) can be added later.
- The order form has a hidden honeypot field to stop simple spam bots.
- Never commit `.env.local`. It is already in `.gitignore`.

Built by Manik Hossain. [github.com/procoder-manik](https://github.com/procoder-manik/)
