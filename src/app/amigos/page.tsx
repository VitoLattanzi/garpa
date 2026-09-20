'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import { Amigo, Deuda, Grupo } from '@/types/garpa'
import DashboardLayout, { useDashboard } from '@/components/DashboardLayout'

function AmigosContent({ 
  isDemo, user, myUserId, grupos, amigos, invitacionesRecibidas, handleAccept, handleReject, handleDelete, lang 
}: any) {
  const { openModal } = useDashboard()

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
      <a href="/dashboard" className="text-sm text-[#4A6A7A] hover:text-[#8A9BAA] flex items-center gap-1">
        ← {lang === 'es' ? 'Volver al dashboard' : 'Back to dashboard'}
      </a>
      
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#E8E0D5]">
            {lang === 'es' ? 'Tus amigos' : 'Your friends'}
          </h1>
          <button 
            onClick={() => openModal('agregarAmigo')}
            className="bg-[#3D8B7A] text-[#0F1923] text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90"
          >
            {lang === 'es' ? '+ Agregar amigo' : '+ Add friend'}
          </button>
        </div>
        <p className="text-sm text-[#4A6A7A]">
          {lang === 'es' 
            ? 'Gestioná tus contactos y verificá quién te debe o a quién le debés.' 
            : 'Manage your contacts and check who owes you or who you owe.'}
        </p>
      </div>

      {/* Solicitudes de amistad */}
      {invitacionesRecibidas.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-[#E8E0D5] mb-3">{lang === 'es' ? 'Solicitudes pendientes' : 'Pending requests'}</h2>
          <div className="flex flex-col gap-2">
            {invitacionesRecibidas.map((inv: any) => (
                <div key={inv.id} className="flex justify-between items-center bg-[#172130] p-3 rounded-lg border border-[#1E2D3D]">
                  <span className="text-sm text-[#E8E0D5]">{inv.solicitante.nombre}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAccept(inv.id, inv.solicitante.id)}
                      className="text-xs bg-[#3D8B7A] text-[#0F1923] px-3 py-1 rounded-full font-medium"
                    >
                      {lang === 'es' ? 'Aceptar' : 'Accept'}
                    </button>
                    <button 
                      onClick={() => handleReject(inv.id)}
                      className="text-xs text-[#C0675A] border border-[#C0675A]/20 hover:bg-[#C0675A]/10 px-3 py-1 rounded-full font-medium"
                    >
                      {lang === 'es' ? 'Rechazar' : 'Reject'}
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}
      
      {amigos.length === 0 ? (
        <div className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-8 text-center">
          <p className="text-[#8A9BAA]">
            {lang === 'es' ? 'Todavía no tenés amigos agregados.' : 'No friends added yet.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {amigos.map((amigo: any) => (
            <div key={amigo.id} className="group relative flex items-center justify-between p-4 bg-[#172130] border border-[#1E2D3D] rounded-xl hover:border-[#3D8B7A]/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1E2D3D] flex items-center justify-center text-[#3D8B7A] font-bold">
                  {amigo.perfil.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#E8E0D5]">{amigo.perfil.nombre}</p>
                  <p className="text-xs text-[#4A6A7A]">{amigo.perfil.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-[#4A6A7A] mb-0.5">
                    {amigo.balance > 0 
                      ? (lang === 'es' ? 'Te debe' : 'Owes you')
                      : amigo.balance < 0 
                      ? (lang === 'es' ? 'Le debés' : 'You owe')
                      : (lang === 'es' ? 'Al día' : 'All good')}
                  </p>
                  <span className={`text-sm font-bold ${
                    amigo.balance > 0 ? 'text-green-500' : 
                    amigo.balance < 0 ? 'text-red-500' : 'text-[#8A9BAA]'
                  }`}>
                    {amigo.balance !== 0 ? Math.abs(amigo.balance).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : '-'}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleDelete(amigo.id, amigo.balance, amigo.perfil.email)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#C0675A]/10 rounded-lg text-[#C0675A]"
                  title={lang === 'es' ? 'Eliminar amigo' : 'Remove friend'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AmigosPage() {
  const { lang } = useLang()
  const supabase = createSupabaseBrowserClient()
  
  const [loading, setLoading] = useState(true)
  const [amigos, setAmigos] = useState<any[]>([]) 
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [user, setUser] = useState<{ nombre: string; email: string } | null>(null)
  const [invitacionesRecibidas, setInvitacionesRecibidas] = useState<any[]>([])
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const demoActivo = document.cookie.includes('garpa-demo=true')
      setIsDemo(demoActivo)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
          if (!demoActivo) return // handle redirect if needed
          setMyUserId('demo-user')
      } else {
          setMyUserId(session.user.id)
          
          // Perfil
          const { data: perfil } = await supabase
            .from('usuarios').select('nombre, email').eq('id', session.user.id).single()
          if (perfil) setUser(perfil)
          
          // Grupos
          const { data: miembrosData } = await supabase
            .from('miembros_grupo').select('grupo_id').eq('usuario_id', session.user.id)
          if (miembrosData && miembrosData.length > 0) {
            const grupoIds = miembrosData.map((m: any) => m.grupo_id)
            const { data: gruposData } = await supabase
              .from('grupos').select('id, nombre').in('id', grupoIds)
            if (gruposData) setGrupos(gruposData)
          }
      }

      const uid = session?.user.id || 'demo-user'

      // 1. Fetch amigos
      const { data: rawAmigos } = await supabase
        .from('amistades')
        .select(`
          id,
          amigo_id,
          perfil:usuarios!amistades_amigo_id_fkey(nombre, email)
        `)
        .eq('usuario_id', uid)
        .eq('estado', 'activo')

      // 2. Fetch invitaciones recibidas
      const { data: rawInvitaciones } = await supabase
        .from('invitaciones')
        .select(`
          id,
          solicitante:usuarios!invitaciones_solicitante_id_fkey(nombre, email)
        `)
        .eq('invitado_id', uid)
        .eq('estado', 'pendiente')

      // 3. Fetch deudas
      const { data: deudas } = await supabase
        .from('deudas')
        .select('*')
        .or(`acreedor_id.eq.${uid},deudor_id.eq.${uid}`)
        .eq('saldado', false)

      if (rawAmigos) {
        const amigosConBalance = rawAmigos.map((a: any) => {
          const friendId = a.amigo_id
          const balance = (deudas || []).reduce((acc: number, d: Deuda) => {
            if (d.acreedor_id === uid && d.deudor_id === friendId) return acc + d.monto
            if (d.deudor_id === uid && d.acreedor_id === friendId) return acc - d.monto
            return acc
          }, 0)
          
          return { ...a, balance }
        })

        amigosConBalance.sort((a, b) => b.balance - a.balance)
        setAmigos(amigosConBalance)
      }
      
      if (rawInvitaciones) setInvitacionesRecibidas(rawInvitaciones)
      
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  async function handleAccept(invitacionId: string, solicitanteId: string) {
    // 1. Crear amistad bidireccional
    await supabase.from('amistades').insert([
        { usuario_id: myUserId, amigo_id: solicitanteId, estado: 'activo' },
        { usuario_id: solicitanteId, amigo_id: myUserId, estado: 'activo' }
    ])

    // 2. Actualizar estado invitacion
    await supabase.from('invitaciones').update({ estado: 'aceptada' }).eq('id', invitacionId)

    // 3. Actualizar estado local
    setInvitacionesRecibidas(prev => prev.filter(i => i.id !== invitacionId))
    // Nota: Opcionalmente deberíamos recargar la lista de amigos aquí si quisiéramos verlos reflejados inmediatamente,
    // pero por ahora el requisito es solo limpiar la invitación
  }

  async function handleReject(invitacionId: string) {
    // Actualizar estado invitacion a rechazada
    await supabase.from('invitaciones').update({ estado: 'rechazada' }).eq('id', invitacionId)
    
    // Actualizar estado local
    setInvitacionesRecibidas(prev => prev.filter(i => i.id !== invitacionId))
  }

  async function handleDelete(amigoId: string, balance: number, friendEmail: string) {
    if (balance !== 0) {
      if (!confirm(lang === 'es' 
        ? '⚠️ Este amigo tiene saldo pendiente. ¿Estás seguro de eliminarlo?' 
        : '⚠️ This friend has an outstanding balance. Are you sure you want to delete them?')) {
        return
      }
      
      // Notificar API
      await fetch('/api/notify-delete', {
        method: 'POST',
        body: JSON.stringify({ userName: 'Usuario', friendEmail, saldoPendiente: balance })
      })
    } else {
      if (!confirm(lang === 'es' ? '¿Estás seguro de eliminar este amigo?' : 'Are you sure you want to delete this friend?')) {
        return
      }
    }

    // Intentar borrar por el ID de la amistad (PK)
    const { error } = await supabase.from('amistades').delete().eq('id', amigoId)
    
    if (error) {
      console.error('Error al eliminar:', error)
      alert(lang === 'es' ? 'Error al eliminar. Intentá de nuevo.' : 'Error deleting. Try again.')
      return
    }

    setAmigos(prev => prev.filter(a => a.id !== amigoId))
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <DashboardLayout
      isDemo={isDemo}
      user={user}
      userId={myUserId}
      grupos={grupos}
      amigos={amigos}
    >
      <AmigosContent
        isDemo={isDemo}
        user={user}
        myUserId={myUserId}
        grupos={grupos}
        amigos={amigos}
        invitacionesRecibidas={invitacionesRecibidas}
        handleAccept={handleAccept}
        handleReject={handleReject}
        handleDelete={handleDelete}
        lang={lang}
      />
    </DashboardLayout>
  )
}

