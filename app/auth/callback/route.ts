import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Ruta de callback para OAuth (Google, etc.)
 * Maneja el retorno después de la autenticación OAuth
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Crear perfil si no existe (para usuarios de OAuth)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              role: 'user',
            },
          ])
      }
    }
  }

  // Redirigir al dashboard después de la autenticación
  return NextResponse.redirect(`${origin}/dashboard`)
}
