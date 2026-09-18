import Link from 'next/link'
import { Home, Users, LayoutGrid, Settings, Plus } from 'lucide-react'

type BottomNavProps = {
  onOpenModal: (modal: string) => void
}

export default function BottomNav({ onOpenModal }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex md:hidden bg-[#172130] border-t border-[#1E2D3D] h-16 items-center justify-around px-2">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#8A9BAA] hover:text-[#E8E0D5]">
        <Home size={24} />
      </Link>
      <Link href="/amigos" className="flex flex-col items-center gap-1 text-[#8A9BAA] hover:text-[#E8E0D5]">
        <Users size={24} />
      </Link>
      
      {/* Botón Central Flotante */}
      <button 
        onClick={() => onOpenModal('nuevoGasto')}
        className="relative -top-6 bg-[#3D8B7A] text-[#0F1923] p-4 rounded-full shadow-lg hover:bg-[#327365] transition"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <Link href="/grupos" className="flex flex-col items-center gap-1 text-[#8A9BAA] hover:text-[#E8E0D5]">
        <LayoutGrid size={24} />
      </Link>
      <Link href="/configuracion" className="flex flex-col items-center gap-1 text-[#8A9BAA] hover:text-[#E8E0D5]">
        <Settings size={24} />
      </Link>
    </nav>
  )
}
