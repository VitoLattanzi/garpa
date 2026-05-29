import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente de Supabase para usar en Server Components y API Routes
 * Lee las cookies del servidor para mantener la sesión del usuario
 * Usar este cliente cuando estemos en componentes del lado del servidor
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Obtiene todas las cookies de la sesión actual
        getAll() {
          return cookieStore.getAll()
        },
        // Intenta escribir cookies — en Server Components esto no es posible
        // pero es necesario para que el tipo sea compatible
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Si falla (Server Component), lo ignoramos silenciosamente
          }
        },
      },
    }
  )
}