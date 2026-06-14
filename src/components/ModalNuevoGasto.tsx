'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '../lib/supabase-browser'
import { useLang } from '../context/LangContext'
import { Grupo, Amigo, SplitMode, SplitRow } from '../types/garpa'

type Props = {
  onClose: () => void
  onCreated: () => void
  grupos: Grupo[]
  amigos: Amigo[]
  userId: string
  isDemo: boolean
}

/**
 * Modal para registrar un nuevo gasto
 * Soporta 3 modos de división: partes iguales, porcentaje y monto fijo
 * En modo real → guarda en Supabase y genera deudas automáticamente
 * En modo demo → guarda en sessionStorage
 */
export default function ModalNuevoGasto({ onClose, onCreated, grupos, amigos, userId, isDemo }: Props) {
  const { lang } = useLang()
  const supabase = createSupabaseBrowserClient()

  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [grupoId, setGrupoId] = useState<string>('')
  const [splitMode, setSplitMode] = useState<SplitMode>('igual')
  const [participantes, setParticipantes] = useState<SplitRow[]>([])
  const [miembrosGrupo, setMiembrosGrupo] = useState<{ usuario_id: string; nombre: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cuando cambia el grupo seleccionado, cargamos sus miembros
   * Si no hay grupo, usamos los amigos del usuario
   */
  useEffect(() => {
    async function cargarMiembros() {
      if (!grupoId) {
        // Sin grupo — usamos amigos + el usuario mismo
        const base = [
          { usuario_id: userId, nombre: lang === 'es' ? 'Vos' : 'You' },
          ...amigos.map(a => ({ usuario_id: a.amigo_id, nombre: a.perfil.nombre }))
        ]
        setMiembrosGrupo(base)
        recalcSplit(base, monto, splitMode)
        return
      }

      if (isDemo) {
        // Demo — usamos miembros ficticios
        const demoMiembros = [
          { usuario_id: userId, nombre: lang === 'es' ? 'Vos' : 'You' },
          { usuario_id: 'juan', nombre: 'Juan' },
          { usuario_id: 'maria', nombre: 'María' },
        ]
        setMiembrosGrupo(demoMiembros)
        recalcSplit(demoMiembros, monto, splitMode)
        return
      }

      // Real — traemos los miembros del grupo desde Supabase
      const { data } = await supabase
        .from('miembros_grupo')
        .select('usuario_id, usuarios(nombre)')
        .eq('grupo_id', grupoId)

      if (data) {
        const miembros = data.map((m: any) => ({
          usuario_id: m.usuario_id,
          nombre: m.usuarios?.nombre ?? 'Usuario',
        }))
        setMiembrosGrupo(miembros)
        recalcSplit(miembros, monto, splitMode)
      }
    }

    cargarMiembros()
  }, [grupoId])

  /**
   * Recalcula el breakdown de división cada vez que cambia
   * el monto, el modo de split o los participantes seleccionados
   */
  function recalcSplit(
    miembros: { usuario_id: string; nombre: string }[],
    montoStr: string,
    mode: SplitMode,
    prevRows?: SplitRow[]
  ) {
    const total = parseFloat(montoStr) || 0
    const count = miembros.length

    const rows: SplitRow[] = miembros.map((m, i) => {
      if (mode === 'igual') {
        return {
          usuario_id: m.usuario_id,
          nombre: m.nombre,
          monto: count > 0 ? total / count : 0,
          porcentaje: count > 0 ? 100 / count : 0,
        }
      }
      if (mode === 'porcentaje') {
        const pct = prevRows?.[i]?.porcentaje ?? (count > 0 ? 100 / count : 0)
        return {
          usuario_id: m.usuario_id,
          nombre: m.nombre,
          monto: total * pct / 100,
          porcentaje: pct,
        }
      }
      // monto fijo
      const montoFijo = prevRows?.[i]?.monto ?? (count > 0 ? total / count : 0)
      return {
        usuario_id: m.usuario_id,
        nombre: m.nombre,
        monto: montoFijo,
        porcentaje: total > 0 ? montoFijo / total * 100 : 0,
      }
    })

    setParticipantes(rows)
  }

  // Actualiza el monto de un participante específico
  function updateParticipante(index: number, value: string) {
    const total = parseFloat(monto) || 0
    const newRows = [...participantes]

    if (splitMode === 'porcentaje') {
      const pct = parseFloat(value) || 0
      newRows[index] = {
        ...newRows[index],
        porcentaje: pct,
        monto: total * pct / 100,
      }
    } else {
      const montoFijo = parseFloat(value) || 0
      newRows[index] = {
        ...newRows[index],
        monto: montoFijo,
        porcentaje: total > 0 ? montoFijo / total * 100 : 0,
      }
    }

    setParticipantes(newRows)
  }

  // Cambia el modo de split y recalcula
  function handleSplitMode(mode: SplitMode) {
    setSplitMode(mode)
    recalcSplit(miembrosGrupo, monto, mode, participantes)
  }

  // Recalcula cuando cambia el monto
  function handleMontoChange(val: string) {
    setMonto(val)
    recalcSplit(miembrosGrupo, val, splitMode, participantes)
  }

  async function handleSubmit() {
    if (!descripcion.trim()) {
      setError(lang === 'es' ? 'La descripción es obligatoria' : 'Description is required')
      return
    }
    if (!monto || parseFloat(monto) <= 0) {
      setError(lang === 'es' ? 'El monto debe ser mayor a 0' : 'Amount must be greater than 0')
      return
    }
    if (participantes.length === 0) {
      setError(lang === 'es' ? 'Seleccioná al menos un participante' : 'Select at least one participant')
      return
    }

    setLoading(true)
    setError(null)

    const montoTotal = parseFloat(monto)

    if (isDemo) {
      // Demo — guardamos en sessionStorage
      const gastosDemo = JSON.parse(sessionStorage.getItem('demo-gastos') || '[]')
      const deudasDemo = JSON.parse(sessionStorage.getItem('demo-deudas') || '[]')

      const nuevoGasto = {
        id: `demo-gasto-${Date.now()}`,
        descripcion: descripcion.trim(),
        monto: montoTotal,
        fecha: new Date().toISOString(),
        pagado_por: userId,
        grupo_id: grupoId || null,
        grupos: grupoId ? { nombre: grupos.find(g => g.id === grupoId)?.nombre ?? '' } : null,
        pagador: { nombre: 'Vos' },
      }

      // Generamos deudas para cada participante que no sea el que pagó
      const nuevasDeudas = participantes
        .filter(p => p.usuario_id !== userId)
        .map(p => ({
          id: `demo-deuda-${Date.now()}-${p.usuario_id}`,
          monto: p.monto,
          saldado: false,
          acreedor_id: userId,
          deudor_id: p.usuario_id,
          gastos: { descripcion: descripcion.trim(), grupos: nuevoGasto.grupos },
          acreedor: { nombre: 'Vos' },
          deudor: { nombre: p.nombre },
        }))

      sessionStorage.setItem('demo-gastos', JSON.stringify([nuevoGasto, ...gastosDemo]))
      sessionStorage.setItem('demo-deudas', JSON.stringify([...nuevasDeudas, ...deudasDemo]))

      onCreated()
      return
    }

    // Modo real — guardamos en Supabase
    const { data: gasto, error: gastoError } = await supabase
      .from('gastos')
      .insert({
        descripcion: descripcion.trim(),
        monto: montoTotal,
        pagado_por: userId,
        grupo_id: grupoId || null,
      })
      .select('id')
      .single()

    if (gastoError || !gasto) {
      setError(lang === 'es' ? 'Error al guardar el gasto' : 'Error saving expense')
      setLoading(false)
      return
    }

    // Insertamos los participantes del gasto
    await supabase.from('participantes_gasto').insert(
      participantes.map(p => ({
        gasto_id: gasto.id,
        usuario_id: p.usuario_id,
        monto: p.monto,
        porcentaje: p.porcentaje,
      }))
    )

    // Generamos deudas para cada participante que no sea el que pagó
    const deudas = participantes
      .filter(p => p.usuario_id !== userId)
      .map(p => ({
        gasto_id: gasto.id,
        deudor_id: p.usuario_id,
        acreedor_id: userId,
        monto: p.monto,
        grupo_id: grupoId || null,
        saldado: false,
      }))

    if (deudas.length > 0) {
      await supabase.from('deudas').insert(deudas)
    }

    onCreated()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[#172130] border border-[#1E2D3D] rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-medium text-[#E8E0D5]">
            {lang === 'es' ? 'Nuevo gasto' : 'New expense'}
          </h3>
          <button onClick={onClose} className="text-[#4A6A7A] hover:text-[#8A9BAA]">✕</button>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block text-xs text-[#4A6A7A] mb-1.5">
            {lang === 'es' ? 'Descripción' : 'Description'}
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder={lang === 'es' ? 'Ej: Cena en el restaurante' : 'E.g: Dinner at restaurant'}
            className="w-full bg-[#0F1923] border border-[#1E2D3D] rounded-lg px-3 py-2.5 text-sm text-[#E8E0D5] outline-none focus:border-[#3D8B7A] transition"
          />
        </div>

        {/* Monto */}
        <div className="mb-4">
          <label className="block text-xs text-[#4A6A7A] mb-1.5">
            {lang === 'es' ? 'Monto total' : 'Total amount'}
          </label>
          <input
            type="number"
            value={monto}
            onChange={e => handleMontoChange(e.target.value)}
            placeholder="$0.00"
            min="0"
            className="w-full bg-[#0F1923] border border-[#1E2D3D] rounded-lg px-3 py-2.5 text-sm text-[#E8E0D5] outline-none focus:border-[#3D8B7A] transition"
          />
        </div>

        {/* Grupo */}
        <div className="mb-4">
          <label className="block text-xs text-[#4A6A7A] mb-1.5">
            {lang === 'es' ? 'Grupo (opcional)' : 'Group (optional)'}
          </label>
          <select
            value={grupoId}
            onChange={e => setGrupoId(e.target.value)}
            className="w-full bg-[#0F1923] border border-[#1E2D3D] rounded-lg px-3 py-2.5 text-sm text-[#E8E0D5] outline-none focus:border-[#3D8B7A] transition"
          >
            <option value="">{lang === 'es' ? 'Sin grupo — entre amigos' : 'No group — between friends'}</option>
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </div>

        {/* Participantes */}
        <div className="mb-4">
          <label className="block text-xs text-[#4A6A7A] mb-2">
            {lang === 'es' ? '¿A quiénes aplica?' : 'Who does it apply to?'}
          </label>
          <div className="flex flex-wrap gap-2">
            {miembrosGrupo.map(m => (
              <span
                key={m.usuario_id}
                className="px-3 py-1.5 rounded-full text-xs border border-[#3D8B7A] text-[#3D8B7A] bg-[#3D8B7A]/10"
              >
                {m.nombre}
              </span>
            ))}
          </div>
        </div>

        {/* Modo de división */}
        <div className="mb-4">
          <label className="block text-xs text-[#4A6A7A] mb-2">
            {lang === 'es' ? '¿Cómo dividimos?' : 'How do we split?'}
          </label>
          <div className="flex gap-2">
            {(['igual', 'porcentaje', 'monto'] as SplitMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => handleSplitMode(mode)}
                className={`
                  flex-1 py-2 rounded-lg text-xs border transition
                  ${splitMode === mode
                    ? 'border-[#3D8B7A] text-[#3D8B7A] bg-[#3D8B7A]/10'
                    : 'border-[#1E2D3D] text-[#8A9BAA] hover:border-[#3D8B7A]/50'
                  }
                `}
              >
                {mode === 'igual'
                  ? (lang === 'es' ? 'Partes iguales' : 'Equal parts')
                  : mode === 'porcentaje'
                  ? (lang === 'es' ? 'Porcentaje' : 'Percentage')
                  : (lang === 'es' ? 'Monto fijo' : 'Fixed amount')
                }
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        {participantes.length > 0 && (
          <div className="mb-4 bg-[#0F1923] border border-[#1E2D3D] rounded-xl overflow-hidden">
            <div className="flex justify-between px-4 py-2 border-b border-[#1E2D3D]">
              <span className="text-xs text-[#4A6A7A]">
                {lang === 'es' ? 'Persona' : 'Person'}
              </span>
              <span className="text-xs text-[#4A6A7A]">
                {splitMode === 'igual'
                  ? (lang === 'es' ? 'Paga' : 'Pays')
                  : splitMode === 'porcentaje'
                  ? '% · ' + (lang === 'es' ? 'Monto' : 'Amount')
                  : (lang === 'es' ? 'Monto' : 'Amount')
                }
              </span>
            </div>
            {participantes.map((p, i) => (
              <div key={p.usuario_id} className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E2D3D] last:border-0">
                <span className="text-sm text-[#8A9BAA]">{p.nombre}</span>
                <div className="flex items-center gap-2">
                  {splitMode === 'igual' ? (
                    <span className="text-sm font-medium text-[#E8E0D5]">
                      ${p.monto.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                  ) : splitMode === 'porcentaje' ? (
                    <>
                      <input
                        type="number"
                        value={p.porcentaje.toFixed(0)}
                        onChange={e => updateParticipante(i, e.target.value)}
                        className="w-16 bg-[#172130] border border-[#1E2D3D] rounded-lg px-2 py-1 text-sm text-[#E8E0D5] text-right outline-none focus:border-[#3D8B7A]"
                      />
                      <span className="text-xs text-[#4A6A7A]">%</span>
                      <span className="text-xs text-[#4A6A7A] w-16 text-right">
                        ${p.monto.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-[#4A6A7A]">$</span>
                      <input
                        type="number"
                        value={p.monto.toFixed(0)}
                        onChange={e => updateParticipante(i, e.target.value)}
                        className="w-20 bg-[#172130] border border-[#1E2D3D] rounded-lg px-2 py-1 text-sm text-[#E8E0D5] text-right outline-none focus:border-[#3D8B7A]"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-[#C0675A] mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#3D8B7A] text-[#0F1923] font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {loading
            ? (lang === 'es' ? 'Guardando...' : 'Saving...')
            : (lang === 'es' ? 'Guardar gasto' : 'Save expense')
          }
        </button>

      </div>
    </div>
  )
}