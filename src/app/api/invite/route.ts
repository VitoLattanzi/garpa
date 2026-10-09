import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { safeQuery } from '@/lib/supabase-utils'
import { env } from '@/lib/env-server'

// Configuración del transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
})

export async function POST(request: Request) {
  try {
    const { emailInvitado, usuarioInvitadorId, nombreInvitador } = await request.json()
    const supabase = await createSupabaseServerClient()

    // 1. Guardar en BD
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invitacion, error: dbError } = await safeQuery<any>(supabase
      .from('invitaciones')
      .insert({
        invitado_por: usuarioInvitadorId,
        email_invitado: emailInvitado,
        estado: 'pendiente'
      })
      .select('id')
      .single())

    if (dbError || !invitacion) {
      console.error('Error guardando invitación:', dbError)
      return NextResponse.json({ success: false, error: 'Error guardando en BD' }, { status: 500 })
    }

    const invitationUrl = `${env.NEXT_PUBLIC_SITE_URL}/register?invitationId=${invitacion.id}`

    // 2. Enviar correo
    try {
      const info = await transporter.sendMail({
        from: `"Garpa" <${env.EMAIL_USER}>`,
        to: emailInvitado,
        subject: `${nombreInvitador} te invitó a Garpa`,
        text: `${nombreInvitador} te ha invitado a unirte a Garpa para gestionar gastos y deudas con amigos. Acepta la invitación aquí: ${invitationUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>¡Hola!</h1>
            <p>${nombreInvitador} te ha invitado a unirte a <strong>Garpa</strong> para gestionar gastos y deudas con amigos.</p>
            <a href="${invitationUrl}" 
               style="background: #3D8B7A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               Aceptar invitación
            </a>
          </div>
        `,
        headers: {
          'Reply-To': env.EMAIL_USER || ''
        }
      })
      console.log("Éxito de Nodemailer. ID:", info.messageId)
    } catch (error) {
      console.error("Error detallado de Nodemailer:", error)
      return NextResponse.json({ success: false, error: 'Error al enviar el email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Invitación enviada' })
  } catch (error) {
    console.error('Error en ruta invite:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
