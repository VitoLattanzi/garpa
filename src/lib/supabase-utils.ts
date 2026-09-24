/**
 * Utilitario para envolver consultas de Supabase y manejar errores de forma centralizada.
 */

export async function safeQuery<T>(query: any) {
  try {
    const result = await query;
    if (result.error) throw result.error;
    return { data: result.data as T, error: null };
  } catch (error) {
    console.error('Supabase query error (Raw):', error);
    // Si el error es un objeto vacío, intentamos inspeccionar más
    if (typeof error === 'object' && error !== null && Object.keys(error).length === 0) {
       console.error('Supabase error is an empty object. Check network tab or RLS policies.');
    }
    return { data: null, error };
  }
}
