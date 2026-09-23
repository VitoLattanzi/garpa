'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Grupo, Amigo } from '@/types/garpa'

export default function GastosPage() {
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()
  
  const [gastos, setGastos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ nombre: string; email: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [amigos, setAmigos] = useState<Amigo[]>([])
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    async function loadData() {
      const demoActivo = document.cookie.includes('garpa-demo=true')
      setIsDemo(demoActivo)

      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user.id || 'demo-user'
      setUserId(uid)

      if (!demoActivo && session) {
          // Perfil
          const { data: perfil } = await supabase
            .from('usuarios').select('nombre, email').eq('id', uid).single()
          if (perfil) setUser(perfil)
          
          // Grupos
          const { data: miembrosData } = await supabase
            .from('miembros_grupo').select('grupo_id').eq('usuario_id', uid)
          if (miembrosData && miembrosData.length > 0) {
            const grupoIds = miembrosData.map((m: any) => m.grupo_id)
            const { data: gruposData } = await supabase
              .from('grupos').select('id, nombre').in('id', grupoIds)
            if (gruposData) setGrupos(gruposData)
          }

          // Amigos
          const { data: amistadesData } = await supabase
            .from('amistades')
            .select('id, usuario_id, amigo_id, estado, perfil:usuarios!amistades_amigo_id_fkey(nombre, email)')
            .eq('usuario_id', uid).eq('estado', 'activo')
          if (amistadesData) setAmigos(amistadesData as any)
      }

      const { data } = await supabase
        .from('gastos')
        .select('*, grupos(nombre)')
        .order('fecha', { ascending: false })
      if (data) setGastos(data)
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading) return <div className="p-6 text-text-muted">Cargando...</div>

  return (
    <DashboardLayout
      isDemo={isDemo}
      user={user}
      userId={userId}
      grupos={grupos}
      amigos={amigos}
    >
      <div className="p-6 max-w-4xl mx-auto text-text-primary">
        <h1 className="text-2xl font-semibold mb-8 text-positive">{lang === 'es' ? 'Historial de Gastos' : 'Expense History'}</h1>
        
        <div className="bg-background-card border border-background-border rounded-xl overflow-hidden">
          {gastos.map(g => (
            <div key={g.id} className="flex justify-between items-center px-6 py-4 border-b border-background-border last:border-0 hover:bg-background-border/50 transition">
              <div>
                <p className="text-sm font-medium">{g.descripcion}</p>
                <p className="text-xs text-text-muted">{g.grupos?.nombre || (lang === 'es' ? 'Amigos' : 'Friends')}</p>
              </div>
              <p className="text-sm font-medium text-positive">+${g.monto.toLocaleString('es-AR')}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
