import { Database } from './database.types'

/**
 * Tipos globales de Garpa
 * Reemplazados por tipos generados automáticamente de Supabase
 */

export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Grupo = Database['public']['Tables']['grupos']['Row']
export type Gasto = Database['public']['Tables']['gastos']['Row'] & {
  grupos?: Database['public']['Tables']['grupos']['Row'] | null
  pagador?: { nombre: string }
}
export type Amigo = Database['public']['Tables']['amistades']['Row'] & {
  perfil?: Usuario
}
// Deuda, Miembro, Participante, SplitRow, SplitMode son tipos de dominio, se mantienen.

export type Miembro = {
  usuario_id: string
  usuarios: { nombre: string; email: string }
}

export type Participante = {
  usuario_id: string
  monto: number
  porcentaje: number | null
  usuarios?: { nombre: string }
}

export type Deuda = {
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

export type SplitMode = 'igual' | 'porcentaje' | 'monto'

export type SplitRow = {
  usuario_id: string
  nombre: string
  monto: number
  porcentaje: number
}
