'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

// Tipos para los datos que traemos de la DB
type Usuario = {
  nombre: string
  email: string
}

type Grupo = {
  id: string
  nombre: string
}

type Deuda = {
  id: string
  monto: number
  saldado: boolean
  acreedor_id: string
  deudor_id: string
  gastos: {
    descripcion: string
    grupos: { nombre: string } | null
  }
  acreedor: { nombre: string }
  deudor: { nombre: string }
}

type Gasto = {
  id: string
  descripcion: string
  monto: number
  fecha: string
  pagado_por: string
  grupos: { nombre: string } | null
  pagador: { nombre: string }
}

/**
 * Dashboard principal de Garpa
 * Muestra balance real, grupos del usuario y últimos movimientos
 * Todos los datos se traen desde Supabase
 */
export default function DashboardPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [user, setUser] = useState<Usuario | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [deudas, setDeudas] = useState<Deuda[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [gruposExpanded, setGruposExpanded] = useState(true)
  const [activeModal, setActiveModal] = useState<'debo' | 'meDeban' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      // Verificamos sesión activa
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const uid = session.user.id
      setUserId(uid)

      // Traemos el perfil del usuario
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('nombre, email')
        .eq('id', uid)
        .single()
      if (perfil) setUser(perfil)

      // Traemos los grupos donde el usuario es miembro
      const { data: miembros } = await supabase
        .from('miembros_grupo')
        .select('grupos(id, nombre)')
        .eq('usuario_id', uid)
      if (miembros) {
        // Extraemos los grupos del resultado anidado
        const gruposData = miembros
          .map((m: any) => m.grupos)
          .filter(Boolean) as Grupo[]
        setGrupos(gruposData)
      }

      // Traemos las deudas del usuario (lo que debe y lo que le deben)
      const { data: deudasData } = await supabase
        .from('deudas')
        .select(`
          id, monto, saldado, acreedor_id, deudor_id,
          gastos(descripcion, grupos(nombre)),
          acreedor:usuarios!deudas_acreedor_id_fkey(nombre),
          deudor:usuarios!deudas_deudor_id_fkey(nombre)
        `)
        .or(`deudor_id.eq.${uid},acreedor_id.eq.${uid}`)
        .eq('saldado', false)
      if (deudasData) setDeudas(deudasData as any)

      // Traemos los últimos 5 gastos donde el usuario participa
      const { data: gastosData } = await supabase
        .from('participantes_gasto')
        .select(`
          gastos(
            id, descripcion, monto, fecha, pagado_por,
            grupos(nombre),
            pagador:usuarios!gastos_pagado_por_fkey(nombre)
          )
        `)
        .eq('usuario_id', uid)
        .limit(5)
      if (gastosData) {
        const gastosFlat = gastosData
          .map((p: any) => p.gastos)
          .filter(Boolean) as Gasto[]
        setGastos(gastosFlat)
      }

      setLoading(false)
    }

    cargarDatos()
  }, [])

  // Calcula el total que el usuario debe
  const totalDebo = deudas
    .filter(d => d.deudor_id === userId && !d.saldado)
    .reduce((acc, d) => acc + d.monto, 0)

  // Calcula el total que le deben al usuario
  const totalMeDeben = deudas
    .filter(d => d.acreedor_id === userId && !d.saldado)
    .reduce((acc, d) => acc + d.monto, 0)

  // Balance neto
  const balanceNeto = totalMeDeben - totalDebo

  // Deudas donde el usuario es el deudor
  const deudasQueDebo = deudas.filter(d => d.deudor_id === userId)

  // Deudas donde el usuario es el acreedor
  const deudasQueMeDeben = deudas.filter(d => d.acreedor_id === userId)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function getInitials(nombre: string) {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  function formatMonto(monto: number) {
    return `$${monto.toLocaleString('es-AR')}`
  }

  function formatFecha(fecha: string) {
    const d = new Date(fecha)
    const ahora = new Date()
    const diff = Math.floor((ahora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'hoy'
    if (diff === 1) return 'ayer'
    return `hace ${diff} días`
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`${sidebarOpen ? 'w-56' : 'w-14'} flex flex-col flex-shrink-0 transition-all duration-250 overflow-hidden`}
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--bg-border)' }}
      >
        {/* Logo + toggle */}
        <div
          className="flex items-center justify-between px-3 py-3"
          style={{ borderBottom: '1px solid var(--bg-border)' }}
        >
          {sidebarOpen && (
            <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>garpa</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition ml-auto"
            style={{ color: 'var(--text-muted)' }}
            aria-label={sidebarOpen ? 'Contraer sidebar' : 'Expandir sidebar'}
          >
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
            <span className="text-xs px-2 pb-1" style={{ color: 'var(--text-muted)' }}>Menú</span>
          )}
          {[
            { icon: '🏠', label: 'Inicio', href: '/dashboard', active: true },
            { icon: '👥', label: 'Amigos', href: '/amigos', active: false },
            { icon: '💳', label: 'Gastos', href: '/gastos', active: false },
            { icon: '⚙️', label: 'Configuración', href: '/configuracion', active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition w-full"
              style={{
                background: item.active ? 'var(--bg-border)' : 'transparent',
                color: item.active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Mis grupos — colapsable */}
        <div className="flex flex-col px-2 flex-1 overflow-hidden">
          {sidebarOpen && (
            <button
              onClick={() => setGruposExpanded(!gruposExpanded)}
              className="flex items-center justify-between px-2 pb-1 w-full text-left"
            >
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Mis grupos</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {gruposExpanded ? '▲' : '▼'}
              </span>
            </button>
          )}

          {/* Lista de grupos con scroll si hay muchos */}
          {gruposExpanded && (
            <div className="flex flex-col gap-0.5 overflow-y-auto max-h-40">
              {grupos.length === 0 && sidebarOpen && (
                <p className="text-xs px-2 py-1" style={{ color: 'var(--text-muted)' }}>
                  Sin grupos aún
                </p>
              )}
              {grupos.map((grupo) => (
                <button
                  key={grupo.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition w-full text-left"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-positive)' }} />
                  {sidebarOpen && <span className="text-sm truncate">{grupo.nombre}</span>}
                </button>
              ))}
            </div>
          )}

          {/* Siempre visible — nuevo grupo */}
          <button
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition w-full text-left mt-1"
            style={{ color: 'var(--color-accent)' }}
          >
            <span className="text-base flex-shrink-0">＋</span>
            {sidebarOpen && <span className="text-sm truncate">Nuevo grupo</span>}
          </button>
        </div>

        {/* Perfil abajo */}
        <div
          className="flex items-center gap-2.5 px-3 py-3 cursor-pointer transition"
          style={{ borderTop: '1px solid var(--bg-border)' }}
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
            style={{ background: 'var(--bg-border)', color: 'var(--color-positive)' }}
          >
            {user ? getInitials(user.nombre) : '??'}
          </div>
          {sidebarOpen && user && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.nombre}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="flex-1 overflow-y-auto p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Buen día{user ? `, ${user.nombre.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {deudasQueDebo.length > 0
              ? `${deudasQueDebo.length} deuda${deudasQueDebo.length > 1 ? 's' : ''} pendiente${deudasQueDebo.length > 1 ? 's' : ''}`
              : 'Todo al día 🎉'
            }
          </p>
        </div>

        {/* ===== CARDS DE BALANCE ===== */}
        <div className="grid grid-cols-3 gap-3 mb-6">

          {/* Lo que debés */}
          <button
            onClick={() => setActiveModal('debo')}
            className="rounded-xl p-4 text-left transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Lo que debés</p>
            <p className="text-2xl font-medium" style={{ color: 'var(--color-negative)' }}>
              {formatMonto(totalDebo)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {deudasQueDebo.length} deuda{deudasQueDebo.length !== 1 ? 's' : ''}
            </p>
          </button>

          {/* Te deben */}
          <button
            onClick={() => setActiveModal('meDeban')}
            className="rounded-xl p-4 text-left transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Te deben</p>
            <p className="text-2xl font-medium" style={{ color: 'var(--color-positive)' }}>
              {formatMonto(totalMeDeben)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {deudasQueMeDeben.length} persona{deudasQueMeDeben.length !== 1 ? 's' : ''}
            </p>
          </button>

          {/* Balance neto */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Balance neto</p>
            <p
              className="text-2xl font-medium"
              style={{ color: balanceNeto >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
            >
              {balanceNeto >= 0 ? '+' : ''}{formatMonto(balanceNeto)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>general</p>
          </div>

        </div>

        {/* ===== ÚLTIMOS MOVIMIENTOS ===== */}
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Últimos movimientos
        </h2>
        <div className="flex flex-col gap-2">
          {gastos.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Todavía no hay gastos registrados.
            </p>
          )}
          {gastos.map((gasto) => {
            const yoPague = gasto.pagado_por === userId
            return (
              <div
                key={gasto.id}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'var(--bg-border)' }}
                >
                  💳
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {gasto.descripcion}
                    {gasto.grupos && (
                      <span style={{ color: 'var(--text-muted)' }}> · {gasto.grupos.nombre}</span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {yoPague ? 'Pagaste vos' : `Pagó ${gasto.pagador?.nombre}`} · {formatFecha(gasto.fecha)}
                  </p>
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: yoPague ? 'var(--color-positive)' : 'var(--color-negative)' }}
                >
                  {yoPague ? '+' : '-'}{formatMonto(gasto.monto)}
                </span>
              </div>
            )
          })}
        </div>

      </main>

      {/* ===== MODAL — Lo que debés ===== */}
      {activeModal === 'debo' && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm mx-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Lo que debés</h3>
              <button onClick={() => setActiveModal(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            {deudasQueDebo.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No debés nada 🎉</p>
            )}
            <div className="flex flex-col gap-3">
              {deudasQueDebo.map((deuda) => (
                <div
                  key={deuda.id}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--bg-border)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {deuda.acreedor?.nombre}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {deuda.gastos?.descripcion}
                      {deuda.gastos?.grupos && ` · ${deuda.gastos.grupos.nombre}`}
                    </p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-negative)' }}>
                    {formatMonto(deuda.monto)}
                  </span>
                </div>
              ))}
            </div>
            {deudasQueDebo.length > 0 && (
              <p className="text-xs text-right mt-4" style={{ color: 'var(--text-muted)' }}>
                Total: {formatMonto(totalDebo)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL — Te deben ===== */}
      {activeModal === 'meDeban' && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm mx-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Te deben</h3>
              <button onClick={() => setActiveModal(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            {deudasQueMeDeben.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nadie te debe nada.</p>
            )}
            <div className="flex flex-col gap-3">
              {deudasQueMeDeben.map((deuda) => (
                <div
                  key={deuda.id}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--bg-border)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {deuda.deudor?.nombre}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {deuda.gastos?.descripcion}
                      {deuda.gastos?.grupos && ` · ${deuda.gastos.grupos.nombre}`}
                    </p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-positive)' }}>
                    {formatMonto(deuda.monto)}
                  </span>
                </div>
              ))}
            </div>
            {deudasQueMeDeben.length > 0 && (
              <p className="text-xs text-right mt-4" style={{ color: 'var(--text-muted)' }}>
                Total: {formatMonto(totalMeDeben)}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  )
}