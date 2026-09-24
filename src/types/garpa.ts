import { Database } from './database.types'

/**
 * Tipos globales de Garpa
 * Basados en los tipos generados de Supabase pero flexibilizados para la UI y mocks
 */

export type Usuario = Partial<Database['public']['Tables']['usuarios']['Row']> & {
  id?: string
  nombre: string
  email?: string
  avatar_url?: string | null
  fecha_registro?: string | null
}

export type Grupo = {
  id: string
  nombre: string
  descripcion?: string | null
  creado_por?: string | null
  fecha_creacion?: string | null
  color?: string
}

export type Gasto = Database['public']['Tables']['gastos']['Row'] & {
  grupos?: Grupo | null
  pagador?: { nombre: string }
}

export type Amigo = Partial<Database['public']['Tables']['amistades']['Row']> & {
  id?: string
  usuario_id?: string
  amigo_id?: string
  estado?: string
  fecha_solicitud?: string | null
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
