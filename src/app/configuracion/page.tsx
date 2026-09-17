'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'

export default function ConfiguracionPage() {
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()
  const [user, setUser] = useState<any>(null)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single()
        if (data) {
          setUser(data)
          setNombre(data.nombre)
        }
      }
    }
    loadUser()
  }, [supabase])

  async function updateProfile() {
    setLoading(true)
    await supabase.from('usuarios').update({ nombre }).eq('id', user.id)
    alert(lang === 'es' ? 'Perfil actualizado' : 'Profile updated')
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto text-[#E8E0D5]">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="text-sm text-[#4A6A7A] hover:text-[#3D8B7A] transition flex items-center gap-1">
          ← {lang === 'es' ? 'Volver' : 'Back'}
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-8 text-[#3D8B7A]">{lang === 'es' ? 'Configuración' : 'Settings'}</h1>
      
      <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-6 mb-8">
        <h2 className="text-sm font-medium mb-4 text-[#8A9BAA]">{lang === 'es' ? 'Perfil' : 'Profile'}</h2>
        {user ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#4A6A7A] mb-1.5">{lang === 'es' ? 'Nombre' : 'Name'}</label>
              <div className="flex gap-2">
                <input 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)}
                  className="flex-1 bg-[#0F1923] border border-[#1E2D3D] rounded-lg px-3 py-2 text-sm text-[#E8E0D5] outline-none focus:border-[#3D8B7A]"
                />
                <button 
                  onClick={updateProfile} 
                  disabled={loading}
                  className="bg-[#3D8B7A] text-[#0F1923] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                >
                  {loading ? (lang === 'es' ? 'Guardando...' : 'Saving...') : (lang === 'es' ? 'Guardar' : 'Save')}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#4A6A7A]">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#4A6A7A]">{lang === 'es' ? 'Cargando perfil...' : 'Loading profile...'}</p>
        )}
      </div>

      <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-6">
        <h2 className="text-sm font-medium mb-4 text-[#8A9BAA]">{lang === 'es' ? 'Preferencias' : 'Preferences'}</h2>
        <div className="flex justify-between items-center">
            <span className="text-sm">{lang === 'es' ? 'Idioma' : 'Language'}</span>
            <span className="text-xs text-[#3D8B7A] bg-[#3D8B7A]/10 px-2 py-1 rounded">{lang.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}
