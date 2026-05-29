'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

/**
 * Página de login
 * Maneja la autenticación del usuario con email y contraseña
 * Redirige al dashboard si el login es exitoso
 */
export default function LoginPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  // Estado del formulario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Maneja el submit del formulario
   * Llama a Supabase Auth para verificar las credenciales
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Login exitoso — redirigimos al dashboard
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Bienvenido a Garpa</h1>
        <p className="text-gray-500 text-sm mb-6">Ingresá para ver tus gastos compartidos</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition"
            />
          </div>

          {/* Mensaje de error si las credenciales son incorrectas */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tenés cuenta?{' '}
          <Link href="/auth/register" className="text-gray-900 font-medium hover:underline">
            Registrate
          </Link>
        </p>

      </div>
    </main>
  )
}