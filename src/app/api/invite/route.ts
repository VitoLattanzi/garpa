import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { renderToStaticMarkup } from 'react-dom/server'
import EmailInvitacion from '@/components/EmailInvitacion'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { emailInvitado, usuarioInvitadorId, nombreInvitador } = await request.json()
    const supabase = await createSupabaseServerClient()

    // 1. Guardar la invitación en la DB
    const { error: dbError } = await supabase
      .from('invitaciones')
      .insert({
        invitado_por: usuarioInvitadorId,
        email_invitado: emailInvitado,
        estado: 'pendiente'
      })

    if (dbError) {
      console.error('Error guardando invitación:', dbError)
      return NextResponse.json({ success: false, error: 'Error guardando en BD' }, { status: 500 })
    }

    // 2. Generar el HTML del email
    const emailHtml = renderToStaticMarkup(
      EmailInvitacion({
        nombreInvitador: nombreInvitador,
        linkInvitacion: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://garpa.vercel.app'}/register`
      })
    )

    // 3. Enviar email
    const { error: emailError } = await resend.emails.send({
      from: 'Garpa <onboarding@resend.dev>',
      to: emailInvitado,
      subject: `${nombreInvitador} te invitó a Garpa`,
      html: emailHtml
    })

    if (emailError) {
      console.error('Error enviando email:', emailError)
      return NextResponse.json({ success: false, error: 'Error al enviar el email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Invitación enviada' })
  } catch (error) {
    console.error('Error en ruta invite:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
