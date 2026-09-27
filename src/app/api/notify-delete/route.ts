import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Disparar Webhook a n8n
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
        console.error('N8N_WEBHOOK_URL no configurada')
        return NextResponse.json({ success: false, error: 'Configuración faltante' }, { status: 500 })
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        type: 'DELETE_NOTIFICATION'
      })
    })

    if (!res.ok) {
      console.error('Error en Webhook de n8n:', await res.text())
      return NextResponse.json({ success: false, error: 'Error al procesar notificación' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Notificación enviada vía webhook' })
  } catch (error) {
    console.error('Error en ruta notify-delete:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
