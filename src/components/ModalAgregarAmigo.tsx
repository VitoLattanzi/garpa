'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'

type Props = {
  onClose: () => void
  onAdded: (amigo: { id: string; nombre: string; email: string }) => void
  userId: string
  isDemo: boolean
}

type Estado = 'idle' | 'encontrado' | 'invitado' | 'error'

/**
 * Modal para agregar un amigo
 * Si el usuario existe → crea la amistad directamente
 * Si no existe → guarda una invitación y le manda un email para registrarse
 * En modo demo → genera un amigo ficticio
 */
export default function ModalAgregarAmigo({ onClose, onAdded, userId, isDemo }: Props) {
  const { lang } = useLang()
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [estado, setEstado] = useState<Estado>('idle')
  const [error, setError] = useState<string | null>(null)
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<{ id: string; nombre: string; email: string } | null>(null)
  const [showReenviar, setShowReenviar] = useState(false)

  /**
   * Paso 1 — Busca el usuario por email
   */
  async function handleBuscar() {
    if (!email.trim()) {
      setError(lang === 'es' ? 'Ingresá un email' : 'Enter an email')
      return
    }

    setLoading(true)
    setError(null)
    setShowReenviar(false) // Reset

    if (isDemo) {
      const nombres = ['Lucas Pérez', 'Sofía García', 'Martín López', 'Valentina Ruiz']
      const nombreRandom = nombres[Math.floor(Math.random() * nombres.length)]
      onAdded({
        id: `demo-amigo-${Date.now()}`,
        nombre: nombreRandom,
        email: email.trim(),
      })
      return
    }

    // Buscamos el usuario por email en la DB
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nombre, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (usuario) {
      if (usuario.id === userId) {
        setError(lang === 'es' ? 'No podés agregarte a vos mismo' : "You can't add yourself")
        setLoading(false)
        return
      }

      // Verificamos que no sean amigos ya
      const { data: amistad } = await supabase
        .from('amistades')
        .select('id')
        .or(`and(usuario_id.eq.${userId},amigo_id.eq.${usuario.id}),and(usuario_id.eq.${usuario.id},amigo_id.eq.${userId})`)
        .maybeSingle()

      if (amistad) {
        setError(lang === 'es' ? 'Ya son amigos' : 'Already friends')
        setLoading(false)
        return
      }

      // Usuario encontrado — mostramos confirmación
      setUsuarioEncontrado(usuario)
      setEstado('encontrado')
    } else {
      setEstado('error')
    }

    setLoading(false)
  }

  /**
   * Paso 2a — Envía solicitud de amistad (inserta en invitaciones)
   */
  async function handleAgregarExistente() {
    if (!usuarioEncontrado) return
    setLoading(true)
    setError(null)

    const { error: inviteError } = await supabase
      .from('invitaciones')
      .insert({
        solicitante_id: userId,
        invitado_id: usuarioEncontrado.id,
        estado: 'pendiente',
      })

    if (inviteError) {
      // 23505 = unique_violation
      if (inviteError.code === '23505') {
        setError(lang === 'es' ? 'Ya existe una interacción previa con este usuario.' : 'There is already a previous interaction with this user.')
        setShowReenviar(true)
      } else {
        setError(lang === 'es' ? 'Error al enviar solicitud' : 'Error sending request')
      }
      setLoading(false)
      return
    }

    setEstado('invitado')
    setLoading(false)
  }

  /**
   * Reenviar solicitud — actualiza el timestamp
   */
  async function handleReenviar() {
      if (!usuarioEncontrado) return
      setLoading(true)
      
      const { error: updateError } = await supabase
        .from('invitaciones')
        .update({ estado: 'pendiente' })
        .eq('solicitante_id', userId)
        .eq('invitado_id', usuarioEncontrado.id)

      if (updateError) {
          setError(lang === 'es' ? 'Error al reenviar' : 'Error resending')
      } else {
          setEstado('invitado')
      }
      setLoading(false)
  }

  /**
   * Paso 2b — Envía una invitación a alguien que no está registrado
   * Llama a la API /api/invite para guardar en DB y enviar email via Resend (EmailInvitacion.tsx)
   */
  async function handleInvitar() {
    setLoading(true)
    setError(null)

    // Verificamos que no haya una invitación pendiente ya
    const { data: invExistente } = await supabase
      .from('invitaciones')
      .select('id')
      .eq('invitado_por', userId)
      .eq('email_invitado', email.trim().toLowerCase())
      .maybeSingle()

    if (invExistente) {
      setError(lang === 'es'
        ? 'Ya enviaste una invitación a este email'
        : 'You already sent an invitation to this email'
      )
      setLoading(false)
      return
    }

    // Obtener el perfil del usuario actual para enviar su nombre en la invitación
    const { data: perfilUsuario } = await supabase
      .from('usuarios')
      .select('nombre')
      .eq('id', userId)
      .maybeSingle()

    const nombreInvitador = perfilUsuario?.nombre || (lang === 'es' ? 'Un amigo' : 'A friend')

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailInvitado: email.trim().toLowerCase(),
          usuarioInvitadorId: userId,
          nombreInvitador,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Error al enviar invitación')
      }

      setEstado('invitado')
    } catch (err: any) {
      console.error('Error enviando invitación:', err)
      setError(lang === 'es' ? 'Error al enviar la invitación' : 'Error sending invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-6 w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-medium text-[#E8E0D5]">
            {lang === 'es' ? 'Agregar amigo' : 'Add friend'}
          </h3>
          <button onClick={onClose} className="text-[#4A6A7A] hover:text-[#8A9BAA]">✕</button>
        </div>

        {/* Estado: invitación enviada */}
        {estado === 'invitado' && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-sm font-medium text-[#E8E0D5] mb-2">
              {lang === 'es' ? '¡Invitación enviada!' : 'Invitation sent!'}
            </p>
            <p className="text-xs text-[#4A6A7A]">
              {lang === 'es'
                ? `Le mandamos un email a ${email} para que se registre en Garpa.`
                : `We sent an email to ${email} to join Garpa.`
              }
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-[#3D8B7A] text-[#0F1923] font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition"
            >
              {lang === 'es' ? 'Listo' : 'Done'}
            </button>
          </div>
        )}

        {/* Estado: usuario encontrado — confirmar */}
        {estado === 'encontrado' && usuarioEncontrado && (
          <div>
            <p className="text-xs text-[#4A6A7A] mb-4">
              {lang === 'es' ? 'Encontramos este usuario:' : 'We found this user:'}
            </p>
            <div className="flex items-center gap-3 bg-[#0F1923] border border-[#1E2D3D] rounded-xl px-4 py-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#1E2D3D] flex items-center justify-center text-xs font-medium text-[#3D8B7A] flex-shrink-0">
                {usuarioEncontrado.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#E8E0D5]">{usuarioEncontrado.nombre}</p>
                <p className="text-xs text-[#4A6A7A]">{usuarioEncontrado.email}</p>
              </div>
            </div>
            {error && <p className="text-xs text-[#C0675A] mb-3">{error}</p>}
            {showReenviar ? (
              <button
                onClick={handleReenviar}
                disabled={loading}
                className="w-full bg-[#1E2D3D] text-[#E8E0D5] font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                  {loading 
                    ? (lang === 'es' ? 'Reenviando...' : 'Resending...')
                    : (lang === 'es' ? 'Reenviar solicitud' : 'Resend request')
                  }
              </button>
            ) : (
              <button
                onClick={handleAgregarExistente}
                disabled={loading}
                className="w-full bg-[#3D8B7A] text-[#0F1923] font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {loading
                  ? (lang === 'es' ? 'Agregando...' : 'Adding...')
                  : (lang === 'es' ? 'Agregar como amigo' : 'Add as friend')
                }
              </button>
            )}
          </div>
        )}

        {/* Estado: no encontrado — invitar */}
        {estado === 'error' && (
          <div>
            <div className="bg-[#0F1923] border border-[#1E2D3D] rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-[#8A9BAA]">
                {lang === 'es'
                  ? `No encontramos ningún usuario con el email `
                  : `No user found with the email `
                }
                <span className="text-[#E8E0D5] font-medium">{email}</span>
              </p>
              <p className="text-xs text-[#4A6A7A] mt-1">
                {lang === 'es'
                  ? '¿Querés invitarlo a Garpa?'
                  : 'Would you like to invite them to Garpa?'
                }
              </p>
            </div>
            {error && <p className="text-xs text-[#C0675A] mb-3">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setEstado('idle'); setError(null) }}
                className="flex-1 border border-[#1E2D3D] text-[#8A9BAA] py-2.5 rounded-lg text-sm hover:border-[#3D8B7A] transition"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleInvitar}
                disabled={loading}
                className="flex-1 bg-[#3D8B7A] text-[#0F1923] font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {loading
                  ? (lang === 'es' ? 'Enviando...' : 'Sending...')
                  : (lang === 'es' ? 'Invitar' : 'Invite')
                }
              </button>
            </div>
          </div>
        )}

        {/* Estado: idle — buscar */}
        {estado === 'idle' && (
          <div>
            <p className="text-xs text-[#4A6A7A] mb-4">
              {lang === 'es'
                ? 'Buscamos a tu amigo por su email. Si no está registrado, le mandamos una invitación.'
                : "We'll find your friend by email. If they're not registered, we'll send them an invite."
              }
            </p>
            <div className="mb-4">
              <label className="block text-xs text-[#4A6A7A] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={lang === 'es' ? 'amigo@email.com' : 'friend@email.com'}
                className="w-full bg-[#0F1923] border border-[#1E2D3D] rounded-lg px-3 py-2.5 text-sm text-[#E8E0D5] outline-none focus:border-[#3D8B7A] transition"
                onKeyDown={e => e.key === 'Enter' && handleBuscar()}
              />
            </div>
            {error && <p className="text-xs text-[#C0675A] mb-3">{error}</p>}
            <button
              onClick={handleBuscar}
              disabled={loading}
              className="w-full bg-[#3D8B7A] text-[#0F1923] font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading
                ? (lang === 'es' ? 'Buscando...' : 'Searching...')
                : (lang === 'es' ? 'Buscar' : 'Search')
              }
            </button>
          </div>
        )}

      </div>
    </div>
  )
} 

