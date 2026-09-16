import type { Metadata } from 'next'
import AuthRightPanel from '@/components/AuthRightPanel'

export const metadata: Metadata = {
  title: 'Garpa — Autenticación',
}

/**
 * Layout compartido para login y register
 * Server Component que mantiene la metadata y delega el panel interactivo a AuthRightPanel
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen overflow-hidden flex">
      {/* Panel izquierdo — formulario */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Panel derecho — visual con LangContext */}
      <AuthRightPanel />
    </div>
  )
}
