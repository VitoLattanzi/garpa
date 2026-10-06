import { SplitMode, SplitRow } from '../types/garpa'

/**
 * Hook para gestionar el cálculo de división de gastos.
 * Mantiene la lógica centralizada fuera de los componentes UI.
 */
export function useSplitCalculator() {
  function calculateSplit(
    miembros: { usuario_id: string; nombre: string }[],
    montoStr: string,
    mode: SplitMode,
    prevRows?: SplitRow[]
  ): SplitRow[] {
    const total = parseFloat(montoStr) || 0
    const count = miembros.length

    return miembros.map((m, i) => {
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
        porcentaje: total > 0 ? (montoFijo / total) * 100 : 0,
      }
    })
  }

  return { calculateSplit }
}
