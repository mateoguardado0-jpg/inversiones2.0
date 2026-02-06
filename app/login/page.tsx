import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/LoginForm'

export const dynamic = 'force-dynamic'

/**
 * Página de inicio de sesión
 * Si el usuario ya está autenticado, redirige al dashboard
 */
export default async function LoginPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    }
  } catch (error) {
    // Si hay un error (probablemente variables de entorno no configuradas), mostrar el formulario de todas formas
    // El formulario mostrará el error apropiado
    console.error('Error al verificar usuario:', error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
