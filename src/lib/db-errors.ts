/**
 * Utilidad para normalizar errores de base de datos de Supabase/Postgrest.
 */

export function getDbErrorMessage(error: any): string {
  if (!error) return 'error_unknown'
  
  // Si el error es de Postgrest, trae un código
  if (error.code) {
    switch (error.code) {
      case '23505': return 'error_duplicate_entry'
      case '42501': return 'error_permission_denied'
      case '23503': return 'error_foreign_key_violation'
    }
  }

  const message = (error.message || '').toLowerCase()

  if (message.includes('not found') || message.includes('no rows')) return 'error_not_found'
  if (message.includes('network') || message.includes('fetch')) return 'error_network'
  
  return 'error_unknown'
}
