'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Grupo, Amigo } from '@/types/garpa'

export default function ConfiguracionPage() {
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()
  
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [amigos, setAmigos] = useState<Amigo[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      const demoActivo = document.cookie.includes('garpa-demo=true')
      setIsDemo(demoActivo)

      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user.id || 'demo-user'
      setUserId(uid)

      if (!demoActivo && session) {
          const { data: perfil } = await supabase
            .from('usuarios').select('*').eq('id', uid).single()
          if (perfil) {
              setUser(perfil)
              setNombre(perfil.nombre)
          }
          
          const { data: miembrosData } = await supabase
            .from('miembros_grupo').select('grupo_id').eq('usuario_id', uid)
          if (miembrosData && miembrosData.length > 0) {
            const grupoIds = miembrosData.map((m: any) => m.grupo_id)
            const { data: gruposData } = await supabase
              .from('grupos').select('id, nombre, color').in('id', grupoIds)
            if (gruposData) setGrupos(gruposData as any)

          }

          const { data: amistadesData } = await supabase
            .from('amistades')
            .select('id, usuario_id, amigo_id, estado, perfil:usuarios!amistades_amigo_id_fkey(nombre, email)')
            .eq('usuario_id', uid).eq('estado', 'activo')
          if (amistadesData) setAmigos(amistadesData as any)
      }
    }
    loadData()
  }, [supabase])

  async function updateProfile() {
    if (!user) return
    setLoading(true)
    await supabase.from('usuarios').update({ nombre }).eq('id', user.id)
    alert(lang === 'es' ? 'Perfil actualizado' : 'Profile updated')
    setLoading(false)
  }

  return (
    <DashboardLayout
      isDemo={isDemo}
      user={user}
      userId={userId}
      grupos={grupos}
      amigos={amigos}
    >
      <div className="p-6 max-w-2xl mx-auto text-main">
        <h1 className="text-2xl font-semibold mb-8 text-positive">{lang === 'es' ? 'Configuración' : 'Settings'}</h1>
        
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-sm font-medium mb-4 text-sec">{lang === 'es' ? 'Perfil' : 'Profile'}</h2>
          {user ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">{lang === 'es' ? 'Nombre' : 'Name'}</label>
                <div className="flex gap-2">
                  <input 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)}
                    className="flex-1 bg-base border border-border rounded-lg px-3 py-2 text-sm text-main outline-none focus:border-positive"
                  />
                  <button 
                    onClick={updateProfile} 
                    disabled={loading}
                    className="bg-positive text-background-base px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    {loading ? (lang === 'es' ? 'Guardando...' : 'Saving...') : (lang === 'es' ? 'Guardar' : 'Save')}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{lang === 'es' ? 'Cargando perfil...' : 'Loading profile...'}</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium mb-4 text-sec">{lang === 'es' ? 'Preferencias' : 'Preferences'}</h2>
          <div className="flex justify-between items-center">
              <span className="text-sm">{lang === 'es' ? 'Idioma' : 'Language'}</span>
              <span className="text-xs text-positive bg-positive/10 px-2 py-1 rounded">{lang.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

