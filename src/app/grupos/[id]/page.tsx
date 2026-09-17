'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'

export default function GroupDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const groupId = resolvedParams.id
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'resumen' | 'config'>('resumen')
  const [grupo, setGrupo] = useState<{ id: string; nombre: string } | null>(null)
  const [gastos, setGastos] = useState<any[]>([])
  const [miembros, setMiembros] = useState<any[]>([])
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    async function loadData() {
      // 1. Grupo
      const { data: g } = await supabase.from('grupos').select('*').eq('id', groupId).single()
      if (g) {
        setGrupo(g)
        setNombre(g.nombre)
      }

      // 2. Gastos del grupo
      const { data: gts } = await supabase
        .from('gastos')
        .select('*, pagador:usuarios(nombre)')
        .eq('grupo_id', groupId)
        .order('fecha', { ascending: false })
      if (gts) setGastos(gts)

      // 3. Miembros
      const { data: m } = await supabase
        .from('miembros_grupo')
        .select('usuario_id, usuarios(nombre, email)')
        .eq('grupo_id', groupId)
      if (m) setMiembros(m)

      setLoading(false)
    }
    loadData()
  }, [groupId, supabase])

  if (loading) return <div className="p-6 text-[#4A6A7A]">Cargando...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto text-[#E8E0D5]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="text-sm text-[#4A6A7A] hover:text-[#3D8B7A] transition flex items-center gap-1">
          ← {lang === 'es' ? 'Volver' : 'Back'}
        </Link>
        <h1 className="text-xl font-medium">{grupo?.nombre}</h1>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#1E2D3D] mb-6">
        <button onClick={() => setActiveTab('resumen')} className={`pb-2 text-sm ${activeTab === 'resumen' ? 'text-[#3D8B7A] border-b-2 border-[#3D8B7A]' : 'text-[#4A6A7A]'}`}>
          {lang === 'es' ? 'Resumen' : 'Overview'}
        </button>
        <button onClick={() => setActiveTab('config')} className={`pb-2 text-sm ${activeTab === 'config' ? 'text-[#3D8B7A] border-b-2 border-[#3D8B7A]' : 'text-[#4A6A7A]'}`}>
          {lang === 'es' ? 'Configuración' : 'Settings'}
        </button>
      </div>

      {activeTab === 'resumen' ? (
        <div className="space-y-6">
          <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-6">
             <h2 className="text-xs text-[#4A6A7A] uppercase mb-2">{lang === 'es' ? 'Saldo del grupo' : 'Group balance'}</h2>
             <p className="text-3xl font-medium text-[#E8E0D5]">
               ${gastos.reduce((a, b) => a + b.monto, 0).toLocaleString('es-AR')}
             </p>
             <p className="text-xs text-[#4A6A7A] mt-1">{gastos.length} {lang === 'es' ? 'gastos totales' : 'total expenses'}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium mb-4">{lang === 'es' ? 'Gastos recientes' : 'Recent expenses'}</h2>
            <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl overflow-hidden">
              {gastos.map(g => (
                <div key={g.id} className="flex justify-between items-center px-4 py-3 border-b border-[#1E2D3D] last:border-0">
                  <div>
                    <p className="text-sm">{g.descripcion}</p>
                    <p className="text-[10px] text-[#4A6A7A]">{g.pagador?.nombre}</p>
                  </div>
                  <span className="text-sm font-medium text-[#3D8B7A]">${g.monto.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-6">
            <label className="block text-xs text-[#4A6A7A] mb-2">{lang === 'es' ? 'Nombre del grupo' : 'Group name'}</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-[#0F1923] border border-[#1E2D3D] rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <h2 className="text-sm mb-4 text-[#8A9BAA]">{lang === 'es' ? 'Miembros' : 'Members'}</h2>
            <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl">
              {miembros.map(m => (
                <div key={m.usuario_id} className="px-4 py-3 border-b border-[#1E2D3D] text-sm">{m.usuarios?.nombre}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
