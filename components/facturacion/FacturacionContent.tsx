'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Receipt, Eye } from 'lucide-react'
import CreateInvoiceDialog from './CreateInvoiceDialog'

interface Invoice {
  id: string
  user_id: string
  total: number
  created_at: string
}

interface InvoiceItem {
  id: string
  factura_id: string
  producto_id: string
  cantidad: number
  precio: number
  subtotal: number
  productos: {
    id: string
    nombre: string
    unidad_medida: string
  }
}

interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
}

/**
 * Componente principal de facturación
 * Muestra lista de facturas y permite crear nuevas
 */
export default function FacturacionContent() {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  const fetchInvoices = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener facturas
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('facturas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (invoicesError) throw invoicesError

      // Para cada factura, obtener sus items
      const invoicesWithItems = await Promise.all(
        (invoicesData || []).map(async (invoice) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('factura_items')
            .select(`
              *,
              productos:producto_id (
                id,
                nombre,
                unidad_medida
              )
            `)
            .eq('factura_id', invoice.id)

          if (itemsError) throw itemsError

          return {
            ...invoice,
            items: itemsData || [],
          }
        })
      )

      setInvoices(invoicesWithItems)
    } catch (error) {
      console.error('Error al cargar facturas:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices, refreshKey])

  const handleInvoiceCreated = () => {
    setRefreshKey((prev) => prev + 1)
    setCreateDialogOpen(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatInvoiceNumber = (id: string) => {
    // Usar los primeros 8 caracteres del UUID como número de factura
    return `FAC-${id.substring(0, 8).toUpperCase()}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando facturas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header con botón crear */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Facturación
                </CardTitle>
                <CardDescription className="mt-2">
                  Gestiona tus facturas y ventas
                </CardDescription>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Factura
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de facturas */}
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No hay facturas registradas aún.
                </p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear Primera Factura
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {formatInvoiceNumber(invoice.id)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(invoice.created_at)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${invoice.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.items.length} {invoice.items.length === 1 ? 'producto' : 'productos'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-2">Productos:</div>
                    <div className="space-y-1">
                      {invoice.items.map((item) => {
                        const producto = item.productos as any
                        return (
                          <div
                            key={item.id}
                            className="flex justify-between items-center text-sm py-1 border-b last:border-0"
                          >
                            <div>
                              <span className="font-medium">{producto?.nombre || 'Producto eliminado'}</span>
                              <span className="text-muted-foreground ml-2">
                                {item.cantidad} {producto?.unidad_medida || 'unidad'}
                                {' × '}
                                ${item.precio.toFixed(2)}
                              </span>
                            </div>
                            <span className="font-medium">
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para crear factura */}
      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </>
  )
}
