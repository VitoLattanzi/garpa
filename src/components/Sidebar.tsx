import Link from 'next/link'
import { useLang } from '@/context/LangContext'

type SidebarProps = {
  isDemo: boolean
  user: any
  grupos: any[]
  onOpenModal: (modalName: string) => void
} 

export default function Sidebar({ isDemo, user, grupos, onOpenModal }: SidebarProps) {
  const { t, lang } = useLang()

  return (
    <aside className="hidden md:flex w-64 h-screen bg-[#172130] border-r border-[#1E2D3D] flex-col flex-shrink-0">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center p-6 h-16">
          <Link href={isDemo ? '/' : '/dashboard'} className="text-base font-bold text-[#E8E0D5]">
            GARPA
          </Link>
        </div>

        {/* Menú */}
        <nav className="flex flex-col gap-0.5 px-4 py-3 flex-grow">
          <span className="text-xs text-[#4A6A7A] px-2 pb-1">{t('dash_menu')}</span>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-[#8A9BAA] hover:text-[#E8E0D5] hover:bg-[#1E2D3D] rounded-lg">
            <span>🏠</span>
            <span>{t('dash_home')}</span>
          </Link>
          <Link href="/amigos" className="flex items-center gap-3 px-3 py-2 text-[#8A9BAA] hover:text-[#E8E0D5] hover:bg-[#1E2D3D] rounded-lg">
            <span>👥</span>
            <span>{t('dash_friends')}</span>
          </Link>
          <Link href="/gastos" className="flex items-center gap-3 px-3 py-2 text-[#8A9BAA] hover:text-[#E8E0D5] hover:bg-[#1E2D3D] rounded-lg">
            <span>💳</span>
            <span>{t('dash_expenses')}</span>
          </Link>
        </nav>

        {/* Grupos */}
        <div className="px-4 pb-4">
          <span className="text-xs text-[#4A6A7A] px-2 py-2 block">{t('dash_groups')}</span>
          <div className="flex flex-col gap-1">
            {grupos.map(g => (
              <Link key={g.id} href={`/grupos/${g.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-[#8A9BAA] hover:text-[#E8E0D5] hover:bg-[#1E2D3D] rounded-lg truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color || '#4A6A7A' }} />
                <span className="truncate">{g.nombre}</span>
              </Link>
            ))}
            <button 
              onClick={() => onOpenModal('nuevoGrupo')}
              className="px-3 py-2 text-sm text-[#3D8B7A] hover:text-[#E8E0D5] hover:bg-[#1E2D3D] rounded-lg text-left"
            >
              + {t('dash_new_group')}
            </button>
            <button 
              onClick={() => onOpenModal('agregarAmigo')}
              className="px-3 py-2 text-sm text-[#3D8B7A] hover:text-[#E8E0D5] hover:bg-[#1E2D3D] rounded-lg text-left"
            >
              + {lang === 'es' ? 'Agregar amigo' : 'Add friend'}
            </button>
          </div>
        </div>

        {/* Perfil */}
        <div className="p-4 border-t border-[#1E2D3D]">
          <Link href="/configuracion" className="flex items-center gap-3 text-[#8A9BAA] hover:text-[#E8E0D5]">
            <span>⚙️</span>
            <span>{lang === 'es' ? 'Configuración' : 'Settings'}</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
