'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

/**
 * Página principal del dashboard
 * Muestra el balance general, últimos movimientos y grupos del usuario
 */
export default function DashboardPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [user, setUser] = useState<{ nombre: string; email: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeModal, setActiveModal] = useState<'debo' | 'meDeban' | null>(null)

  // Obtiene el perfil del usuario logueado
  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const { data } = await supabase
        .from('usuarios')
        .select('nombre, email')
        .eq('id', session.user.id)
        .single()

      if (data) setUser(data)
    }
    getUser()
  }, [])

  // Cierra el modal al hacer click fuera
  function handleBackdropClick() {
    setActiveModal(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Iniciales para el avatar
  function getInitials(nombre: string) {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ===== SIDEBAR ===== */}
      <aside className={`
        ${sidebarOpen ? 'w-56' : 'w-14'}
        flex flex-col bg-white border-r border-gray-100
        transition-all duration-250 overflow-hidden flex-shrink-0
      `}>

        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
          {sidebarOpen && (
            <span className="text-base font-medium text-gray-900">garpa</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-50 transition ml-auto"
            aria-label={sidebarOpen ? 'Contraer sidebar' : 'Expandir sidebar'}
          >
            {/* Ícono de toggle */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarOpen
                ? <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                : <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              }
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-0.5 px-2 py-3">
          {sidebarOpen && (
            <span className="text-xs text-gray-400 px-2 pb-1">Menú</span>
          )}
          {[
            { icon: '🏠', label: 'Inicio', active: true },
            { icon: '👥', label: 'Amigos', active: false },
            { icon: '💳', label: 'Gastos', active: false },
            { icon: '⚙️', label: 'Configuración', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition w-full text-left
                ${item.active
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Mis grupos */}
        <div className="flex flex-col gap-0.5 px-2 flex-1">
          {sidebarOpen && (
            <span className="text-xs text-gray-400 px-2 pb-1">Mis grupos</span>
          )}

          {/* Grupos del usuario — hardcodeados por ahora, luego se conectan a la DB */}
          {[
            { nombre: 'Viaje a Brasil', color: '#7F77DD' },
            { nombre: 'Casa compartida', color: '#1D9E75' },
            { nombre: 'Salidas', color: '#EF9F27' },
          ].map((grupo) => (
            <button
              key={grupo.nombre}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition w-full text-left"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: grupo.color }}
              />
              {sidebarOpen && (
                <span className="text-sm text-gray-500 truncate">{grupo.nombre}</span>
              )}
            </button>
          ))}

          {/* Siempre visible — agregar grupo */}
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition w-full text-left text-gray-400 hover:text-gray-600 mt-1">
            <span className="text-base flex-shrink-0">＋</span>
            {sidebarOpen && <span className="text-sm truncate">Nuevo grupo</span>}
          </button>
        </div>

        {/* Perfil abajo */}
        <div
          className="flex items-center gap-2.5 px-3 py-3 border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600 flex-shrink-0">
            {user ? getInitials(user.nombre) : '??'}
          </div>
          {sidebarOpen && user && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.nombre}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
        </div>

      </aside>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="flex-1 overflow-y-auto p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-medium text-gray-900">
            Buen día{user ? `, ${user.nombre.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-sm text-gray-400">3 deudas pendientes</p>
        </div>

        {/* ===== CARDS DE BALANCE ===== */}
        <div className="grid grid-cols-3 gap-3 mb-6">

          {/* Lo que debés */}
          <button
            onClick={() => setActiveModal('debo')}
            className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-gray-200 transition"
          >
            <p className="text-xs text-gray-400 mb-1">Lo que debés</p>
            <p className="text-2xl font-medium text-red-500">$12.400</p>
            <p className="text-xs text-gray-400 mt-1">en 2 grupos</p>
          </button>

          {/* Te deben */}
          <button
            onClick={() => setActiveModal('meDeban')}
            className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-gray-200 transition"
          >
            <p className="text-xs text-gray-400 mb-1">Te deben</p>
            <p className="text-2xl font-medium text-green-500">$8.750</p>
            <p className="text-xs text-gray-400 mt-1">3 personas</p>
          </button>

          {/* Balance neto */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Balance neto</p>
            <p className="text-2xl font-medium text-gray-900">-$3.650</p>
            <p className="text-xs text-gray-400 mt-1">este mes</p>
          </div>

        </div>

        {/* ===== ÚLTIMOS MOVIMIENTOS ===== */}
        <h2 className="text-sm font-medium text-gray-900 mb-3">Últimos movimientos</h2>
        <div className="flex flex-col gap-2">
          {[
            { icon: '✈️', titulo: 'Hotel Brasil', grupo: 'Viaje a Brasil', quien: 'Pagó Juan', hace: 'hace 2 días', monto: '-$4.200', neg: true },
            { icon: '🛒', titulo: 'Supermercado', grupo: 'Casa compartida', quien: 'Pagaste vos', hace: 'hace 3 días', monto: '+$3.100', neg: false },
            { icon: '🍻', titulo: 'Bar El Federal', grupo: 'Salidas', quien: 'Pagó María', hace: 'hace 5 días', monto: '-$1.800', neg: true },
          ].map((item) => (
            <div
              key={item.titulo}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-lg flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{item.titulo} · {item.grupo}</p>
                <p className="text-xs text-gray-400">{item.quien} · {item.hace}</p>
              </div>
              <span className={`text-sm font-medium ${item.neg ? 'text-red-500' : 'text-green-500'}`}>
                {item.monto}
              </span>
            </div>
          ))}
        </div>

      </main>

      {/* ===== MODAL — Lo que debés ===== */}
      {activeModal === 'debo' && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">Lo que debés</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { nombre: 'Juan García', grupo: 'Viaje a Brasil', monto: '$4.200' },
                { nombre: 'María López', grupo: 'Salidas', monto: '$8.200' },
              ].map((deuda) => (
                <div key={deuda.nombre} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deuda.nombre}</p>
                    <p className="text-xs text-gray-400">{deuda.grupo}</p>
                  </div>
                  <span className="text-sm font-medium text-red-500">{deuda.monto}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-right mt-4">Total: $12.400</p>
          </div>
        </div>
      )}

      {/* ===== MODAL — Te deben ===== */}
      {activeModal === 'meDeban' && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">Te deben</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { nombre: 'Carlos Ruiz', grupo: 'Casa compartida', monto: '$3.100' },
                { nombre: 'Ana Martínez', grupo: 'Viaje a Brasil', monto: '$2.650' },
                { nombre: 'Pedro Silva', grupo: 'Salidas', monto: '$3.000' },
              ].map((deuda) => (
                <div key={deuda.nombre} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deuda.nombre}</p>
                    <p className="text-xs text-gray-400">{deuda.grupo}</p>
                  </div>
                  <span className="text-sm font-medium text-green-500">{deuda.monto}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-right mt-4">Total: $8.750</p>
          </div>
        </div>
      )}

    </div>
  )
}