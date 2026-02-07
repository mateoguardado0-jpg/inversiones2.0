export type NormalizedSupabaseError = {
  message: string
  code?: string
  details?: string
  hint?: string
  status?: number
  raw?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Normaliza errores comunes de Supabase/PostgREST para poder mostrarlos en UI.
 * - PostgrestError: { message, details, hint, code }
 * - Error estándar: { message }
 * - Respuestas fetch (a veces): { status, statusText }
 */
export function normalizeSupabaseError(err: unknown): NormalizedSupabaseError {
  if (!err) return { message: 'Error desconocido', raw: err }
  if (typeof err === 'string') return { message: err, raw: err }

  // Error estándar
  if (err instanceof Error) {
    const anyErr = err as unknown as Record<string, unknown>
    return {
      message: err.message || 'Error desconocido',
      code: typeof anyErr.code === 'string' ? anyErr.code : undefined,
      details: typeof anyErr.details === 'string' ? anyErr.details : undefined,
      hint: typeof anyErr.hint === 'string' ? anyErr.hint : undefined,
      status: typeof anyErr.status === 'number' ? anyErr.status : undefined,
      raw: err,
    }
  }

  // Objetos tipo PostgREST / fetch
  if (isRecord(err)) {
    const message =
      (typeof err.message === 'string' && err.message) ||
      (typeof err.error === 'string' && err.error) ||
      (typeof err.statusText === 'string' && err.statusText) ||
      'Error desconocido'

    return {
      message,
      code: typeof err.code === 'string' ? err.code : undefined,
      details: typeof err.details === 'string' ? err.details : undefined,
      hint: typeof err.hint === 'string' ? err.hint : undefined,
      status: typeof err.status === 'number' ? err.status : undefined,
      raw: err,
    }
  }

  return { message: 'Error desconocido', raw: err }
}

/**
 * Devuelve un string legible para UI/alerts. Incluye campos clave si existen.
 */
export function formatSupabaseError(err: unknown): string {
  const n = normalizeSupabaseError(err)
  const parts: string[] = []

  parts.push(n.message)
  if (n.code) parts.push(`Código: ${n.code}`)
  if (n.details) parts.push(`Detalles: ${n.details}`)
  if (n.hint) parts.push(`Hint: ${n.hint}`)
  if (typeof n.status === 'number') parts.push(`HTTP: ${n.status}`)

  return parts.join(' — ')
}

/**
 * Mensajes accionables para fallos típicos en Supabase REST.
 * Nota: el status HTTP no siempre está presente en el error, por eso también
 * buscamos señales en el texto.
 */
export function getSupabaseActionHint(err: unknown): string | null {
  const n = normalizeSupabaseError(err)
  const msg = `${n.message} ${n.details ?? ''} ${n.hint ?? ''}`.toLowerCase()

  // Schema no expuesto en PostgREST (config del proyecto)
  // Ej: "Invalid schema: public — Código: PGRST106 — Hint: Only the following schemas are exposed: graphql_public"
  if (n.code === 'PGRST106' || msg.includes('invalid schema')) {
    return (
      'Tu proyecto de Supabase NO está exponiendo el schema `public` a la API REST (PostgREST). ' +
      'Solución: Supabase Dashboard → Settings → API → "Exposed schemas" → agrega `public` (y guarda). ' +
      'Después recarga la app e intenta de nuevo.'
    )
  }

  // 404 en PostgREST suele significar "tabla no accesible" (no existe o sin permisos)
  if (n.status === 404 || msg.includes('404') || msg.includes('not found')) {
    return (
      'El API REST no puede acceder a `public.productos` (no existe en el schema expuesto o faltan permisos/políticas RLS). ' +
      'Verifica que ejecutaste `inventario-setup.sql` y/o `fix-schema-public-completo.sql` en el MISMO proyecto de Supabase al que apunta tu app.'
    )
  }

  // 406 en PostgREST: RLS/headers/consulta no aceptable
  if (n.status === 406 || msg.includes('406') || msg.includes('not acceptable')) {
    return (
      'Supabase/PostgREST rechazó la petición (406). Suele pasar por permisos/RLS o porque el schema/tabla no está expuesto. ' +
      'Ejecuta `fix-api-rest-406.sql` y revisa en Supabase Dashboard → Logs → API Logs el detalle del error.'
    )
  }

  // Error típico cuando se pide un objeto y no hay 1 fila (single())
  if (msg.includes('json object requested') || msg.includes('pgrst116')) {
    return 'La consulta está pidiendo una sola fila (`single()`), pero Supabase recibió 0 o más de 1. Revisa filtros/limit y usa `maybeSingle()` o maneja arrays.'
  }

  return null
}

