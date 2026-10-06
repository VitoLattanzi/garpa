'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-base text-main">
      <h2 className="text-2xl font-bold mb-4">Ups, algo salió mal</h2>
      <p className="mb-6 opacity-80">Lo sentimos, ha ocurrido un error inesperado.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
