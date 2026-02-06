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
    console.error('❌ Variables de entorno de Supabase no configuradas')
    // En lugar de lanzar error, retornar un cliente con valores por defecto
    // que mostrará errores más amigables en la UI
    return createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
  }

  // Validar que no sean valores placeholder
  if (
    supabaseAnonKey.includes('your_supabase_anon_key_here') ||
    supabaseAnonKey.includes('TU_ANON_KEY_AQUI') ||
    supabaseAnonKey.trim().length < 20
  ) {
    console.error('❌ API key de Supabase no configurada correctamente')
    // Retornar cliente con valores placeholder para evitar crash
    return createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
