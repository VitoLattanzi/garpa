import { z } from 'zod';

/**
 * Utilitario para envolver consultas de Supabase y manejar errores de forma centralizada.
 * Permite validación opcional con Zod.
 */

export async function safeQuery<T>(query: any, schema?: z.ZodSchema<T>) {
  try {
    const result = await query;
    if (result.error) throw result.error;
    
    if (schema) {
      const validated = schema.safeParse(result.data);
      if (!validated.success) {
        console.error('Data validation failed:', validated.error.format());
        throw new Error('Data validation failed');
      }
      return { data: validated.data as T, error: null };
    }
    
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
