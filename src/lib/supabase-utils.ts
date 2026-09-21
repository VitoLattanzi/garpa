/**
 * Utilitario para envolver consultas de Supabase y manejar errores de forma centralizada.
 */

export async function safeQuery<T>(query: any) {
  try {
    const result = await query;
    if (result.error) throw result.error;
    return { data: result.data as T, error: null };
  } catch (error) {
    console.error('Supabase query error:', error);
    return { data: null, error };
  }
}
