# CreatorPulse 🚀

A modern membership-based community platform for creators, educators, coaches, artists, and online communities built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

---

## 🌟 Key Features

- **3 Dedicated Portals & Roles**:
  - **Member / Fan Dashboard** (`/member/dashboard`): Subscription tracking, saved posts, wallet balance, and purchase ledger.
  - **Creator Studio** (`/creator/dashboard`): Analytics, post management, reels, 24h stories, subscriber management, earnings breakdown, payout requests, and membership tier configuration.
  - **Admin Control Panel** (`/admin/dashboard`): Platform-wide metrics, user & creator management, verification applications, content moderation, reports, transactions, and platform fee configuration.
- **Rich Media & Content**:
  - Image, Video, Audio, Text, and Interactive Poll posts.
  - Vertical Shorts / Reels (`/shorts`).
  - 24-hour Stories.
  - Direct Messaging with paywalled attachment capabilities.
- **Monetization & Financials**:
  - Membership tier subscriptions.
  - Creator tips & support.
  - Paywalled post unlocking.
  - Payout withdrawal system with transparent platform fees.
- **Database & Security**:
  - Supabase PostgreSQL schema with 25 relational tables and Row Level Security (RLS).
  - Supabase Auth integration with cookie-based session management.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS glassmorphism
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Clone the repository & install dependencies

```bash
git clone https://github.com/riff1431/CreatorPulse.git
cd CreatorPulse
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform.

---

## 🔑 Demo User Portals

- **Landing Page**: `/`
- **Main Feed**: `/feed`
- **Member Dashboard**: `/member/dashboard`
- **Creator Studio**: `/creator/dashboard`
- **Admin Control Panel**: `/admin/dashboard`
