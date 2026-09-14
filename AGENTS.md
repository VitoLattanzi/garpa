@'
# AGENTS.md

## Stack
- Framework: Next.js 16.2.6 (App Router)
- UI: React 19.2.4
- Styling: Tailwind CSS 4
- Backend/DB/Auth: Supabase (@supabase/ssr + @supabase/supabase-js)
- Language: TypeScript 5
- Package manager: pnpm

## Development commands
- Dev server: pnpm dev
- Build: pnpm build
- Start (prod): pnpm start
- Lint: pnpm lint

## Product context
Shared expense tracker for friends (Splitwise-style), portfolio project with a working demo mode (no real account needed).

## Data model (Supabase)
Tables: usuarios, amistades, grupos, miembros_grupo, gastos, participantes_gasto, deudas, invitaciones. RLS enabled on all tables with simple policies (auth.uid() = usuario_id) to avoid infinite recursion. Nested joins caused 500 errors -- solved with sequential fetches assembled in JS. Trigger on_auth_user_created creates the user profile automatically.

## Conventions
- camelCase for variables/functions, PascalCase for components, kebab-case for page files
- 'use client' explicit on interactive components; typed props via type Props
- Local state only (useState) -- no Zustand/Redux; only global state is LangContext (ES/EN)
- Two separate Supabase clients: supabase-browser.ts (Client Components) and supabase-server.ts (Server Components)

## Known technical debt
- Slate color palette is hardcoded as hex values instead of extended in tailwind.config
- Some Supabase fetches use as any (types not generated via Supabase CLI yet)
- auth-errors.ts exists but is not wired into login/register yet
- Auth pages (login/register/layout) do not use LangContext yet -- text is hardcoded in Spanish
- No error handling in dashboard fetches if Supabase fails

## Do not use Firebase anywhere -- this project is 100% Supabase.
'@ | Out-File -FilePath G:\Garpa\garpa\AGENTS.md -Encoding utf8