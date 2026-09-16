import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { userName, friendEmail, saldoPendiente } = await request.json()

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: friendEmail,
      subject: 'Garpa - Notificación de eliminación',
      html: `<p>${userName} te ha eliminado de sus amigos. Quedó un saldo pendiente de $${saldoPendiente}</p>`
    })

    if (error) {
      console.error('Error enviando email con Resend:', error)
      return NextResponse.json({ success: false, error: 'Error al enviar el email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Notificación enviada' })
  } catch (error) {
    console.error('Error en ruta notify-delete:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
