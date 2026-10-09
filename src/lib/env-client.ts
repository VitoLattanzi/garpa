import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://garpa.vercel.app'),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid client environment variables:', _env.error.format())
  throw new Error('Invalid client environment variables')
}

export const env = _env.data
