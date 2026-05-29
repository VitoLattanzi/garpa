import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

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
 * Aparece en la pestaña del navegador y en resultados de búsqueda
 */
export const metadata: Metadata = {
  title: 'Garpa — Split expenses, simplify debts',
  description: 'Dividí gastos con amigos y grupos. Sin drama.',
}

/**
 * Layout raíz — envuelve TODAS las páginas de la app
 * Todo lo que pongas acá aparece en todas las páginas
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}