import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/dashboard/DashboardContent'

export const dynamic = 'force-dynamic'

/**
 * Dashboard principal
 * Solo accesible para usuarios autenticados (protegido por middleware)
 */
export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      redirect('/login')
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return <DashboardContent user={user} profile={profile} />
  } catch (error) {
    // Si hay un error (probablemente variables de entorno no configuradas), redirigir a login
    console.error('Error en dashboard:', error)
    redirect('/login')
  }
}
