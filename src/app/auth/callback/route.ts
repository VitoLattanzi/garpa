import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirigir limpiando el código de la URL
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla, redirigimos a una página de error o al login
  return NextResponse.redirect(`${origin}/login`)
}
