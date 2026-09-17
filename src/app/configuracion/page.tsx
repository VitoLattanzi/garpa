'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'

export default function ConfiguracionPage() {
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single()
        if (data) setUser(data)
      }
    }
    loadUser()
  }, [supabase])

  return (
    <div className="p-6 max-w-2xl mx-auto text-[#E8E0D5]">
      <h1 className="text-2xl font-semibold mb-8 text-[#3D8B7A]">{lang === 'es' ? 'Configuración' : 'Settings'}</h1>
      
      <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-6 mb-8">
        <h2 className="text-sm font-medium mb-4 text-[#8A9BAA]">{lang === 'es' ? 'Perfil' : 'Profile'}</h2>
        {user ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#4A6A7A]">{lang === 'es' ? 'Nombre' : 'Name'}</p>
              <p className="text-sm">{user.nombre}</p>
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
