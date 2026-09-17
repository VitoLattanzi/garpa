'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'

export default function GastosPage() {
  const supabase = createSupabaseBrowserClient()
  const { lang } = useLang()
  const [gastos, setGastos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGastos() {
      const { data } = await supabase
        .from('gastos')
        .select('*, grupos(nombre)')
        .order('fecha', { ascending: false })
      if (data) setGastos(data)
      setLoading(false)
    }
    loadGastos()
  }, [supabase])

  if (loading) return <div className="p-6 text-[#4A6A7A]">Cargando...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto text-[#E8E0D5]">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="text-sm text-[#4A6A7A] hover:text-[#3D8B7A] transition flex items-center gap-1">
          ← {lang === 'es' ? 'Volver' : 'Back'}
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-8 text-[#3D8B7A]">{lang === 'es' ? 'Historial de Gastos' : 'Expense History'}</h1>
      
      <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl overflow-hidden">
        {gastos.map(g => (
          <div key={g.id} className="flex justify-between items-center px-6 py-4 border-b border-[#1E2D3D] last:border-0 hover:bg-[#1E2D3D]/50 transition">
            <div>
              <p className="text-sm font-medium">{g.descripcion}</p>
              <p className="text-xs text-[#4A6A7A]">{g.grupos?.nombre || (lang === 'es' ? 'Amigos' : 'Friends')}</p>
            </div>
            <p className="text-sm font-medium text-[#3D8B7A]">+${g.monto.toLocaleString('es-AR')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
