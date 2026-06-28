# InflConnect — Influencer Onboarding & Discovery Platform

A local influencer discovery platform built with Next.js 14, Tailwind CSS, and Firebase. Brands can find influencers by Indian city; influencers can self-onboard and get approved by an admin.

## Tech Stack

- **Next.js 14** (App Router, JavaScript)
- **Tailwind CSS** — premium light theme
- **Firebase v10** — Firestore, Storage, Auth
- **Firebase Admin SDK** — server-side reads for SEO (profile metadata, sitemap)
- **Lucide React** — icons

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Firebase project setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** → Email/Password sign-in.
3. Enable **Cloud Firestore** (production mode).
4. Enable **Firebase Storage**.
5. Copy your web app config from Project Settings → General → Your apps.

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

**Client SDK** (from Firebase Console → Project Settings):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Admin SDK** (from Firebase Console → Project Settings → Service Accounts → Generate new private key):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (paste the private key; newlines as `\n`)

**App config:**

- `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3000` or your production URL
- `NEXT_PUBLIC_ADMIN_EMAILS` — comma-separated admin emails

### 4. Deploy Firestore rules and indexes

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools
firebase login
firebase init  # select Firestore and Storage, use existing files

firebase deploy --only firestore:rules,firestore:indexes,storage
```

Or create indexes manually when Firebase shows the index-creation link in the browser console after your first query.

### 5. Create an admin user

1. In Firebase Console → Authentication → Add user (email/password).
2. Set a custom admin claim (one-time script using Admin SDK):

```js
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
admin.auth().getUserByEmail("admin@yourdomain.com").then((user) => {
  return admin.auth().setCustomUserClaims(user.uid, { admin: true });
});
```

3. Add the same email to `NEXT_PUBLIC_ADMIN_EMAILS` in `.env.local`.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — browse approved influencers, filter by city |
| `/onboard` | Self-onboarding form (status: pending) |
| `/admin` | Admin panel — approve/reject, manual add, manage all |
| `/influencer/[id]` | Public profile page (approved only, SEO-optimized) |

## Firestore Data Model

**Collection:** `influencers`

| Field | Type | Notes |
|-------|------|-------|
| fullName | string | |
| email | string | |
| instagram | string | |
| tiktokYoutube | string | optional |
| niche | string | Lifestyle, Tech, Fashion, Beauty, Fitness, Gaming |
| city | string | 12 Indian cities |
| followerCount | number | |
| profilePicUrl | string | Firebase Storage URL |
| bio | string | max 200 chars |
| status | string | `pending` or `approved` |
| createdAt | timestamp | server timestamp |

## SEO

- Per-page metadata via Next.js Metadata API
- Dynamic `generateMetadata` on profile pages (server-side via Admin SDK)
- JSON-LD `Person` schema on profile pages
- Dynamic `/sitemap.xml` with all approved profiles
- `/robots.txt` disallows `/admin`

## Production Build

```bash
npm run build
npm start
```

Deploy to Vercel, Netlify, or any Node.js host. Set all environment variables in your hosting dashboard.
