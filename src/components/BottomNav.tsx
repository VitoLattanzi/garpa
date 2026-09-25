import Link from 'next/link'
import { Home, Users, LayoutGrid, Settings, Plus } from 'lucide-react'

type BottomNavProps = {
  onOpenModal: (modal: string) => void
}

export default function BottomNav({ onOpenModal }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex md:hidden bg-card border-t border-border h-16 items-center justify-around px-2">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-sec hover:text-main">
        <Home size={24} />
      </Link>
      <Link href="/amigos" className="flex flex-col items-center gap-1 text-sec hover:text-main">
        <Users size={24} />
      </Link>
      
      {/* Botón Central Flotante */}
      <button 
        onClick={() => onOpenModal('nuevoGasto')}
        className="relative -top-6 bg-positive text-background-base p-4 rounded-full shadow-lg hover:bg-positive/90 transition"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-sec hover:text-main">
        <LayoutGrid size={24} />
      </Link>
      <Link href="/configuracion" className="flex flex-col items-center gap-1 text-sec hover:text-main">
        <Settings size={24} />
      </Link>
    </nav>

  )
}

