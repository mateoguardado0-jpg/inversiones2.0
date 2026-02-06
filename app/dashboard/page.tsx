import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/dashboard/DashboardContent'

export const dynamic = 'force-dynamic'

/**
 * Dashboard principal
 * Solo accesible para usuarios autenticados (protegido por middleware)
 */
export default async function DashboardPage() {
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
}
