'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'

type SidebarProps = {
  isDemo: boolean
  user: any
  grupos: any[]
  onToggle: () => void
  isOpen: boolean
}

export default function Sidebar({ isDemo, user, grupos, onToggle, isOpen }: SidebarProps) {
  const { t, lang } = useLang()

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className='fixed inset-0 bg-black/50 z-40 md:hidden' 
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={
        fixed md:relative z-50 h-full bg-[#172130] border-r border-[#1E2D3D] transition-all duration-300
        
        
      }>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 h-16'>
            {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
              <Link href={isDemo ? '/' : '/dashboard'} className='text-base font-bold text-[#E8E0D5]'>
                GARPA
              </Link>
            )}
            <button onClick={onToggle} className='p-2 text-[#4A6A7A] hover:text-[#8A9BAA]'>
              {isOpen ? '?' : '?'}
            </button>
          </div>

          {/* Menú */}
          <nav className='flex flex-col gap-0.5 px-2 py-3 flex-grow'>
            {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                <span className='text-xs text-[#4A6A7A] px-2 pb-1'>{t('dash_menu')}</span>
            )}
            <Link href='/dashboard' className='flex items-center gap-3 px-2 py-2 text-[#8A9BAA] hover:text-[#E8E0D5] hover:bg-[#1E2D3D] rounded-lg'>
                <span>??</span>
                {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && <span>{t('dash_resumen')}</span>}
            </Link>
          </nav>

          {/* Grupos */}
          <div className='px-2 pb-4'>
             {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                <span className='text-xs text-[#4A6A7A] px-2 py-2 block'>{lang === 'es' ? 'Grupos' : 'Groups'}</span>
             )}
             <div className='flex flex-col gap-1'>
                {grupos.map(g => (
                    <Link key={g.id} href={/grupos/} className='px-2 py-2 text-sm text-[#8A9BAA] hover:text-[#E8E0D5] truncate'>
                        {g.nombre}
                    </Link>
                ))}
             </div>
          </div>

          {/* Perfil */}
          <div className='p-4 border-t border-[#1E2D3D]'>
            <Link href='/configuracion' className='flex items-center gap-3 text-[#8A9BAA] hover:text-[#E8E0D5]'>
                <span>??</span>
                {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && <span>{lang === 'es' ? 'Configuración' : 'Settings'}</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
