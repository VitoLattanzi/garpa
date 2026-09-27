import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { safeQuery } from '@/lib/supabase-utils'

export async function POST(request: Request) {
  try {
    const { emailInvitado, usuarioInvitadorId, nombreInvitador } = await request.json()
    const supabase = await createSupabaseServerClient()

    // 1. Guardar la invitación en la DB
    const { error: dbError } = await safeQuery<any>(supabase
      .from('invitaciones')
      .insert({
        invitado_por: usuarioInvitadorId,
        email_invitado: emailInvitado,
        estado: 'pendiente'
      }))

    if (dbError) {
      console.error('Error guardando invitación:', dbError)
      return NextResponse.json({ success: false, error: 'Error guardando en BD' }, { status: 500 })
    }

    // 2. Disparar Webhook a n8n
    // Usamos await para asegurar que el proceso termine antes de que Vercel termine la ejecución
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
        console.error('N8N_WEBHOOK_URL no configurada')
        return NextResponse.json({ success: false, error: 'Configuración faltante' }, { status: 500 })
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailInvitado,
        nombreInvitador,
        linkInvitacion: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://garpa.vercel.app'}/register`
      })
    })

    if (!res.ok) {
      console.error('Error en Webhook de n8n:', await res.text())
      return NextResponse.json({ success: false, error: 'Error al procesar notificación' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Invitación enviada y webhook disparado' })
  } catch (error) {
    console.error('Error en ruta invite:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
