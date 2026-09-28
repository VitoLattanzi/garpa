import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const IDLE_TIMEOUT = 15 * 60 * 1000 // 15 minutos

export function useIdleLogout() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    let timer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
      }, IDLE_TIMEOUT)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer))
      clearTimeout(timer)
    }
  }, [router, supabase])
}
