import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Ruta de callback para OAuth (Google, etc.)
 * Maneja el retorno después de la autenticación OAuth
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  // Si hay un error en el callback, redirigir al login con mensaje
  if (error) {
    const errorUrl = new URL(`${origin}/login`)
    errorUrl.searchParams.set('error', error)
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Error al intercambiar código por sesión:', exchangeError)
        const errorUrl = new URL(`${origin}/login`)
        errorUrl.searchParams.set('error', 'auth_failed')
        return NextResponse.redirect(errorUrl)
      }

      // Crear perfil si no existe (para usuarios de OAuth)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                role: 'user',
              },
            ])

          if (profileError) {
            console.error('Error al crear perfil:', profileError)
            // Continuar de todas formas, el usuario ya está autenticado
          }
        }
      }

      // Redirigir al dashboard después de la autenticación
      return NextResponse.redirect(`${origin}/dashboard`)
    } catch (error) {
      console.error('Error en callback de OAuth:', error)
      const errorUrl = new URL(`${origin}/login`)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }
  }

  // Si no hay código, redirigir al login
  return NextResponse.redirect(`${origin}/login`)
}
