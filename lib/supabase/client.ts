import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para uso en componentes del cliente
 * Este cliente se usa en componentes que tienen 'use client'
 */
export function createClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Validar que las variables de entorno estén configuradas
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variables de entorno de Supabase no configuradas')
      // En lugar de lanzar error, retornar un cliente con valores por defecto
      // que mostrará errores más amigables en la UI
      return createBrowserClient(
        'https://placeholder.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
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
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      )
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    // Si hay cualquier error al crear el cliente, retornar uno con valores placeholder
    console.error('❌ Error al crear cliente de Supabase:', error)
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    )
  }
}
