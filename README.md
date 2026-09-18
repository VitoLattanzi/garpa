# Garpa — Shared Expense Tracker

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38bdf8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)

> Split expenses, simplify debts. No drama.

Garpa is a full-stack web app for managing shared expenses between friends and groups. Think Splitwise — but built from scratch as a portfolio project, with a clean dark UI, real-time balance tracking, and a fully functional demo mode.

**Live demo:** [garpa.vercel.app](https://garpa.vercel.app)

---

## Features

- **Responsive Design** — Desktop-first sidebar navigation seamlessly transitions to a native-like Bottom Navigation bar on mobile devices.
- **Centralized Modals** — Unified modal management system for streamlined interactions (New Expense, New Group, Add Friend).
- **Instant expense logging** — record who paid, how much, and who it applies to in seconds.
- **Three split modes** — equal parts, custom percentage, or fixed amount per person.
- **Automatic debt generation** — debts are created automatically when an expense is added.
- **Real-time balance dashboard** — see what you owe, what you're owed, and your net balance at a glance.
- **Groups & friends** — create groups for trips, shared housing, or outings; also supports direct splits between two people.
- **Friend invitations** — search by email; if the user isn't registered yet, Garpa sends them a custom invitation email via Resend.
- **Demo mode** — fully interactive demo session with no account required; data lives in `sessionStorage` and disappears on close.
- **Bilingual UI** — full Spanish / English support via custom `LangContext`.
- **Secure by default** — Row Level Security (RLS) on every table; each user only sees their own data.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full stack in one repo, automatic deploy on Vercel |
| Language | TypeScript 5.9 | Type safety across the entire codebase |
| Styling | Tailwind CSS 4.3 | Utility-first, clean and responsive design |
| Icons | Lucide React | Professional, consistent icon set |
| Database + Auth | Supabase (PostgreSQL) | Managed DB, Auth, and RLS in one free-tier service |
| Session handling | @supabase/ssr | Cookie-based sessions compatible with Next.js middleware |
| Package manager | pnpm | Faster installs, stricter dependency resolution |

---

## Architecture

```text
src/
├── app/
│ ├── (auth)/             # Login & Register share a split-screen layout
│ │ └── update-password/  # Secure password recovery route
│ ├── dashboard/          # Main app view
│ ├── amigos/             # Friends management
│ ├── gastos/             # Expense history
│ ├── configuracion/      # Settings page
│ └── layout.tsx          # Root layout
├── components/
│ ├── DashboardLayout.tsx # Centralized layout with Nav + Modals
│ ├── BottomNav.tsx       # Mobile-specific navigation
│ ├── Sidebar.tsx         # Desktop-specific navigation
│ └── modals/             # Reusable UI components
├── context/
│ └── LangContext.tsx     # Global ES/EN language context
├── lib/
│ ├── supabase-browser.ts # Client-side Supabase instance
│ └── supabase-server.ts  # Server-side Supabase instance (cookies)
└── types/
    └── garpa.ts          # Global app types (User, Group, Expense, Debt, etc.)
```

**Key architectural decisions:**

- **Unified Responsive Layout** — Replaced fragmented navigation with a `DashboardLayout` component that handles responsive rendering (Sidebar vs BottomNav) and centralizes modal state.
- **Sequential fetches over nested joins** — Supabase's RLS caused 500 errors with deeply nested joins; data is fetched in separate queries and assembled in JavaScript.
- **Cookie-based demo mode** — Middleware detects the `garpa-demo` cookie to allow access to dashboard features without authentication.

---

## Database Schema

- `usuarios`: user profiles (synced with Supabase Auth via trigger)
- `amistades`: friendships between users (pending / active / rejected)
- `grupos`: shared groups (trips, household, outings) + color attribute
- `miembros_grupo`: group membership with roles (admin / member)
- `gastos`: expense records
- `participantes_gasto`: participants per expense
- `deudas`: auto-generated debts
- `invitaciones`: pending email invitations

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/VitoLattanzi/garpa.git
cd garpa
pnpm install
```

### Environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
```

### Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Roadmap

- [ ] Debt simplification algorithm (A owes B, B owes C → A pays C directly)
- [ ] Push / email notifications when someone adds you to an expense
- [ ] Profile photo upload
- [ ] PWA support

---

## Author

**Vito Lattanzi** — Junior Full Stack Developer  
[portfolio-vito-lattanzi.vercel.app](https://portfolio-vito-lattanzi.vercel.app) · [LinkedIn](https://linkedin.com/in/vito-lattanzi) · [GitHub](https://github.com/VitoLattanzi)

---

*Built with Next.js + Supabase. Deployed on Vercel.*
