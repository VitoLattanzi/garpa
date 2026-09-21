# Plan de Mejoras - Proyecto Garpa

Este archivo documenta los hallazgos de auditoría del código, clasificados por criticidad y tipo, para guiar el desarrollo continuo del proyecto.

## 1. Bugs Críticos
- [ ] **Falta `auth-errors.ts`:** Crear el archivo `src/lib/auth-errors.ts` para centralizar el manejo de errores de autenticación (actualmente inexistente, rompiendo la lógica de login/registro).
- [ ] **Ausencia de Error Handling en Fetches:** Implementar bloques `try/catch` en todos los componentes que realizan llamadas a Supabase (`dashboard`, `gastos`, `grupos`) para evitar estados de carga infinitos en caso de error.

## 2. Deuda Técnica
- [ ] **Refactor de Estilos (Colores):**
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
