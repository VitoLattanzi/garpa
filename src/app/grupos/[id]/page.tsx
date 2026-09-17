'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'

export default function GroupConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const groupId = resolvedParams.id
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()

  const [loading, setLoading] = useState(true)
  const [grupo, setGrupo] = useState<{ id: string; nombre: string } | null>(null)
  const [miembros, setMiembros] = useState<any[]>([])
  const [amigos, setAmigos] = useState<any[]>([])
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    async function loadData() {
      // 1. Grupo
      const { data: g } = await supabase.from('grupos').select('*').eq('id', groupId).single()
      if (g) {
        setGrupo(g)
        setNombre(g.nombre)
      }

      // 2. Miembros
      const { data: m } = await supabase
        .from('miembros_grupo')
        .select('usuario_id, usuarios(nombre, email)')
        .eq('grupo_id', groupId)
      if (m) setMiembros(m)

      // 3. Amigos (para invitar)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: a } = await supabase
          .from('amistades')
          .select('amigo_id, perfil:usuarios!amistades_amigo_id_fkey(nombre, email)')
          .eq('usuario_id', session.user.id)
          .eq('estado', 'activo')
        if (a) setAmigos(a)
      }

      setLoading(false)
    }
    loadData()
  }, [groupId, supabase])

  async function updateName() {
    await supabase.from('grupos').update({ nombre }).eq('id', groupId)
    alert(lang === 'es' ? 'Nombre actualizado' : 'Name updated')
  }

  async function removeMember(userId: string) {
    if (userId === grupo?.id) return // simple check
    await supabase.from('miembros_grupo').delete().eq('grupo_id', groupId).eq('usuario_id', userId)
    setMiembros(miembros.filter(m => m.usuario_id !== userId))
  }

  async function addMember(userId: string) {
    await supabase.from('miembros_grupo').insert({ grupo_id: groupId, usuario_id: userId })
    // Refresh members
    const { data: m } = await supabase
        .from('miembros_grupo')
        .select('usuario_id, usuarios(nombre, email)')
        .eq('grupo_id', groupId)
    if (m) setMiembros(m)
  }

  if (loading) return <div className="p-6 text-[#4A6A7A]">Cargando...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto text-[#E8E0D5]">
      <h1 className="text-xl font-medium mb-6">{lang === 'es' ? 'Configuración del grupo' : 'Group settings'}</h1>
      
      <div className="mb-8">
        <label className="block text-xs text-[#4A6A7A] mb-1.5">{lang === 'es' ? 'Nombre del grupo' : 'Group name'}</label>
        <div className="flex gap-2">
          <input 
            value={nombre} 
            onChange={e => setNombre(e.target.value)}
            className="flex-1 bg-[#0F1923] border border-[#1E2D3D] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3D8B7A]"
          />
          <button onClick={updateName} className="bg-[#3D8B7A] text-[#0F1923] px-4 py-2 rounded-lg text-sm">{lang === 'es' ? 'Guardar' : 'Save'}</button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3">{lang === 'es' ? 'Miembros actuales' : 'Current members'}</h2>
        <div className="bg-[#172130] border border-[#1E2D3D] rounded-lg overflow-hidden">
          {miembros.map(m => (
            <div key={m.usuario_id} className="flex justify-between items-center px-4 py-3 border-b border-[#1E2D3D]">
              <span className="text-sm">{m.usuarios?.nombre || m.usuarios?.email}</span>
              <button onClick={() => removeMember(m.usuario_id)} className="text-xs text-[#C0675A]">{lang === 'es' ? 'Eliminar' : 'Remove'}</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">{lang === 'es' ? 'Invitar amigos' : 'Invite friends'}</h2>
        <div className="bg-[#172130] border border-[#1E2D3D] rounded-lg overflow-hidden">
          {amigos.map(a => {
            const isMember = miembros.some(m => m.usuario_id === a.amigo_id)
            return (
              <div key={a.amigo_id} className="flex justify-between items-center px-4 py-3 border-b border-[#1E2D3D]">
                <span className="text-sm">{a.perfil?.nombre || a.perfil?.email}</span>
                {!isMember && (
                    <button onClick={() => addMember(a.amigo_id)} className="text-xs text-[#3D8B7A]">{lang === 'es' ? 'Agregar' : 'Add'}</button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
