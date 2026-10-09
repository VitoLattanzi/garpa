'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function NotificacionesBell({ openModal }: { openModal: (modal: string) => void }) {
  const [count, setCount] = useState(0)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    async function fetchCount() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user.email) return

      const { count: pendingCount, error } = await supabase
        .from('invitaciones')
        .select('*', { count: 'exact', head: true })
        .eq('email_invitado', session.user.email)
        .eq('estado', 'pendiente')

      if (!error && pendingCount !== null) {
        setCount(pendingCount)
      }
    }

    fetchCount()

    // Suscripción Realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitaciones' },
        () => fetchCount()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <button 
      onClick={() => openModal('solicitudes')}
      className="relative p-2 text-muted hover:text-sec transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-negative text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  )
}