import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { safeQuery } from '@/lib/supabase-utils'

// Configuración del transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(request: Request) {
  try {
    const { emailInvitado, usuarioInvitadorId, nombreInvitador } = await request.json()
    const supabase = await createSupabaseServerClient()

    // 1. Guardar en BD
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

    // 2. Enviar correo
    try {
      const info = await transporter.sendMail({
        from: `"Garpa" <${process.env.EMAIL_USER}>`,
        to: emailInvitado,
        subject: `${nombreInvitador} te invitó a Garpa`,
        text: `${nombreInvitador} te ha invitado a unirte a Garpa para gestionar gastos y deudas con amigos. Acepta la invitación aquí: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://garpa.vercel.app'}/register`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>¡Hola!</h1>
            <p>${nombreInvitador} te ha invitado a unirte a <strong>Garpa</strong> para gestionar gastos y deudas con amigos.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://garpa.vercel.app'}/register" 
               style="background: #3D8B7A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               Aceptar invitación
            </a>
          </div>
        `,
        headers: {
          'Reply-To': process.env.EMAIL_USER || ''
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
