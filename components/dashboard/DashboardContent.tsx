'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  created_at: string
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
}

/**
 * Contenido del dashboard
 * Muestra información del usuario y opciones básicas
 */
export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido al sistema de inventario
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>

        {/* Cards de información */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Información del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
              <CardDescription>Datos de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                {profile ? (
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile.role)}`}
                  >
                    {profile.role.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Cargando...</span>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID de Usuario</p>
                <p className="font-mono text-xs break-all">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Estado del sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>Estado general</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Autenticación</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    ✓ Activa
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base de Datos</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    ✓ Conectada
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximas funciones */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Funciones</CardTitle>
              <CardDescription>En desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Gestión de inventario</li>
                <li>• Reportes y análisis</li>
                <li>• Integración con IA</li>
                <li>• Notificaciones</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
