'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@supabase/supabase-js'
import { Plus, Edit, Trash2, History, LogOut, Package } from 'lucide-react'
import InventoryHistory from '@/components/inventory/InventoryHistory'
import AddProductDialog from '@/components/inventory/AddProductDialog'

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

type ActiveSection = 'inventario' | 'agregar' | 'editar' | 'eliminar'

/**
 * Contenido del dashboard
 * Muestra la interfaz de gestión de inventario con barra de tareas
 */
export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState<ActiveSection>('inventario')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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

  const handleProductAdded = () => {
    setRefreshKey((prev) => prev + 1)
    setAddDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Inventario</h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido, {user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  profile.role
                )}`}
              >
                {profile.role.toUpperCase()}
              </span>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Barra de Tareas */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeSection === 'inventario' ? 'default' : 'outline'}
                onClick={() => setActiveSection('inventario')}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                Historial
              </Button>
              <Button
                variant={activeSection === 'agregar' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveSection('agregar')
                  setAddDialogOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
              <Button
                variant={activeSection === 'editar' ? 'default' : 'outline'}
                onClick={() => setActiveSection('editar')}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Producto
              </Button>
              <Button
                variant={activeSection === 'eliminar' ? 'default' : 'outline'}
                onClick={() => setActiveSection('eliminar')}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar Producto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contenido Principal */}
        <div className="space-y-6">
          {activeSection === 'inventario' && (
            <div key={refreshKey}>
              <InventoryHistory />
            </div>
          )}

          {activeSection === 'agregar' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Agregar Producto
                </CardTitle>
                <CardDescription>
                  Haz clic en el botón &quot;Agregar Producto&quot; en la barra de tareas para abrir el formulario.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Abrir Formulario de Agregar Producto
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'editar' && (
            <div key={refreshKey}>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Editar Producto
                  </CardTitle>
                  <CardDescription>
                    Selecciona un producto de la tabla y haz clic en el botón de editar para modificarlo.
                  </CardDescription>
                </CardHeader>
              </Card>
              <InventoryHistory />
            </div>
          )}

          {activeSection === 'eliminar' && (
            <div key={refreshKey}>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Eliminar Producto
                  </CardTitle>
                  <CardDescription>
                    Selecciona un producto de la tabla y haz clic en el botón de eliminar para borrarlo.
                  </CardDescription>
                </CardHeader>
              </Card>
              <InventoryHistory />
            </div>
          )}
        </div>
      </div>

      {/* Dialog para agregar producto */}
      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onProductAdded={handleProductAdded}
      />
    </div>
  )
}
