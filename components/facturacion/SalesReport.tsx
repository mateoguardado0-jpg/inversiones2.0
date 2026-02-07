'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Receipt, TrendingUp, Package, DollarSign, Calendar } from 'lucide-react'

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

interface ProductSales {
  producto_id: string
  nombre: string
  unidad_medida: string
  cantidad_vendida: number
  total_ventas: number
}

/**
 * Componente de reporte de ventas mensuales
 * Muestra estadísticas y registro de ventas del mes actual
 */
export default function SalesReport() {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const supabase = createClient()

  const fetchMonthlySales = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener el primer y último día del mes seleccionado
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

      // Obtener facturas del mes
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('facturas')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
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
      console.error('Error al cargar ventas:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedMonth])

  useEffect(() => {
    fetchMonthlySales()
  }, [fetchMonthlySales])

  // Calcular estadísticas
  const calculateStats = () => {
    const totalVentas = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const totalFacturas = invoices.length
    const totalProductos = invoices.reduce((sum, invoice) => 
      sum + invoice.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0
    )

    // Productos más vendidos
    const productSalesMap = new Map<string, ProductSales>()
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const producto = item.productos as any
        const productId = item.producto_id
        const existing = productSalesMap.get(productId)
        
        if (existing) {
          existing.cantidad_vendida += item.cantidad
          existing.total_ventas += item.subtotal
        } else {
          productSalesMap.set(productId, {
            producto_id: productId,
            nombre: producto?.nombre || 'Producto eliminado',
            unidad_medida: producto?.unidad_medida || 'unidad',
            cantidad_vendida: item.cantidad,
            total_ventas: item.subtotal,
          })
        }
      })
    })

    const productosMasVendidos = Array.from(productSalesMap.values())
      .sort((a, b) => b.cantidad_vendida - a.cantidad_vendida)
      .slice(0, 10)

    return {
      totalVentas,
      totalFacturas,
      totalProductos,
      productosMasVendidos,
    }
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
    return `FAC-${id.substring(0, 8).toUpperCase()}`
  }

  const formatMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando reporte de ventas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de mes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Reporte de Ventas Mensual
              </CardTitle>
              <CardDescription className="mt-2">
                Estadísticas y registro de ventas del mes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-3xl font-bold">${stats.totalVentas.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatMonthName(selectedMonth)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facturas Emitidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-3xl font-bold">{stats.totalFacturas}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.totalFacturas === 1 ? 'factura' : 'facturas'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Productos Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-3xl font-bold">{stats.totalProductos}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.totalProductos === 1 ? 'unidad' : 'unidades'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productos más vendidos */}
      {stats.productosMasVendidos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>
              Top 10 productos con mayor cantidad vendida en {formatMonthName(selectedMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">Producto</th>
                    <th className="text-right p-3 font-medium">Cantidad Vendida</th>
                    <th className="text-right p-3 font-medium">Total en Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.productosMasVendidos.map((product, index) => (
                    <tr key={product.producto_id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-muted-foreground">{index + 1}</td>
                      <td className="p-3 font-medium">{product.nombre}</td>
                      <td className="p-3 text-right">
                        {product.cantidad_vendida} {product.unidad_medida}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        ${product.total_ventas.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de facturas del mes */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Ventas</CardTitle>
          <CardDescription>
            Todas las facturas emitidas en {formatMonthName(selectedMonth)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ventas registradas para este mes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">
                          {formatInvoiceNumber(invoice.id)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(invoice.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${invoice.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.items.length} {invoice.items.length === 1 ? 'producto' : 'productos'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 pt-3 border-t">
                      {invoice.items.map((item) => {
                        const producto = item.productos as any
                        return (
                          <div
                            key={item.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span>
                              <span className="font-medium">{producto?.nombre || 'Producto eliminado'}</span>
                              <span className="text-muted-foreground ml-2">
                                {item.cantidad} {producto?.unidad_medida || 'unidad'} × ${item.precio.toFixed(2)}
                              </span>
                            </span>
                            <span className="font-medium">
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
