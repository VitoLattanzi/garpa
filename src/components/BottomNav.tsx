import Link from 'next/link'
import { Home, Users, LayoutGrid, Settings, Plus } from 'lucide-react'

type BottomNavProps = {
  onOpenModal: (modal: string) => void
}

export default function BottomNav({ onOpenModal }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex md:hidden bg-background-card border-t border-background-border h-16 items-center justify-around px-2">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-text-secondary hover:text-text-primary">
        <Home size={24} />
      </Link>
      <Link href="/amigos" className="flex flex-col items-center gap-1 text-text-secondary hover:text-text-primary">
        <Users size={24} />
      </Link>
      
      {/* Botón Central Flotante */}
      <button 
        onClick={() => onOpenModal('nuevoGasto')}
        className="relative -top-6 bg-positive text-background-base p-4 rounded-full shadow-lg hover:bg-positive/90 transition"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <Link href="/grupos" className="flex flex-col items-center gap-1 text-text-secondary hover:text-text-primary">
        <LayoutGrid size={24} />
      </Link>
      <Link href="/configuracion" className="flex flex-col items-center gap-1 text-text-secondary hover:text-text-primary">
        <Settings size={24} />
      </Link>
    </nav>

  )
}
