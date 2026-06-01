'use client'

import { useState, useEffect } from 'react'
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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Verificación al montar el componente
   * Si el usuario ya tiene sesión activa, lo mandamos al dashboard
   */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })
  }, [])

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
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Bienvenido a Garpa</h1>
        <p className="text-gray-500 text-sm">Ingresá para ver tus gastos compartidos</p>
      </div>

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

      <p className="text-center text-sm text-gray-500">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="text-gray-900 font-medium hover:underline">
          Registrate
        </Link>
      </p>

    </div>
  )
}