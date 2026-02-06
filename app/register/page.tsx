import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RegisterForm from '@/components/auth/RegisterForm'

export const dynamic = 'force-dynamic'

/**
 * Página de registro
 * Si el usuario ya está autenticado, redirige al dashboard
 */
export default async function RegisterPage() {
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
        <RegisterForm />
      </div>
    </div>
  )
}
