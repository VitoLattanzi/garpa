# Configuración Externa para Notificaciones In-App

Para que el sistema de notificaciones funcione correctamente, se requieren las siguientes configuraciones fuera del código:

## 1. Supabase Realtime
Es necesario activar el "Realtime" para la tabla `invitaciones`.

1. Entra a tu [Dashboard de Supabase](https://app.supabase.com/).
2. Ve a **Database** -> **Realtime**.
3. Asegúrate de que el "Realtime" esté habilitado.
4. En la lista de tablas, asegúrate de que `invitaciones` esté marcada como **Realtime Enabled**.

## 2. Variables de Entorno (Vercel/Local)
*No se requieren nuevas variables de entorno*, el sistema utiliza el cliente de Supabase ya configurado (`supabase-browser.ts`).

## 3. Políticas RLS (Supabase SQL Editor)
Para que el Realtime funcione y el usuario pueda ver sus invitaciones, ejecuta esto en el SQL Editor si no tienes la política aún:

```sql
-- Política para permitir que el usuario vea sus invitaciones recibidas
CREATE POLICY "Usuarios pueden ver sus invitaciones recibidas" 
ON public.invitaciones FOR SELECT 
USING (auth.email() = email_invitado);
```

*Nota: Asegúrate de que el RLS esté habilitado en la tabla `invitaciones`.*
