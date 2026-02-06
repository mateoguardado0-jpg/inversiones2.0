import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para uso en componentes del cliente
 * Este cliente se usa en componentes que tienen 'use client'
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validar que las variables de entorno estén configuradas
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Las variables de entorno de Supabase no están configuradas. Por favor, verifica tu archivo .env.local'
    )
  }

  // Validar que no sean valores placeholder
  if (
    supabaseAnonKey.includes('your_supabase_anon_key_here') ||
    supabaseAnonKey.includes('TU_ANON_KEY_AQUI') ||
    supabaseAnonKey.trim().length < 20
  ) {
    throw new Error(
      'La API key de Supabase no está configurada correctamente. Por favor, configura NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local con tu clave anónima real de Supabase.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
