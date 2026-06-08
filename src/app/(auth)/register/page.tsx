'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

/**
 * Página de registro
 * Crea un nuevo usuario en Supabase Auth y su perfil en la tabla usuarios
 * Redirige al login para que confirme el email
 */
export default function RegisterPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
   * Maneja el registro del usuario
   * 1. Crea el usuario en Supabase Auth
   * 2. Inserta el perfil en la tabla usuarios
   */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // El perfil se crea automáticamente via trigger en Supabase
    setSuccess(true)
    setLoading(false)
  }

    setSuccess(true)
    setLoading(false)
  }

  // Pantalla de éxito después del registro
  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4">
        <div className="text-4xl">📬</div>
        <h2 className="text-xl font-semibold text-gray-900">Revisá tu email</h2>
        <p className="text-gray-500 text-sm">
          Te mandamos un link de confirmación a <strong>{email}</strong>.
          Confirmá tu cuenta para poder ingresar.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-2 bg-gray-900 text-white rounded-lg py-2.5 px-6 text-sm font-medium hover:bg-gray-700 transition"
        >
          Ir al login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Crear cuenta</h1>
        <p className="text-gray-500 text-sm">Empezá a dividir gastos sin drama</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition"
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
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
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

      </form>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-gray-900 font-medium hover:underline">
          Ingresá
        </Link>
      </p>

    </div>
  )
}