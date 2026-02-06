import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ModuleSelection from '@/components/auth/ModuleSelection'

export const dynamic = 'force-dynamic'

/**
 * Página de selección de módulo
 * Solo accesible para usuarios autenticados (protegido por middleware)
 * Permite elegir entre Inventario o Facturación
 */
export default async function SelectModulePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return <ModuleSelection />
}
