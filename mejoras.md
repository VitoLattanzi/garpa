# Plan de Mejoras - Proyecto Garpa

Este archivo documenta los hallazgos de auditoría del código, clasificados por criticidad y tipo, para guiar el desarrollo continuo del proyecto.

## 1. Bugs Críticos
- [x] **Falta `auth-errors.ts`:** Crear el archivo `src/lib/auth-errors.ts` para centralizar el manejo de errores de autenticación.
- [x] **Ausencia de Error Handling en Fetches:** Implementar `safeQuery` en todos los componentes que realizan llamadas a Supabase (`dashboard`, `grupos`, `gastos`).
- [x] **Granularidad de Errores en Interacciones:** Mejorar el reporte de errores en interacciones (amistades, grupos, invitaciones) para especificar la causa raíz (ej. "usuario no encontrado", "error de red", "sin permisos").

## 2. Deuda Técnica
- [x] **Refactor de Estilos (Colores):**
    - Configurar `tailwind.config.ts` para incluir los colores base del proyecto (`theme.extend.colors`).
    - Reemplazar uso masivo de colores hardcodeados (ej. `bg-[#172130]`) por clases de utilidad de Tailwind (ej. `bg-card`).
- [ ] **Generación Automática de Tipos:**
    - Configurar `supabase-cli`.
    - Generar tipos automáticamente desde el esquema de la DB y reemplazar los tipos manuales en `src/types/garpa.ts`.

## 3. Mejoras UX/DX (Developer Experience)
- [ ] **Centralización de Configuración:** Refinar la exposición de las variables de entorno para los clientes de Supabase.
- [ ] **Error Boundaries:** Implementar `error.tsx` en los layouts de la app para capturar fallos de renderizado y ofrecer una UI de recuperación al usuario.

## 4. Nuevas Funcionalidades
- [ ] **Notificaciones In-App:** Implementar sistema de *toasts* para feedback de usuario tras acciones (crear gasto, aceptar invitación, etc.).
- [ ] **Custom Hook `useSplitCalculator`:** Extraer la lógica de cálculo de división de gastos fuera de los componentes UI para mejorar la mantenibilidad y testabilidad.

## 5. Mejoras Recomendadas
- [ ] **Hooks de Git (Husky):** Configurar `husky` y `lint-staged` para asegurar el cumplimiento de estándares antes de cada commit.
- [ ] **Optimización de Bundle:** Analizar el tamaño del bundle con `@next/bundle-analyzer` para asegurar tiempos de carga óptimos.
- [ ] **Accesibilidad:** Auditar los componentes principales con `axe-core` para mejorar la accesibilidad (ARIA labels, contraste).

## 6. Errores encontrados
- [ ] **error en el agregar amigos, estamos teniendo un error a la hora de agregar a un usuario ya creado, sea desde el pnpm dev o desde prod en vercel, no entiendo bien el problema. por ejemplo aca en pnpm dev nos tira este error "Error fetching invitaciones: {}
src/app/amigos/page.tsx (197:17) @ fetchData


  195 |
  196 |       if (invitacionesError) {
> 197 |         console.error('Error fetching invitaciones:', invitacionesError)
      |                 ^
  198 |       } else if (rawInvitaciones) {
  199 |         setInvitacionesRecibidas(rawInvitaciones)
  200 |       }" 
  revisalo 