import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/context/LangContext'

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
  title: 'Garpa — Split expenses, simplify debts',
  description: 'Dividí gastos con amigos y grupos. Sin drama.',
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
      <body className={`${geist.variable} font-sans antialiased`}>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  )
}