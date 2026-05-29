'use client'

import { useState } from 'react'
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

  // Estado del formulario
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  /**
   * Maneja el registro del usuario
   * 1. Crea el usuario en Supabase Auth
   * 2. Inserta el perfil en la tabla usuarios
   */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Paso 1: crear el usuario en Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }, // metadata extra que guarda Supabase
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Paso 2: insertar el perfil en nuestra tabla usuarios
    if (data.user) {
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          nombre,
          email,
        })

      if (profileError) {
        setError('Error al crear el perfil. Intentá de nuevo.')
        setLoading(false)
        return
      }
    }

    // Registro exitoso — le avisamos que confirme el email
    setSuccess(true)
    setLoading(false)
  }

  // Pantalla de éxito después del registro
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Revisá tu email</h2>
          <p className="text-gray-500 text-sm">
            Te mandamos un link de confirmación a <strong>{email}</strong>. 
            Confirmá tu cuenta para poder ingresar.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-6 bg-gray-900 text-white rounded-lg py-2.5 px-6 text-sm font-medium hover:bg-gray-700 transition"
          >
            Ir al login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">

        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Crear cuenta</h1>
        <p className="text-gray-500 text-sm mb-6">Empezá a dividir gastos sin drama</p>

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

          {/* Mensaje de error */}
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

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" className="text-gray-900 font-medium hover:underline">
            Ingresá
          </Link>
        </p>

      </div>
    </main>
  )
}