'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useLang } from '@/context/LangContext'
import { Grupo, Deuda, Gasto, Amigo } from '@/types/garpa'
import ModalNuevoGrupo from '@/components/ModalNuevoGrupo'
import ModalNuevoGasto from '@/components/ModalNuevoGasto'
import ModalAgregarAmigo from '@/components/ModalAgregarAmigo'

const DEMO_USER_ID = 'demo-user'
const DEMO_GRUPOS: Grupo[] = [
  { id: '1', nombre: 'Viaje a Brasil' },
  { id: '2', nombre: 'Casa compartida' },
  { id: '3', nombre: 'Salidas' },
]
const DEMO_AMIGOS: Amigo[] = [
  { id: 'a1', usuario_id: DEMO_USER_ID, amigo_id: 'juan', estado: 'activo', perfil: { nombre: 'Juan García', email: 'juan@demo.com' } },
  { id: 'a2', usuario_id: DEMO_USER_ID, amigo_id: 'maria', estado: 'activo', perfil: { nombre: 'María López', email: 'maria@demo.com' } },
  { id: 'a3', usuario_id: DEMO_USER_ID, amigo_id: 'carlos', estado: 'activo', perfil: { nombre: 'Carlos Ruiz', email: 'carlos@demo.com' } },
]
const DEMO_DEUDAS_INICIALES: Deuda[] = [
  { id: '1', monto: 4200, saldado: false, acreedor_id: 'juan', deudor_id: DEMO_USER_ID, gastos: { descripcion: 'Hotel Brasil', grupos: { nombre: 'Viaje a Brasil' } }, acreedor: { nombre: 'Juan García' }, deudor: { nombre: 'Usuario Demo' } },
  { id: '2', monto: 1800, saldado: false, acreedor_id: 'maria', deudor_id: DEMO_USER_ID, gastos: { descripcion: 'Bar El Federal', grupos: { nombre: 'Salidas' } }, acreedor: { nombre: 'María López' }, deudor: { nombre: 'Usuario Demo' } },
  { id: '3', monto: 3100, saldado: false, acreedor_id: DEMO_USER_ID, deudor_id: 'carlos', gastos: { descripcion: 'Supermercado', grupos: { nombre: 'Casa compartida' } }, acreedor: { nombre: 'Usuario Demo' }, deudor: { nombre: 'Carlos Ruiz' } },
  { id: '4', monto: 2650, saldado: false, acreedor_id: DEMO_USER_ID, deudor_id: 'ana', gastos: { descripcion: 'Vuelo ida y vuelta', grupos: { nombre: 'Viaje a Brasil' } }, acreedor: { nombre: 'Usuario Demo' }, deudor: { nombre: 'Ana Martínez' } },
]
const DEMO_GASTOS_INICIALES: Gasto[] = [
  { id: '1', descripcion: 'Hotel Brasil', monto: 16800, fecha: new Date(Date.now() - 2 * 86400000).toISOString(), pagado_por: 'juan', grupo_id: '1', grupos: { nombre: 'Viaje a Brasil' }, pagador: { nombre: 'Juan García' } },
  { id: '2', descripcion: 'Supermercado', monto: 9300, fecha: new Date(Date.now() - 3 * 86400000).toISOString(), pagado_por: DEMO_USER_ID, grupo_id: '2', grupos: { nombre: 'Casa compartida' }, pagador: { nombre: 'Usuario Demo' } },
  { id: '3', descripcion: 'Bar El Federal', monto: 5400, fecha: new Date(Date.now() - 5 * 86400000).toISOString(), pagado_por: 'maria', grupo_id: '3', grupos: { nombre: 'Salidas' }, pagador: { nombre: 'María López' } },
]

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { t, lang, setLang } = useLang()

  const [user, setUser] = useState<{ nombre: string; email: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [deudas, setDeudas] = useState<Deuda[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [amigos, setAmigos] = useState<Amigo[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [gruposExpanded, setGruposExpanded] = useState(true)
  const [activeModal, setActiveModal] = useState<'debo' | 'meDeban' | 'nuevoGrupo' | 'nuevoGasto' | 'agregarAmigo' | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    async function cargarDatos() {
      const demoActivo = document.cookie.includes('garpa-demo=true')
      setIsDemo(demoActivo)

      if (demoActivo) {
        setUser({ nombre: 'Usuario Demo', email: 'demo@garpa.app' })
        setUserId(DEMO_USER_ID)
        setAmigos(DEMO_AMIGOS)
        const gruposGuardados = sessionStorage.getItem('demo-grupos')
        setGrupos(gruposGuardados ? [...DEMO_GRUPOS, ...JSON.parse(gruposGuardados)] : DEMO_GRUPOS)
        const deudasGuardadas = sessionStorage.getItem('demo-deudas')
        setDeudas(deudasGuardadas ? [...DEMO_DEUDAS_INICIALES, ...JSON.parse(deudasGuardadas)] : DEMO_DEUDAS_INICIALES)
        const gastosGuardados = sessionStorage.getItem('demo-gastos')
        setGastos(gastosGuardados ? [...JSON.parse(gastosGuardados), ...DEMO_GASTOS_INICIALES] : DEMO_GASTOS_INICIALES)
        setLoading(false)
        return
      }

      // Modo real
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')
      const uid = session.user.id
      setUserId(uid)

      // Perfil
      const { data: perfil } = await supabase
        .from('usuarios').select('nombre, email').eq('id', uid).single()
      if (perfil) setUser(perfil)

      // Amigos
      const { data: amistadesData } = await supabase
        .from('amistades')
        .select('id, usuario_id, amigo_id, estado, perfil:usuarios!amistades_amigo_id_fkey(nombre, email)')
        .eq('usuario_id', uid).eq('estado', 'activo')
      if (amistadesData) setAmigos(amistadesData as any)

      // Grupos — query simplificada sin joins
      const { data: miembrosData } = await supabase
        .from('miembros_grupo').select('grupo_id').eq('usuario_id', uid)
      if (miembrosData && miembrosData.length > 0) {
        const grupoIds = miembrosData.map((m: any) => m.grupo_id)
        const { data: gruposData } = await supabase
          .from('grupos').select('id, nombre').in('id', grupoIds)
        if (gruposData) setGrupos(gruposData)
      }

      // Deudas — queries separadas en lugar de joins anidados
      const { data: deudasData } = await supabase
        .from('deudas')
        .select('id, monto, saldado, acreedor_id, deudor_id, gasto_id, grupo_id')
        .or(`deudor_id.eq.${uid},acreedor_id.eq.${uid}`)
        .eq('saldado', false)

      if (deudasData && deudasData.length > 0) {
        const userIds = [...new Set([
          ...deudasData.map((d: any) => d.acreedor_id),
          ...deudasData.map((d: any) => d.deudor_id),
        ])]
        const { data: usuariosData } = await supabase
          .from('usuarios').select('id, nombre').in('id', userIds)

        const gastoIds = deudasData.map((d: any) => d.gasto_id).filter(Boolean)
        const { data: gastosRef } = gastoIds.length > 0
          ? await supabase.from('gastos').select('id, descripcion, grupo_id').in('id', gastoIds)
          : { data: [] }

        const grupoIdsDeudas = (gastosRef ?? []).map((g: any) => g.grupo_id).filter(Boolean)
        const { data: gruposRef } = grupoIdsDeudas.length > 0
          ? await supabase.from('grupos').select('id, nombre').in('id', grupoIdsDeudas)
          : { data: [] }

        const deudasEnsambladas = deudasData.map((d: any) => ({
          ...d,
          acreedor: { nombre: usuariosData?.find((u: any) => u.id === d.acreedor_id)?.nombre ?? '' },
          deudor: { nombre: usuariosData?.find((u: any) => u.id === d.deudor_id)?.nombre ?? '' },
          gastos: {
            descripcion: gastosRef?.find((g: any) => g.id === d.gasto_id)?.descripcion ?? '',
            grupos: (() => {
              const gasto = gastosRef?.find((g: any) => g.id === d.gasto_id)
              const grupo = gruposRef?.find((g: any) => g.id === gasto?.grupo_id)
              return grupo ? { nombre: grupo.nombre } : null
            })(),
          },
        }))
        setDeudas(deudasEnsambladas as any)
      }

      // Gastos recientes — queries separadas
      const { data: partData } = await supabase
        .from('participantes_gasto').select('gasto_id').eq('usuario_id', uid).limit(5)

      if (partData && partData.length > 0) {
        const gastoIds = partData.map((p: any) => p.gasto_id)
        const { data: gastosData } = await supabase
          .from('gastos')
          .select('id, descripcion, monto, fecha, pagado_por, grupo_id')
          .in('id', gastoIds)
          .order('fecha', { ascending: false })

        if (gastosData) {
          const pagadorIds = [...new Set(gastosData.map((g: any) => g.pagado_por))]
          const { data: pagadoresData } = await supabase
            .from('usuarios').select('id, nombre').in('id', pagadorIds)

          const grupoIdsGastos = gastosData.map((g: any) => g.grupo_id).filter(Boolean)
          const { data: gruposGastos } = grupoIdsGastos.length > 0
            ? await supabase.from('grupos').select('id, nombre').in('id', grupoIdsGastos)
            : { data: [] }

          const gastosEnsamblados = gastosData.map((g: any) => ({
            ...g,
            pagador: { nombre: pagadoresData?.find((p: any) => p.id === g.pagado_por)?.nombre ?? '' },
            grupos: gruposGastos?.find((gr: any) => gr.id === g.grupo_id) ?? null,
          }))
          setGastos(gastosEnsamblados as any)
        }
      }

      setLoading(false)
    }

    cargarDatos()
  }, [])

  async function recargar() {
    if (isDemo) {
      const gruposGuardados = sessionStorage.getItem('demo-grupos')
      setGrupos(gruposGuardados ? [...DEMO_GRUPOS, ...JSON.parse(gruposGuardados)] : DEMO_GRUPOS)
      const deudasGuardadas = sessionStorage.getItem('demo-deudas')
      setDeudas(deudasGuardadas ? [...DEMO_DEUDAS_INICIALES, ...JSON.parse(deudasGuardadas)] : DEMO_DEUDAS_INICIALES)
      const gastosGuardados = sessionStorage.getItem('demo-gastos')
      setGastos(gastosGuardados ? [...JSON.parse(gastosGuardados), ...DEMO_GASTOS_INICIALES] : DEMO_GASTOS_INICIALES)
      setActiveModal(null)
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const uid = session.user.id

    const { data: deudasData } = await supabase
      .from('deudas')
      .select('id, monto, saldado, acreedor_id, deudor_id, gasto_id, grupo_id')
      .or(`deudor_id.eq.${uid},acreedor_id.eq.${uid}`)
      .eq('saldado', false)

    if (deudasData && deudasData.length > 0) {
      const userIds = [...new Set([...deudasData.map((d: any) => d.acreedor_id), ...deudasData.map((d: any) => d.deudor_id)])]
      const { data: usuariosData } = await supabase.from('usuarios').select('id, nombre').in('id', userIds)
      const gastoIds = deudasData.map((d: any) => d.gasto_id).filter(Boolean)
      const { data: gastosRef } = gastoIds.length > 0 ? await supabase.from('gastos').select('id, descripcion, grupo_id').in('id', gastoIds) : { data: [] }
      const grupoIdsDeudas = (gastosRef ?? []).map((g: any) => g.grupo_id).filter(Boolean)
      const { data: gruposRef } = grupoIdsDeudas.length > 0 ? await supabase.from('grupos').select('id, nombre').in('id', grupoIdsDeudas) : { data: [] }
      setDeudas(deudasData.map((d: any) => ({
        ...d,
        acreedor: { nombre: usuariosData?.find((u: any) => u.id === d.acreedor_id)?.nombre ?? '' },
        deudor: { nombre: usuariosData?.find((u: any) => u.id === d.deudor_id)?.nombre ?? '' },
        gastos: {
          descripcion: gastosRef?.find((g: any) => g.id === d.gasto_id)?.descripcion ?? '',
          grupos: (() => { const gasto = gastosRef?.find((g: any) => g.id === d.gasto_id); const grupo = gruposRef?.find((g: any) => g.id === gasto?.grupo_id); return grupo ? { nombre: grupo.nombre } : null })(),
        },
      })) as any)
    } else {
      setDeudas([])
    }

    const { data: partData } = await supabase.from('participantes_gasto').select('gasto_id').eq('usuario_id', uid).limit(5)
    if (partData && partData.length > 0) {
      const gastoIds = partData.map((p: any) => p.gasto_id)
      const { data: gastosData } = await supabase.from('gastos').select('id, descripcion, monto, fecha, pagado_por, grupo_id').in('id', gastoIds).order('fecha', { ascending: false })
      if (gastosData) {
        const pagadorIds = [...new Set(gastosData.map((g: any) => g.pagado_por))]
        const { data: pagadoresData } = await supabase.from('usuarios').select('id, nombre').in('id', pagadorIds)
        const grupoIdsGastos = gastosData.map((g: any) => g.grupo_id).filter(Boolean)
        const { data: gruposGastos } = grupoIdsGastos.length > 0 ? await supabase.from('grupos').select('id, nombre').in('id', grupoIdsGastos) : { data: [] }
        setGastos(gastosData.map((g: any) => ({ ...g, pagador: { nombre: pagadoresData?.find((p: any) => p.id === g.pagado_por)?.nombre ?? '' }, grupos: gruposGastos?.find((gr: any) => gr.id === g.grupo_id) ?? null })) as any)
      }
    } else {
      setGastos([])
    }
    setActiveModal(null)
  }

  function onGrupoCreado(grupo: Grupo) {
    if (isDemo) {
      const prev = JSON.parse(sessionStorage.getItem('demo-grupos') || '[]')
      sessionStorage.setItem('demo-grupos', JSON.stringify([...prev, grupo]))
    }
    setGrupos(prev => [...prev, grupo])
    setActiveModal(null)
  }

  function onAmigoAgregado(amigo: { id: string; nombre: string; email: string }) {
    const nuevoAmigo: Amigo = {
      id: amigo.id, usuario_id: userId!, amigo_id: amigo.id, estado: 'activo',
      perfil: { nombre: amigo.nombre, email: amigo.email },
    }
    setAmigos(prev => [...prev, nuevoAmigo])
    setActiveModal(null)
  }

  async function saldarDeuda(deudaId: string) {
    if (isDemo) {
      setDeudas(prev => prev.filter(d => d.id !== deudaId))
      return
    }
    await supabase.from('deudas').update({ saldado: true }).eq('id', deudaId)
    setDeudas(prev => prev.filter(d => d.id !== deudaId))
  }

  function handleLogout() {
    if (isDemo) {
      document.cookie = 'garpa-demo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      sessionStorage.clear()
    } else {
      supabase.auth.signOut()
    }
    router.push('/')
  }

  function getInitials(nombre: string) {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  function formatMonto(monto: number) {
    return `$${monto.toLocaleString('es-AR')}`
  }

  function formatFecha(fecha: string) {
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000)
    if (diff === 0) return lang === 'es' ? 'hoy' : 'today'
    if (diff === 1) return lang === 'es' ? 'ayer' : 'yesterday'
    return lang === 'es' ? `hace ${diff} días` : `${diff} days ago`
  }

  const totalDebo = deudas.filter(d => d.deudor_id === userId).reduce((acc, d) => acc + d.monto, 0)
  const totalMeDeben = deudas.filter(d => d.acreedor_id === userId).reduce((acc, d) => acc + d.monto, 0)
  const balanceNeto = totalMeDeben - totalDebo
  const deudasQueDebo = deudas.filter(d => d.deudor_id === userId)
  const deudasQueMeDeben = deudas.filter(d => d.acreedor_id === userId)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1923]">
        <p className="text-sm text-[#4A6A7A]">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1923]">

      {isDemo && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4 py-2 bg-[#3D8B7A] text-[#0F1923] text-xs font-medium">
          <span>{t('demo_banner')}</span>
          <button onClick={handleLogout} className="underline hover:no-underline">{t('demo_exit')}</button>
        </div>
      )}

      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} ${isDemo ? 'mt-8' : ''} flex flex-col flex-shrink-0 transition-all duration-250 overflow-hidden bg-[#172130] border-r border-[#1E2D3D]`}>
        <div className="flex items-center justify-between px-3 py-3 border-b border-[#1E2D3D]">
          {sidebarOpen && <span className="text-base font-medium text-[#E8E0D5]">garpa</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-7 h-7 rounded-lg text-[#4A6A7A] hover:text-[#8A9BAA] transition ml-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarOpen ? <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7" /> : <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />}
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 py-3">
          {sidebarOpen && <span className="text-xs text-[#4A6A7A] px-2 pb-1">{t('dash_menu')}</span>}
          {[
            { icon: '🏠', label: t('dash_home'), href: '/dashboard', active: true },
            { icon: '👥', label: t('dash_friends'), href: '/amigos', active: false },
            { icon: '💳', label: t('dash_expenses'), href: '/gastos', active: false },
            { icon: '⚙️', label: t('dash_settings'), href: '/configuracion', active: false },
          ].map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition w-full ${item.active ? 'bg-[#1E2D3D] text-[#E8E0D5] font-medium' : 'text-[#8A9BAA] hover:bg-[#1E2D3D]'}`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col px-2 flex-1 overflow-hidden">
          {sidebarOpen && (
            <button onClick={() => setGruposExpanded(!gruposExpanded)} className="flex items-center justify-between px-2 pb-1 w-full text-left">
              <span className="text-xs text-[#4A6A7A]">{t('dash_groups')}</span>
              <span className="text-xs text-[#4A6A7A]">{gruposExpanded ? '▲' : '▼'}</span>
            </button>
          )}
          {gruposExpanded && (
            <div className="flex flex-col gap-0.5 overflow-y-auto max-h-40">
              {grupos.length === 0 && sidebarOpen && <p className="text-xs px-2 py-1 text-[#4A6A7A]">{t('dash_no_groups')}</p>}
              {grupos.map(grupo => (
                <button key={grupo.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2D3D] transition w-full text-left">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#3D8B7A]" />
                  {sidebarOpen && <span className="text-sm text-[#8A9BAA] truncate">{grupo.nombre}</span>}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setActiveModal('nuevoGrupo')} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2D3D] transition w-full text-left mt-1 text-[#2A6496]">
            <span className="text-base flex-shrink-0">＋</span>
            {sidebarOpen && <span className="text-sm truncate">{t('dash_new_group')}</span>}
          </button>
          <button onClick={() => setActiveModal('agregarAmigo')} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2D3D] transition w-full text-left text-[#2A6496]">
            <span className="text-base flex-shrink-0">👤</span>
            {sidebarOpen && <span className="text-sm truncate">{lang === 'es' ? 'Agregar amigo' : 'Add friend'}</span>}
          </button>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-3 border-t border-[#1E2D3D] cursor-pointer hover:bg-[#1E2D3D] transition" onClick={handleLogout} title={t('dash_logout')}>
          <div className="w-8 h-8 rounded-full bg-[#1E2D3D] flex items-center justify-center text-xs font-medium text-[#3D8B7A] flex-shrink-0">
            {user ? getInitials(user.nombre) : '??'}
          </div>
          {sidebarOpen && user && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[#E8E0D5] truncate">{user.nombre}</p>
              <p className="text-xs text-[#4A6A7A] truncate">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      <main className={`flex-1 overflow-y-auto p-6 ${isDemo ? 'mt-8' : ''}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-medium text-[#E8E0D5]">
              {t('dash_greeting')}{user ? `, ${user.nombre.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm text-[#4A6A7A]">
              {deudasQueDebo.length > 0
                ? `${deudasQueDebo.length} ${deudasQueDebo.length === 1 ? t('dash_debts_pending') : t('dash_debts_pending_plural')}`
                : t('dash_all_good')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveModal('nuevoGasto')} className="text-xs bg-[#3D8B7A] text-[#0F1923] font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition">
              {lang === 'es' ? '+ Nuevo gasto' : '+ New expense'}
            </button>
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-xs text-[#4A6A7A] hover:text-[#8A9BAA] transition border border-[#1E2D3D] px-2.5 py-1.5 rounded-lg">
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button onClick={() => setActiveModal('debo')} className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-4 text-left hover:border-[#C0675A] transition">
            <p className="text-xs text-[#4A6A7A] mb-1">{t('dash_owe')}</p>
            <p className="text-2xl font-medium text-[#C0675A]">{formatMonto(totalDebo)}</p>
            <p className="text-xs text-[#4A6A7A] mt-1">{deudasQueDebo.length} {deudasQueDebo.length === 1 ? t('dash_debts') : t('dash_debts_plural')}</p>
          </button>
          <button onClick={() => setActiveModal('meDeban')} className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-4 text-left hover:border-[#3D8B7A] transition">
            <p className="text-xs text-[#4A6A7A] mb-1">{t('dash_owed')}</p>
            <p className="text-2xl font-medium text-[#3D8B7A]">{formatMonto(totalMeDeben)}</p>
            <p className="text-xs text-[#4A6A7A] mt-1">{deudasQueMeDeben.length} {deudasQueMeDeben.length === 1 ? t('dash_people') : t('dash_people_plural')}</p>
          </button>
          <div className="bg-[#172130] border border-[#1E2D3D] rounded-xl p-4">
            <p className="text-xs text-[#4A6A7A] mb-1">{t('dash_balance')}</p>
            <p className={`text-2xl font-medium ${balanceNeto >= 0 ? 'text-[#3D8B7A]' : 'text-[#C0675A]'}`}>
              {balanceNeto >= 0 ? '+' : ''}{formatMonto(balanceNeto)}
            </p>
            <p className="text-xs text-[#4A6A7A] mt-1">{t('dash_general')}</p>
          </div>
        </div>

        <h2 className="text-sm font-medium text-[#E8E0D5] mb-3">{t('dash_movements')}</h2>
        <div className="flex flex-col gap-2">
          {gastos.length === 0 && <p className="text-sm text-[#4A6A7A]">{t('dash_no_movements')}</p>}
          {gastos.map(gasto => {
            const yoPague = gasto.pagado_por === userId
            return (
              <div key={gasto.id} className="bg-[#172130] border border-[#1E2D3D] rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1E2D3D] flex items-center justify-center text-lg flex-shrink-0">💳</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#E8E0D5] truncate">
                    {gasto.descripcion}
                    {gasto.grupos && <span className="text-[#4A6A7A]"> · {gasto.grupos.nombre}</span>}
                  </p>
                  <p className="text-xs text-[#4A6A7A]">
                    {yoPague ? t('dash_you_paid') : `${t('dash_paid')} ${gasto.pagador?.nombre}`} · {formatFecha(gasto.fecha)}
                  </p>
                </div>
                <span className={`text-sm font-medium ${yoPague ? 'text-[#3D8B7A]' : 'text-[#C0675A]'}`}>
                  {yoPague ? '+' : '-'}{formatMonto(gasto.monto)}
                </span>
              </div>
            )
          })}
        </div>
      </main>

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
                    <button onClick={() => saldarDeuda(deuda.id)} className="text-xs border border-[#1E2D3D] text-[#4A6A7A] hover:text-[#3D8B7A] hover:border-[#3D8B7A] px-2 py-0.5 rounded-lg transition">
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

      {activeModal === 'nuevoGrupo' && userId && (
        <ModalNuevoGrupo onClose={() => setActiveModal(null)} onCreated={onGrupoCreado} amigos={amigos} userId={userId} isDemo={isDemo} />
      )}
      {activeModal === 'nuevoGasto' && userId && (
        <ModalNuevoGasto onClose={() => setActiveModal(null)} onCreated={recargar} grupos={grupos} amigos={amigos} userId={userId} isDemo={isDemo} />
      )}
      {activeModal === 'agregarAmigo' && userId && (
        <ModalAgregarAmigo onClose={() => setActiveModal(null)} onAdded={onAmigoAgregado} userId={userId} isDemo={isDemo} />
      )}

    </div>
  )
}