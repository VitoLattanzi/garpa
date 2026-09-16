'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import { Amigo, Deuda } from '@/types/garpa'

export default function AmigosPage() {
  const { lang } = useLang()
  const supabase = createSupabaseBrowserClient()
  
  const [loading, setLoading] = useState(true)
  const [amigos, setAmigos] = useState<any[]>([]) // Simplificado para visualización
  const [myUserId, setMyUserId] = useState<string | null>(null)

  const [invitaciones, setInvitaciones] = useState<any[]>([])
  const [cooldown, setCooldown] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setMyUserId(user.id)

      // 1. Fetch amigos
      const { data: rawAmigos } = await supabase
        .from('amistades')
        .select(`
          id,
          amigo_id,
          perfil:usuarios!amistades_amigo_id_fkey(nombre, email)
        `)
        .eq('usuario_id', user.id)
        .eq('estado', 'activo')

      // 2. Fetch invitaciones
      const { data: rawInvitaciones } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('invitado_por', user.id)

      // 3. Fetch deudas
      const { data: deudas } = await supabase
        .from('deudas')
        .select('*')
        .or(`acreedor_id.eq.${user.id},deudor_id.eq.${user.id}`)
        .eq('saldado', false)

      if (rawAmigos) {
        const amigosConBalance = rawAmigos.map((a: any) => {
          const friendId = a.amigo_id
          const balance = (deudas || []).reduce((acc: number, d: Deuda) => {
            if (d.acreedor_id === user.id && d.deudor_id === friendId) return acc + d.monto
            if (d.deudor_id === user.id && d.acreedor_id === friendId) return acc - d.monto
            return acc
          }, 0)
          
          return { ...a, balance }
        })

        // Ordenar: Deben (positivo) -> Debo (negativo) -> Saldado (0)
        amigosConBalance.sort((a, b) => b.balance - a.balance)
        setAmigos(amigosConBalance)
      }
      
      if (rawInvitaciones) setInvitaciones(rawInvitaciones)
      
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleResendInvite(email: string, id: string) {
    const lastSent = cooldown[id] || 0
    if (Date.now() - lastSent < 60000) {
      alert(lang === 'es' ? 'Esperá un minuto antes de reenviar.' : 'Wait a minute before resending.')
      return
    }

    setCooldown(prev => ({ ...prev, [id]: Date.now() }))
    // Re-trigger email via Supabase Auth or custom API endpoint
    await supabase.auth.signUp({ email, password: Math.random().toString(36).slice(-10) })
    alert(lang === 'es' ? 'Invitación reenviada.' : 'Invitation resent.')
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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
      <a href="/dashboard" className="text-sm text-[#4A6A7A] hover:text-[#8A9BAA] flex items-center gap-1">
        ← {lang === 'es' ? 'Volver al dashboard' : 'Back to dashboard'}
      </a>
      
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#E8E0D5]">
          {lang === 'es' ? 'Tus amigos' : 'Your friends'}
        </h1>
        <p className="text-sm text-[#4A6A7A]">
          {lang === 'es' 
            ? 'Gestioná tus contactos y verificá quién te debe o a quién le debés.' 
            : 'Manage your contacts and check who owes you or who you owe.'}
        </p>
      </div>
      
      {/* Sección Invitaciones Pendientes */}
      {invitaciones.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          <h2 className="text-sm font-medium text-[#4A6A7A] uppercase tracking-wider">
            {lang === 'es' ? 'Invitaciones enviadas' : 'Invitations sent'}
          </h2>
          {invitaciones.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 bg-[#1E2D3D]/50 border border-[#1E2D3D] rounded-xl">
              <span className="text-sm text-[#E8E0D5]">{inv.email_invitado}</span>
              <button 
                onClick={() => handleResendInvite(inv.email_invitado, inv.id)}
                className="text-xs text-[#3D8B7A] hover:underline"
              >
                {lang === 'es' ? 'Reenviar' : 'Resend'}
              </button>
            </div>
          ))}
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
          {amigos.map((amigo) => (
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
