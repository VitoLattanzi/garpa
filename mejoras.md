# Plan de Mejoras - Proyecto Garpa

Este archivo documenta los hallazgos de auditoría del código, clasificados por criticidad y prioridad, para guiar el desarrollo continuo del proyecto hacia un estándar profesional de ingeniería.

## 1. Auditoría de Seguridad y Configuración Crítica (Prioridad ALTA)
- [ ] **Revisión de Variables de Entorno:** Garantizar que ninguna clave secreta (`service_role_key`, strings de conexión a DB) esté filtrada en el cliente o expuesta en componentes `use client`. Refinar la centralización en un archivo config.
- [ ] **Auditoría de Supabase RLS:** Verificar que todas las Row Level Security policies en Supabase estén blindadas (`auth.uid() = usuario_id`) y no permitan lectura/escritura de datos cruzados entre usuarios no relacionados.
- [ ] **Saneamiento de Inputs:** Asegurar que todos los formularios e inputs (especialmente los de búsqueda de usuarios y creación de gastos) estén protegidos contra inyecciones y datos malformados antes de llegar a la base de datos.

## 2. Refactorización y Calidad de Código (Deuda Técnica Crítica)
- [ ] **Eliminación del tipado `any`:** Configurar `supabase-cli` para generar los tipos exactos de la base de datos y reemplazar todos los tipos manuales y `any` en `src/types/garpa.ts` y en las peticiones (fetches).
- [ ] **Custom Hook `useSplitCalculator`:** Extraer la lógica matemática de cálculo de división de gastos y saldos fuera de los componentes UI. Debe ser una función pura y testeable.
- [ ] **Limpieza de Código Muerto y Consistencia:** Revisar importaciones sin uso, variables declaradas no utilizadas y forzar el uso consistente de `camelCase` para variables y `PascalCase` para componentes en todo el proyecto.
- [ ] **Refactor de Estilos:** Extraer los colores hexadecimales hardcodeados (ej. paleta Slate) y centralizarlos extendiendo el `tailwind.config.ts`.

## 3. Estabilidad y Manejo de Errores
- [ ] **Implementación de Error Boundaries:** Crear archivos `error.tsx` globales y específicos por ruta en el App Router para capturar fallos de renderizado sin que se caiga la aplicación entera (White Screen of Death).
- [ ] **Centralización de auth-errors.ts:** Conectar la lógica de manejo de errores de autenticación existente con las pantallas de login/registro.
- [ ] **SafeQueries en Dashboard y Fetches:** Auditar que todas las llamadas a Supabase en Cliente y Servidor estén envueltas en bloques try/catch o validen explícitamente el objeto `error` devuelto por Supabase antes de actualizar el estado.

## 4. UX y Funcionalidades Pendientes
- [ ] **Sistema de Notificaciones (Toasts):** Implementar feedback visual no bloqueante tras acciones del usuario (crear gasto, agregar amigo, rechazar invitación).
- [ ] **Estados de Carga Skeleton:** Reemplazar los textos de "Cargando..." por Skeletons UI mientras se resuelven las promesas de datos.

## 5. Mantenimiento y Tooling
- [ ] **Hooks de Git (Husky & lint-staged):** Prevenir commits que rompan la build implementando un chequeo automático de linteo y formateo antes de cada commit.