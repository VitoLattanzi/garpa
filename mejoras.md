# Plan de Mejoras - Proyecto Garpa

Este archivo documenta los hallazgos de auditoría del código, clasificados por criticidad y prioridad, para guiar el desarrollo continuo del proyecto.

## 1. Errores/Bugs Críticos
- [x] **Migración del Sistema de Correos:** Implementar Nodemailer con Gmail SMTP.

## 2. Seguridad
- [x] **Gestión de Sesiones y Cookies:** Implementar 'Mantener sesión iniciada' y cierre de sesión automático por inactividad (15 min).

## 3. Funcionalidades
- [x] **Notificaciones In-App:** Implementar sistema de *toasts* para feedback de usuario tras acciones.
- [ ] **Custom Hook `useSplitCalculator`:** Extraer la lógica de cálculo de división de gastos fuera de los componentes UI para mejorar la mantenibilidad y testabilidad.

## 4. Deuda Técnica
- [x] **Falta `auth-errors.ts`:** Crear el archivo `src/lib/auth-errors.ts` para centralizar el manejo de errores de autenticación.
- [x] **Ausencia de Error Handling en Fetches:** Implementar `safeQuery` en todos los componentes.
- [x] **Granularidad de Errores en Interacciones:** Mejorar el reporte de errores en interacciones.
- [x] **Refactor de Estilos (Colores):** Configurar `tailwind.config.ts` y reemplazar colores hardcodeados.
- [x] **Generación Automática de Tipos:** Configurar `supabase-cli` y reemplazar tipos manuales en `src/types/garpa.ts`.
- [x] **Accesibilidad en Modal Agregar Amigo:** Corregir el contraste del texto en el modal.
- [ ] **Centralización de Configuración:** Refinar la exposición de las variables de entorno para los clientes de Supabase.
- [ ] **Error Boundaries:** Implementar `error.tsx` en los layouts de la app para capturar fallos de renderizado.

## 5. Mejoras Recomendadas
- [ ] **Hooks de Git (Husky):** Configurar `husky` y `lint-staged` para asegurar el cumplimiento de estándares antes de cada commit.
- [ ] **Optimización de Bundle:** Analizar el tamaño del bundle con `@next/bundle-analyzer` para asegurar tiempos de carga óptimos.
- [ ] **Accesibilidad:** Auditar los componentes principales con `axe-core` para mejorar la accesibilidad.
- [ ] **Infraestructura de Correos:** Reemplazar Nodemailer local por un servicio transaccional (ej. Resend, SendGrid) con dominio verificado (SPF/DKIM) para garantizar entregabilidad en Inbox.

## 6. SEO y Performance
- [ ] **Optimización SEO On-Page:**
  - Unificar el idioma de los metadatos (poner el `title` en español para que coincida con el H1).
  - Configurar en `layout.tsx` la URL canónica, etiquetas Open Graph (OG), Twitter Cards y el Apple Touch Icon.
  - Agregar un footer simple en la landing page con texto descriptivo y enlaces externos (ej. perfil de LinkedIn y repo de GitHub) para mejorar el ratio de enlazado y texto.
