/**
 * Utilidad para normalizar y traducir errores de autenticación de Supabase.
 * Mapea mensajes de error crudos de Supabase a claves internas para LangContext.
 */

export function getAuthErrorMessage(error: any): string {
  if (!error || !error.message) return 'error_unknown'

  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) return 'error_invalid_credentials'
  if (message.includes('email not confirmed')) return 'error_email_not_confirmed'
  if (message.includes('user already registered')) return 'error_user_already_registered'
  if (message.includes('password should be at least')) return 'error_password_too_short'
  
  return 'error_unknown'
}
