'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import { getAuthErrorMessage } from '@/lib/auth-errors'

/**
 * Página de login
 * Maneja la autenticación del usuario con email y contraseña
 * Conectado con LangContext para soporte multiidioma
 */
export default function LoginPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { t, lang } = useLang()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  /**
   * Maneja el reseteo de contraseña
   */
  async function handleForgotPassword() {
    if (!email) {
      setError(lang === 'es' ? 'Ingresá tu email primero' : 'Enter your email first')
      return
    }
    setResetLoading(true)
    setError(null)
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/update-password`,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      alert(lang === 'es' ? 'Email de recuperación enviado' : 'Recovery email sent')
    }
    setResetLoading(false)
  }

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
   * Maneja el submit del formulario
   * Llama a Supabase Auth para verificar las credenciales
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(getAuthErrorMessage(authError))
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
        <h1 className="text-2xl font-semibold text-[#0F1923] mb-1">{t('login_title')}</h1>
        <p className="text-gray-500 text-sm">{t('login_subtitle')}</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">

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
          <label className="text-sm text-gray-800 font-medium">{t('login_password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-500 outline-none focus:border-gray-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800"
            >
              {showPassword ? '👁️' : '🔒'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-xs text-right text-gray-500 hover:text-[#3D8B7A] transition"
          >
            {resetLoading 
              ? (lang === 'es' ? 'Enviando...' : 'Sending...') 
              : (lang === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?')}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{t(error as any)}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#3D8B7A] text-[#0F1923] rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? t('login_loading') : t('login_btn')}
        </button>

      </form>

      <p className="text-center text-sm text-gray-500">
        {t('login_no_account')}{' '}
        <Link href="/register" className="text-[#3D8B7A] font-medium hover:underline">
          {t('login_register')}
        </Link>
      </p>

    </div>
  )
}
