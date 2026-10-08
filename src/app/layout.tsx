import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/context/LangContext'
import { ToastProvider } from '@/context/ToastContext'

/**
 * Fuente principal de la app
 * Geist es moderna, legible y perfecta para interfaces de datos
 */
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

/**
 * Metadata global de la app
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://garpa.app'),
  title: 'Garpa — Divide gastos, simplifica deudas',
  description: 'La forma más fácil de organizar gastos con amigos y grupos. Crea grupos, divide cuentas y olvídate de quién debe qué.',
  openGraph: {
    title: 'Garpa — Divide gastos, simplifica deudas',
    description: 'La forma más fácil de organizar gastos con amigos y grupos. Crea grupos, divide cuentas y olvídate de quién debe qué.',
    url: 'https://garpa.app',
    siteName: 'Garpa',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garpa — Divide gastos, simplifica deudas',
    description: 'La forma más fácil de organizar gastos con amigos y grupos.',
  },
}

/**
 * Layout raíz — envuelve TODAS las páginas de la app
 * LangProvider da acceso al contexto de idioma en toda la app
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geist.variable} font-sans antialiased bg-base text-main`}>
        <LangProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </LangProvider>
      </body>
    </html>
  )
}
