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
    const { type, email, userName, friendEmail, saldoPendiente, nombreInvitador } = await request.json()

    let subject = ''
    let html = ''

    if (type === 'INVITE') {
      subject = `${nombreInvitador} te invitó a Garpa`
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>¡Hola!</h1>
          <p>${nombreInvitador} te ha invitado a unirte a <strong>Garpa</strong>.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://garpa.vercel.app'}/register" 
             style="background: #3D8B7A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             Aceptar invitación
          </a>
        </div>
      `
    } else if (type === 'DELETE') {
      subject = 'Garpa - Notificación de eliminación'
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>${userName} te ha eliminado de sus amigos.</p>
          <p>Quedó un saldo pendiente de <strong>$${saldoPendiente}</strong>.</p>
        </div>
      `
      // For delete, we use the friendEmail provided in the payload
    }

    await transporter.sendMail({
      from: `"Garpa" <${process.env.EMAIL_USER}>`,
      to: type === 'DELETE' ? friendEmail : email,
      subject,
      html
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en ruta notify:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
