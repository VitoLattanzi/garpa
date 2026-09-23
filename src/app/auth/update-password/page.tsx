'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { lang, t } = useLang()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError(lang === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
    } else {
      alert(lang === 'es' ? 'Contraseña actualizada' : 'Password updated')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold text-main">
        {lang === 'es' ? 'Nueva contraseña' : 'New password'}
      </h1>
      <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={lang === 'es' ? 'Nueva contraseña' : 'New password'}
          required
          className="w-full bg-base border border-border rounded-lg px-4 py-2.5 text-sm text-main"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={lang === 'es' ? 'Confirmar contraseña' : 'Confirm password'}
          required
          className="w-full bg-base border border-border rounded-lg px-4 py-2.5 text-sm text-main"
        />
        {error && <p className="text-negative text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-positive text-background-base font-medium py-2.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (lang === 'es' ? 'Actualizando...' : 'Updating...') : (lang === 'es' ? 'Actualizar' : 'Update')}
        </button>
      </form>
    </div>
  )
}

