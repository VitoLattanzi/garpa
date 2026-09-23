'use client'

import { useState, createContext, useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'
import ModalNuevoGrupo from '@/components/ModalNuevoGrupo'
import ModalNuevoGasto from '@/components/ModalNuevoGasto'
import ModalAgregarAmigo from '@/components/ModalAgregarAmigo'
import { Grupo, Amigo, Deuda } from '@/types/garpa'
import { useLang } from '@/context/LangContext'

const DashboardContext = createContext<{ 
  openModal: (modal: string) => void,
  activeModal: string | null,
  setActiveModal: (modal: string | null) => void
} | null>(null)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) throw new Error('useDashboard must be used within DashboardProvider')
  return context
}

type DashboardLayoutProps = {
  children: React.ReactNode
  isDemo: boolean
  user: any
  userId: string | null
  grupos: Grupo[]
  amigos: Amigo[]
  onRefreshData?: () => void
  onAmigoAdded?: (amigo: any) => void
  onGrupoCreated?: (grupo: Grupo) => void
  deudas?: Deuda[]
  onSaldarDeuda?: (id: string) => void
  totalDebo?: number
  totalMeDeben?: number
}

export default function DashboardLayout({ 
  children, 
  isDemo, 
  user, 
  userId, 
  grupos, 
  amigos,
  onRefreshData,
  onAmigoAdded,
  onGrupoCreated,
  deudas = [],
  onSaldarDeuda,
  totalDebo = 0,
  totalMeDeben = 0
}: DashboardLayoutProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const { t, lang } = useLang()
  
  const openModal = (modal: string) => setActiveModal(modal)

  const deudasQueDebo = deudas.filter(d => d.deudor_id === userId)
  const deudasQueMeDeben = deudas.filter(d => d.acreedor_id === userId)
  const formatMonto = (monto: number) => `$${monto.toLocaleString('es-AR')}`

  return (
    <DashboardContext.Provider value={{ openModal, activeModal, setActiveModal }}>
      <div className="flex h-screen overflow-hidden bg-[#0F1923]">
        {/* Sidebar Desktop */}
        <Sidebar 
          isDemo={isDemo}
          user={user}
          grupos={grupos}
          onOpenModal={openModal}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center px-6 h-16 bg-[#172130] border-b border-[#1E2D3D]">
            <Link href={isDemo ? '/' : '/dashboard'} className="flex items-center">
              <Image src="/logo-garpa.svg" alt="GARPA" width={100} height={32} className="object-contain" />
            </Link>
          </header>

          <main className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${isDemo ? 'mt-8' : ''}`}>
            {children}
          </main>
        </div>

        {/* Bottom Navigation Mobile */}
        <BottomNav onOpenModal={openModal} />

        {/* Global Modals */}
        {activeModal === 'nuevoGrupo' && userId && (
          <ModalNuevoGrupo 
            onClose={() => setActiveModal(null)} 
            onCreated={onGrupoCreated || (() => {})} 
            amigos={amigos} 
            userId={userId} 
            isDemo={isDemo} 
          />
        )}
        {activeModal === 'nuevoGasto' && userId && (
          <ModalNuevoGasto 
            onClose={() => setActiveModal(null)} 
            onCreated={onRefreshData || (() => {})} 
            grupos={grupos} 
            amigos={amigos} 
            userId={userId} 
            isDemo={isDemo} 
          />
        )}
        {activeModal === 'agregarAmigo' && userId && (
          <ModalAgregarAmigo 
            onClose={() => setActiveModal(null)} 
            onAdded={onAmigoAdded || (() => {})} 
            userId={userId} 
            isDemo={isDemo} 
          />
        )}

        {/* Dashboard Specific Modals */}
        {activeModal === 'debo' && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60" onClick={() => setActiveModal(null)}>
            <div className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-[#E8E0D5]">{t('modal_owe_title')}</h3>
                <button onClick={() => setActiveModal(null)} className="text-[#4A6A7A] hover:text-[#8A9BAA]">✕</button>
              </div>
              {deudasQueDebo.length === 0 && <p className="text-sm text-[#4A6A7A]">{t('modal_no_debts')}</p>}
              <div className="flex flex-col gap-3">
                {deudasQueDebo.map(deuda => (
                  <div key={deuda.id} className="flex items-center justify-between py-2 border-b border-[#1E2D3D]">
                    <div>
                      <p className="text-sm font-medium text-[#E8E0D5]">{deuda.acreedor?.nombre}</p>
                      <p className="text-xs text-[#4A6A7A]">{deuda.gastos?.descripcion}{deuda.gastos?.grupos && ` · ${deuda.gastos.grupos.nombre}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#C0675A]">{formatMonto(deuda.monto)}</span>
                      <button onClick={() => onSaldarDeuda?.(deuda.id)} className="text-xs border border-[#1E2D3D] text-[#4A6A7A] hover:text-[#3D8B7A] hover:border-[#3D8B7A] px-2 py-0.5 rounded-lg transition">
                        {lang === 'es' ? 'Saldar' : 'Settle'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {deudasQueDebo.length > 0 && <p className="text-xs text-right mt-4 text-[#4A6A7A]">{t('modal_total')}: {formatMonto(totalDebo)}</p>}
            </div>
          </div>
        )}
        {activeModal === 'meDeban' && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60" onClick={() => setActiveModal(null)}>
            <div className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-[#E8E0D5]">{t('modal_owed_title')}</h3>
                <button onClick={() => setActiveModal(null)} className="text-[#4A6A7A] hover:text-[#8A9BAA]">✕</button>
              </div>
              {deudasQueMeDeben.length === 0 && <p className="text-sm text-[#4A6A7A]">{t('modal_nobody_owes')}</p>}
              <div className="flex flex-col gap-3">
                {deudasQueMeDeben.map(deuda => (
                  <div key={deuda.id} className="flex items-center justify-between py-2 border-b border-[#1E2D3D]">
                    <div>
                      <p className="text-sm font-medium text-[#E8E0D5]">{deuda.deudor?.nombre}</p>
                      <p className="text-xs text-[#4A6A7A]">{deuda.gastos?.descripcion}{deuda.gastos?.grupos && ` · ${deuda.gastos.grupos.nombre}`}</p>
                    </div>
                    <span className="text-sm font-medium text-[#3D8B7A]">{formatMonto(deuda.monto)}</span>
                  </div>
                ))}
              </div>
              {deudasQueMeDeben.length > 0 && <p className="text-xs text-right mt-4 text-[#4A6A7A]">{t('modal_total')}: {formatMonto(totalMeDeben)}</p>}
            </div>
          </div>
        )}
      </div>
    </DashboardContext.Provider>
  )
}
