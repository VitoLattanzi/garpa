import { NextResponse } from 'next/server'

/**
 * Endpoint para notificar la eliminación de un amigo.
 * 
 * NOTA: Para implementar el envío real de emails, podrías usar servicios como Resend, Nodemailer (con SMTP), o SendGrid.
 * 1. Debes crear una cuenta en el servicio elegido (ej. Resend.com).
 * 2. Obtener una API KEY.
 * 3. Guardar esa KEY en tus variables de entorno (.env.local) como EMAIL_SERVICE_API_KEY.
 * 4. Usar esa variable aquí para autenticar el envío.
 */
export async function POST(request: Request) {
  try {
    const { userName, friendEmail, saldoPendiente } = await request.json()

    // Mock de log para verificar que los datos llegan
    console.log(`[NOTIFICACIÓN] Usuario ${userName} eliminó a ${friendEmail}. Saldo pendiente: $${saldoPendiente}`)

    // TODO: Implementar lógica de envío de email aquí
    // await resend.emails.send({ ... })

    return NextResponse.json({ success: true, message: 'Notificación enviada (mock)' })
  } catch (error) {
    console.error('Error al notificar:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
