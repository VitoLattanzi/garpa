'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import { Amigo, Deuda } from '@/types/garpa'

export default function AmigosPage() {
  const { lang } = useLang()
  const supabase = createSupabaseBrowserClient()
  
  const [loading, setLoading] = useState(true)
  const [amigos, setAmigos] = useState<any[]>([]) // Simplificado para visualización
  const [myUserId, setMyUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setMyUserId(user.id)

      // 1. Fetch amigos
      const { data: rawAmigos } = await supabase
        .from('amistades')
        .select(`
          id,
          amigo_id,
          perfil:usuarios!amistades_amigo_id_fkey(nombre, email)
        `)
        .eq('usuario_id', user.id)
        .eq('estado', 'activo')

      // 2. Fetch deudas
      const { data: deudas } = await supabase
        .from('deudas')
        .select('*')
        .or(`acreedor_id.eq.${user.id},deudor_id.eq.${user.id}`)
        .eq('saldado', false)

      if (rawAmigos) {
        const amigosConBalance = rawAmigos.map((a: any) => {
          const friendId = a.amigo_id
          const balance = (deudas || []).reduce((acc: number, d: Deuda) => {
            if (d.acreedor_id === user.id && d.deudor_id === friendId) return acc + d.monto
            if (d.deudor_id === user.id && d.acreedor_id === friendId) return acc - d.monto
            return acc
          }, 0)
          
          return { ...a, balance }
        })

        // Ordenar: Deben (positivo) -> Debo (negativo) -> Saldado (0)
        amigosConBalance.sort((a, b) => b.balance - a.balance)
        setAmigos(amigosConBalance)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleDelete(amigoId: string, balance: number, friendEmail: string) {
    if (balance !== 0) {
      if (!confirm(lang === 'es' 
        ? '⚠️ Este amigo tiene saldo pendiente. ¿Estás seguro de eliminarlo?' 
        : '⚠️ This friend has an outstanding balance. Are you sure you want to delete them?')) {
        return
      }
      
      // Notificar API
      await fetch('/api/notify-delete', {
        method: 'POST',
        body: JSON.stringify({ userName: 'Usuario', friendEmail, saldoPendiente: balance })
      })
    } else {
      if (!confirm(lang === 'es' ? '¿Estás seguro de eliminar este amigo?' : 'Are you sure you want to delete this friend?')) {
        return
      }
    }

    await supabase.from('amistades').delete().eq('amigo_id', amigoId).eq('usuario_id', myUserId)
    setAmigos(prev => prev.filter(a => a.amigo_id !== amigoId))
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-medium text-[#E8E0D5]">
        {lang === 'es' ? 'Tus amigos' : 'Your friends'}
      </h1>
      
      <div className="flex flex-col gap-2">
        {amigos.map((amigo) => (
          <div key={amigo.id} className="flex items-center justify-between p-4 bg-[#0F1923] border border-[#1E2D3D] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[#E8E0D5]">{amigo.perfil.nombre}</p>
              <p className="text-xs text-[#4A6A7A]">{amigo.perfil.email}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`text-sm font-bold ${
                amigo.balance > 0 ? 'text-green-500' : 
                amigo.balance < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {amigo.balance > 0 ? `+` : ''}{amigo.balance.toFixed(2)}
              </span>
              
              <button 
                onClick={() => handleDelete(amigo.amigo_id, amigo.balance, amigo.perfil.email)}
                className="text-xs text-[#C0675A] hover:underline"
              >
                {lang === 'es' ? 'Eliminar' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
