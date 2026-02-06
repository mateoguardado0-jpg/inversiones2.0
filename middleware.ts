import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware para proteger rutas y actualizar sesiones de Supabase
 * Protege todas las rutas excepto /login y /register
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/auth']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  try {
    // Actualizar sesión de Supabase
    const response = await updateSession(request)

    // Si es una ruta pública, permitir acceso
    if (isPublicRoute) {
      return response
    }

    // Verificar autenticación para rutas protegidas
    try {
      const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
      const { data: { user } } = await supabase.auth.getUser()

      // Si no hay usuario y no es ruta pública, redirigir a login
      if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // Si hay un error al crear el cliente (variables de entorno no configuradas),
      // permitir acceso a rutas públicas, redirigir a login para otras
      if (!isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }

    return response
  } catch (error) {
    // Si hay un error en updateSession, permitir acceso a rutas públicas
    if (isPublicRoute) {
      return NextResponse.next()
    }
    // Para rutas protegidas, redirigir a login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
