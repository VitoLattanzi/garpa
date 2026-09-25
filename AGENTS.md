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
- 'use client' explicit ONLY on interactive components that require state, hooks, or client APIs
- Local state only (useState) -- no Zustand/Redux; only global state is LangContext (ES/EN)
- Two separate Supabase clients: supabase-browser.ts (Client Components) and supabase-server.ts (Server Components)

## Known technical debt
- Slate color palette is hardcoded as hex values instead of extended in tailwind.config
- Some Supabase fetches use as any (types not generated via Supabase CLI yet)
- auth-errors.ts exists but is not wired into login/register yet
- No error handling in dashboard fetches if Supabase fails

## Do not use Firebase anywhere -- this project is 100% Supabase.

## Workflow de Gestión de Mejoras (mejoras.md)
Para mantener el orden, todo hallazgo, deuda o error debe registrarse en `mejoras.md`:
1. **Priorización:** El archivo debe estar organizado por prioridad:
    - 1. Errores/Bugs Críticos
    - 2. Seguridad
    - 3. Funcionalidades
    - 4. Deuda Técnica
    - 5. Mejoras Recomendadas
2. **Tareas:** Usar `[ ]` para pendientes y `[x]` para completadas.
3. **Errores (Sección 1):** Registrar errores encontrados con detalles técnicos. Una vez resueltos y verificados, **eliminar completamente** la línea del error para mantener la lista limpia y enfocada en problemas activos.
4. **Mantenimiento:** Mantener `mejoras.md` actualizado en cada interacción significativa.
