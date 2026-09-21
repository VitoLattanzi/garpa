'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import { getAuthErrorMessage } from '@/lib/auth-errors'

/**
 * Página de registro
 * Crea un nuevo usuario en Supabase Auth y su perfil en la tabla usuarios
 * Conectado con LangContext para soporte multiidioma
 */
export default function RegisterPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { t } = useLang()

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
  }, [router, supabase.auth])

  /**
   * Maneja el registro del usuario
   * Crea el usuario en Supabase Auth y activa el perfil via trigger
   */
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
      setError(getAuthErrorMessage(authError))
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  // Pantalla de éxito después del registro
  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4">
        <div className="text-4xl">📬</div>
        <h2 className="text-xl font-semibold text-gray-900">{t('register_success_title')}</h2>
        <p className="text-gray-500 text-sm">
          {t('register_success_desc')} <strong>{email}</strong>. {t('register_success_desc2')}
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-2 bg-gray-900 text-white rounded-lg py-2.5 px-6 text-sm font-medium hover:bg-gray-700 transition cursor-pointer"
        >
          {t('register_success_btn')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-semibold text-[#0F1923] mb-1">{t('register_title')}</h1>
        <p className="text-gray-500 text-sm">{t('register_subtitle')}</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">{t('register_name')}</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-500 outline-none focus:border-gray-400 transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">{t('login_email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-500 outline-none focus:border-gray-400 transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">{t('login_password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-500 outline-none focus:border-gray-400 transition"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{t(error as any)}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#3D8B7A] text-[#0F1923] rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? t('register_loading') : t('register_btn')}
        </button>

      </form>

      <p className="text-center text-sm text-gray-500">
        {t('register_has_account')}{' '}
        <Link href="/login" className="text-[#3D8B7A] font-medium hover:underline">
          {t('register_login')}
        </Link>
      </p>

    </div>
  )
}
