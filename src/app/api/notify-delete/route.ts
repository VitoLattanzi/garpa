import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(request: Request) {
  try {
    const { userName, friendEmail, saldoPendiente } = await request.json()

    try {
      const info = await transporter.sendMail({
        from: `"Garpa" <${process.env.EMAIL_USER}>`,
        to: friendEmail,
        subject: 'Garpa - Notificación de eliminación',
        text: `${userName} te ha eliminado de sus amigos. Quedó un saldo pendiente de $${saldoPendiente}.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <p>${userName} te ha eliminado de sus amigos.</p>
            <p>Quedó un saldo pendiente de <strong>$${saldoPendiente}</strong>.</p>
          </div>
        `,
        headers: {
          'Reply-To': process.env.EMAIL_USER || ''
        }
      })
      console.log("Éxito de Nodemailer (NotifyDelete). ID:", info.messageId)
    } catch (error) {
      console.error("Error detallado de Nodemailer (NotifyDelete):", error)
      return NextResponse.json({ success: false, error: 'Error al enviar el email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Notificación enviada' })
  } catch (error) {
    console.error('Error en ruta notify-delete:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
