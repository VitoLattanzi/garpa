'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import { useToast } from '@/context/ToastContext'

type ModalSolicitudesProps = {
  onClose: () => void
  userId: string
}

export default function ModalSolicitudes({ onClose, userId }: ModalSolicitudesProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [invitaciones, setInvitaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()
  const { showToast } = useToast()

  useEffect(() => {
    async function fetchInvitaciones() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user.email) return

      const { data } = await supabase
        .from('invitaciones')
        .select('*, usuarios!invitaciones_invitado_por_fkey(id, nombre, email)')
        .eq('email_invitado', session.user.email)
        .eq('estado', 'pendiente')

      if (data) setInvitaciones(data)
      setLoading(false)
    }
    fetchInvitaciones()
  }, [supabase])

  async function handleAccept(invitacionId: string, solicitanteId: string) {
    const { error: amistadError } = await supabase.from('amistades').insert([
        { usuario_id: userId, amigo_id: solicitanteId, estado: 'activo' },
        { usuario_id: solicitanteId, amigo_id: userId, estado: 'activo' }
    ])

    if (amistadError) {
        showToast(lang === 'es' ? 'Error al aceptar' : 'Error accepting', 'error')
        return
    }

    await supabase.from('invitaciones').update({ estado: 'aceptada' }).eq('id', invitacionId)
    
    showToast(lang === 'es' ? 'Amistad aceptada' : 'Friendship accepted', 'success')
    setInvitaciones(prev => prev.filter(i => i.id !== invitacionId))
  }

  async function handleReject(invitacionId: string) {
    await supabase.from('invitaciones').update({ estado: 'rechazada' }).eq('id', invitacionId)
    showToast(lang === 'es' ? 'Invitación rechazada' : 'Invitation rejected', 'success')
    setInvitaciones(prev => prev.filter(i => i.id !== invitacionId))
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 p-4" onClick={onClose}>
      <div className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#E8E0D5]">{lang === 'es' ? 'Solicitudes' : 'Requests'}</h3>
          <button onClick={onClose} className="text-[#4A6A7A] hover:text-[#8A9BAA]">✕</button>
        </div>

        {loading ? (
          <p className="text-sm text-[#4A6A7A]">{lang === 'es' ? 'Cargando...' : 'Loading...'}</p>
        ) : invitaciones.length === 0 ? (
          <p className="text-sm text-[#4A6A7A]">{lang === 'es' ? 'No hay solicitudes pendientes.' : 'No pending requests.'}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {invitaciones.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center bg-[#1E2D3D] p-3 rounded-lg">
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium text-[#E8E0D5] truncate">{inv.usuarios.nombre}</span>
                  <span className="text-xs text-[#4A6A7A] truncate">{inv.usuarios.email}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(inv.id, inv.usuarios.id)} className="text-xs bg-[#3D8B7A] text-white px-2 py-1 rounded hover:opacity-90">
                    {lang === 'es' ? 'Aceptar' : 'Accept'}
                  </button>
                  <button onClick={() => handleReject(inv.id)} className="text-xs border border-[#4A6A7A] text-[#4A6A7A] px-2 py-1 rounded hover:text-white hover:border-white">
                    {lang === 'es' ? 'Rechazar' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}