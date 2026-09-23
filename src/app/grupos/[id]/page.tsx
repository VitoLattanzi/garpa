'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { safeQuery } from '@/lib/supabase-utils'
import { getDbErrorMessage } from '@/lib/db-errors'
import { useLang } from '@/context/LangContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Grupo, Amigo } from '@/types/garpa'

export default function GroupDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const groupId = resolvedParams.id
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'resumen' | 'config'>('resumen')
  const [grupo, setGrupo] = useState<{ id: string; nombre: string; creado_por: string } | null>(null)
  const [gastos, setGastos] = useState<any[]>([])
  const [miembros, setMiembros] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  // DashboardLayout dependencies
  const [user, setUser] = useState<any>(null)
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
        // Fetch user profile
        const { data: profile } = await safeQuery<any>(supabase.from('usuarios').select('*').eq('id', uid).single())
        setUser(profile)

        // Fetch groups
        const { data: miembrosData } = await safeQuery<any[]>(supabase.from('miembros_grupo').select('grupo_id').eq('usuario_id', uid))
        if (miembrosData) {
            const grupoIds = miembrosData.map(m => m.grupo_id)
            const { data: gruposData } = await safeQuery<any[]>(supabase.from('grupos').select('id, nombre, color').in('id', grupoIds))
            if (gruposData) setGrupos(gruposData)
        }

        // Fetch amigos
        const { data: amistadesData } = await safeQuery<any[]>(supabase
            .from('amistades')
            .select('id, usuario_id, amigo_id, estado, perfil:usuarios!amistades_amigo_id_fkey(nombre, email)')
            .eq('usuario_id', uid).eq('estado', 'activo'))
        if (amistadesData) setAmigos(amistadesData as any)
      }

      // 1. Grupo
      const { data: g } = await safeQuery<any>(supabase.from('grupos').select('*').eq('id', groupId).single())
      if (g) {
        setGrupo(g)
        setNombre(g.nombre)
      }

      // 2. Gastos del grupo
      const { data: gts } = await safeQuery<any[]>(supabase
        .from('gastos')
        .select('*, pagador:usuarios(nombre)')
        .eq('grupo_id', groupId)
        .order('fecha', { ascending: false }))
      if (gts) setGastos(gts)

      // 3. Miembros y mi rol
      const { data: m } = await safeQuery<any[]>(supabase
        .from('miembros_grupo')
        .select('usuario_id, rol, usuarios(nombre, email)')
        .eq('grupo_id', groupId))
      
      if (m) {
        setMiembros(m)
        if (uid) {
          const miRegistro = m.find(mi => mi.usuario_id === uid)
          if (miRegistro) setUserRole(miRegistro.rol)
        }
      }

      setLoading(false)
    }
    loadData()
  }, [groupId, supabase])

  async function handleLeaveGroup() {
    if (!userId || !confirm(lang === 'es' ? '¿Estás seguro de que quieres salir del grupo?' : 'Are you sure you want to leave the group?')) return

    const { error } = await safeQuery(supabase
      .from('miembros_grupo')
      .delete()
      .eq('grupo_id', groupId)
      .eq('usuario_id', userId))

    if (error) {
        alert(lang === 'es' ? `Error al salir del grupo: ${getDbErrorMessage(error)}` : `Error leaving group: ${getDbErrorMessage(error)}`)
        return
    }

    router.push('/dashboard')
  }

  async function handleDeleteGroup() {
    if (!confirm(lang === 'es' ? '¿Estás seguro de que quieres eliminar el grupo? Esta acción no se puede deshacer.' : 'Are you sure you want to delete the group? This action cannot be undone.')) return

    // Borramos datos dependientes primero
    const tablesToDelete = ['deudas', 'participantes_gasto', 'gastos', 'miembros_grupo', 'grupos']
    
    for (const table of tablesToDelete) {
        const { error } = await safeQuery(supabase.from(table).delete().eq(table === 'grupos' ? 'id' : 'grupo_id', groupId))
        if (error) {
            alert(lang === 'es' ? `Error al borrar ${table}: ${getDbErrorMessage(error)}` : `Error deleting ${table}: ${getDbErrorMessage(error)}`)
            return
        }
    }

    router.push('/dashboard')
  }

  if (loading) return <div className="p-6 text-text-muted">Cargando...</div>

  return (
    <DashboardLayout
      isDemo={isDemo}
      user={user}
      userId={userId}
      grupos={grupos}
      amigos={amigos}
    >
        <div className="p-6 max-w-3xl mx-auto text-text-primary">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-medium">{grupo?.nombre}</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-background-border mb-6">
                <button onClick={() => setActiveTab('resumen')} className={`pb-2 text-sm ${activeTab === 'resumen' ? 'text-positive border-b-2 border-positive' : 'text-text-muted'}`}>
                {lang === 'es' ? 'Resumen' : 'Overview'}
                </button>
                <button onClick={() => setActiveTab('config')} className={`pb-2 text-sm ${activeTab === 'config' ? 'text-positive border-b-2 border-positive' : 'text-text-muted'}`}>
                {lang === 'es' ? 'Configuración' : 'Settings'}
                </button>
            </div>

            {activeTab === 'resumen' ? (
                <div className="space-y-6">
                <div className="bg-background-card border border-background-border rounded-xl p-6">
                    <h2 className="text-xs text-text-muted uppercase mb-2">{lang === 'es' ? 'Saldo del grupo' : 'Group balance'}</h2>
                    <p className="text-3xl font-medium text-text-primary">
                        ${gastos.reduce((a, b) => a + b.monto, 0).toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{gastos.length} {lang === 'es' ? 'gastos totales' : 'total expenses'}</p>
                </div>

                <div>
                    <h2 className="text-sm font-medium mb-4">{lang === 'es' ? 'Gastos recientes' : 'Recent expenses'}</h2>
                    <div className="bg-background-card border border-background-border rounded-xl overflow-hidden">
                    {gastos.map(g => (
                        <div key={g.id} className="flex justify-between items-center px-4 py-3 border-b border-background-border last:border-0">
                        <div>
                            <p className="text-sm">{g.descripcion}</p>
                            <p className="text-[10px] text-text-muted">{g.pagador?.nombre}</p>
                        </div>
                        <span className="text-sm font-medium text-positive">${g.monto.toLocaleString('es-AR')}</span>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            ) : (
                <div className="space-y-6">
                <div className="bg-background-card border border-background-border rounded-xl p-6">
                    <label className="block text-xs text-text-muted mb-2">{lang === 'es' ? 'Nombre del grupo' : 'Group name'}</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-background-base border border-background-border rounded-lg px-4 py-2 text-sm" />
                </div>
                <div>
                    <h2 className="text-sm mb-4 text-text-secondary">{lang === 'es' ? 'Miembros' : 'Members'}</h2>
                    <div className="bg-background-card border border-background-border rounded-xl">
                    {miembros.map(m => (
                        <div key={m.usuario_id} className="px-4 py-3 border-b border-background-border last:border-0 text-sm">{m.usuarios?.nombre}</div>
                    ))}
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                    <button 
                        onClick={handleLeaveGroup}
                        className="text-xs text-negative hover:underline"
                    >
                        {lang === 'es' ? 'Salir del grupo' : 'Leave group'}
                    </button>
                    
                    {userRole === 'admin' && (
                        <button 
                        onClick={handleDeleteGroup}
                        className="text-xs text-red-500 hover:underline font-medium"
                        >
                        {lang === 'es' ? 'Eliminar grupo' : 'Delete group'}
                        </button>
                    )}
                    </div>
                </div>
                </div>
            )}
        </div>
    </DashboardLayout>
  )
}
