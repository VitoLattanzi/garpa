import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy global de Next.js (antes llamado middleware)
 * Se ejecuta en CADA request antes de que llegue a la página
 * Funciona como un "portero" que verifica si el usuario está autenticado
 */
export default async function proxy(request: NextRequest) {
  // Creamos una respuesta base que deja pasar el request normalmente
  let supabaseResponse = NextResponse.next({ request })

  /**
   * Creamos un cliente de Supabase especial para el servidor
   * Maneja las cookies manualmente porque en el servidor no hay document.cookie
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lee todas las cookies del request entrante
        getAll() {
          return request.cookies.getAll()
        },
        // Escribe las cookies tanto en el request como en la respuesta
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  /**
   * Verificamos si hay un usuario autenticado
   * getUser() valida el token JWT contra Supabase
   */
  const { data: { user } } = await supabase.auth.getUser()

  /**
   * Protección de rutas:
   * Si no hay usuario y la ruta no es pública → redirigimos al login
   */
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

/**
 * Define en qué rutas corre el proxy
 * Excluye archivos estáticos para no hacer verificaciones innecesarias
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}