import { createBrowserClient } from '@supabase/ssr'
import { env } from './env'

/**
 * Cliente de Supabase para usar en Client Components (navegador)
 * Maneja las cookies automáticamente via document.cookie
 * Usar este cliente en componentes que tengan 'use client' arriba
 */
export function createSupabaseBrowserClient(cookieOptions?: any) {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions
    }
  )
}