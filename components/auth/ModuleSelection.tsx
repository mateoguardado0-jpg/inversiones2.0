'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Receipt } from 'lucide-react'

/**
 * Componente de selección de módulo
 * Permite al usuario elegir entre Inventario o Facturación después del registro
 */
export default function ModuleSelection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const registered = searchParams.get('registered') === 'true'

  const handleSelectModule = (module: 'inventario' | 'facturacion') => {
    setLoading(module)
    router.push(`/dashboard?section=${module}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              {registered ? '¡Bienvenido!' : 'Selecciona un Módulo'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {registered 
                ? 'Tu cuenta ha sido creada exitosamente. Elige el módulo con el que deseas comenzar:'
                : 'Elige el módulo que deseas usar:'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Opción Inventario */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => handleSelectModule('inventario')}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Package className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl">Inventario</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Gestiona tus productos, stock y movimientos de inventario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="default"
                    disabled={loading !== null}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectModule('inventario')
                    }}
                  >
                    {loading === 'inventario' ? 'Cargando...' : 'Acceder a Inventario'}
                  </Button>
                </CardContent>
              </Card>

              {/* Opción Facturación */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => handleSelectModule('facturacion')}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                      <Receipt className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl">Facturación</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Crea facturas y gestiona ventas conectadas al inventario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="default"
                    disabled={loading !== null}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectModule('facturacion')
                    }}
                  >
                    {loading === 'facturacion' ? 'Cargando...' : 'Acceder a Facturación'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
