/**
 * Tipos globales de Garpa
 * Usados en el dashboard, modales y lógica de negocio
 */

export type Usuario = {
  id: string
  nombre: string
  email: string
}

export type Grupo = {
  id: string
  nombre: string
}

export type Miembro = {
  usuario_id: string
  usuarios: { nombre: string; email: string }
}

export type Gasto = {
  id: string
  descripcion: string
  monto: number
  fecha: string
  pagado_por: string
  grupo_id: string | null
  grupos: { nombre: string } | null
  pagador: { nombre: string }
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

export type Amigo = {
  id: string
  usuario_id: string
  amigo_id: string
  estado: 'pendiente' | 'activo' | 'rechazado'
  perfil: { nombre: string; email: string }
}

// Tipo para el modo de división del gasto
export type SplitMode = 'igual' | 'porcentaje' | 'monto'

// Tipo para cada fila del breakdown de división
export type SplitRow = {
  usuario_id: string
  nombre: string
  monto: number
  porcentaje: number
}