'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  formatSupabaseError,
  getSupabaseActionHint,
  normalizeSupabaseError,
  type NormalizedSupabaseError,
} from '@/lib/supabase/error'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit, Trash2, Plus, Search, AlertTriangle, Calendar } from 'lucide-react'
import EditProductDialog from './EditProductDialog'

interface Product {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  precio: number
  cantidad: number
  unidad_medida: string
  proveedor: string | null
  codigo_barras: string | null
  ubicacion: string | null
  fecha_vencimiento: string | null
  estado: string
  created_at: string
  updated_at: string
}

interface InventoryHistoryItem {
  id: string
  producto_id: string
  tipo_movimiento: string
  cantidad_anterior: number
  cantidad_nueva: number
  cantidad_cambio: number
  motivo: string | null
  notas: string | null
  created_at: string
  productos: Product
}

export default function InventoryHistory() {
  const [products, setProducts] = useState<Product[]>([])
  const [history, setHistory] = useState<InventoryHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<NormalizedSupabaseError | null>(null)
  const [loadErrorHint, setLoadErrorHint] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      setLoadError(null)
      setLoadErrorHint(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener productos
      const { data: productsData, error: productsError } = await supabase
        .from('productos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError
      setProducts(productsData || [])

      // Obtener historial con información de productos
      const { data: historyData, error: historyError } = await supabase
        .from('historial_inventario')
        .select(`
          *,
          productos:producto_id (
            id,
            nombre,
            categoria,
            unidad_medida
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (historyError) throw historyError
      setHistory(historyData || [])
    } catch (error) {
      const normalized = normalizeSupabaseError(error)
      setLoadError(normalized)
      setLoadErrorHint(getSupabaseActionHint(error))
      console.error('Error al cargar datos:', normalized)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Función para determinar el estado de la fecha de vencimiento
  const getVencimientoStatus = (fechaVencimiento: string | null) => {
    if (!fechaVencimiento) return null
    
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const vencimiento = new Date(fechaVencimiento)
    vencimiento.setHours(0, 0, 0, 0)
    const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasRestantes < 0) {
      return { status: 'vencido', dias: Math.abs(diasRestantes), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' }
    } else if (diasRestantes <= 7) {
      return { status: 'proximo', dias: diasRestantes, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' }
    } else if (diasRestantes <= 30) {
      return { status: 'advertencia', dias: diasRestantes, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' }
    } else {
      return { status: 'ok', dias: diasRestantes, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' }
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  useEffect(() => {
    // Filtrar productos con búsqueda inteligente
    if (searchTerm.length === 0) {
      setFilteredProducts(products)
      return
    }

    const searchLower = searchTerm.toLowerCase()
    const filtered = products.filter(product => {
      const nombreMatch = product.nombre.toLowerCase().includes(searchLower)
      const categoriaMatch = product.categoria?.toLowerCase().includes(searchLower)
      const codigoMatch = product.codigo_barras?.includes(searchTerm)
      const descripcionMatch = product.descripcion?.toLowerCase().includes(searchLower)
      const proveedorMatch = product.proveedor?.toLowerCase().includes(searchLower)
      const ubicacionMatch = product.ubicacion?.toLowerCase().includes(searchLower)
      
      return nombreMatch || categoriaMatch || codigoMatch || descripcionMatch || proveedorMatch || ubicacionMatch
    })

    // Ordenar por relevancia (nombre que empieza con el término primero)
    const sorted = filtered.sort((a, b) => {
      const aStarts = a.nombre.toLowerCase().startsWith(searchLower) ? -1 : 0
      const bStarts = b.nombre.toLowerCase().startsWith(searchLower) ? -1 : 0
      return aStarts - bStarts || a.nombre.localeCompare(b.nombre)
    })

    setFilteredProducts(sorted)
  }, [searchTerm, products])

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId)

      if (error) throw error
      fetchData()
    } catch (error: any) {
      alert('Error al eliminar producto: ' + error.message)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditDialogOpen(true)
  }

  const getMovementTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'text-green-600 dark:text-green-400'
      case 'salida':
        return 'text-red-600 dark:text-red-400'
      case 'creacion':
        return 'text-blue-600 dark:text-blue-400'
      case 'edicion':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'eliminacion':
        return 'text-red-800 dark:text-red-600'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getMovementTypeLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      entrada: 'Entrada',
      salida: 'Salida',
      ajuste: 'Ajuste',
      creacion: 'Creación',
      edicion: 'Edición',
      eliminacion: 'Eliminación',
    }
    return labels[tipo] || tipo
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {loadError && (
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error al cargar inventario
              </CardTitle>
              <CardDescription>
                No se pudieron leer datos desde Supabase. Si en Network ves 404/406, normalmente es tabla no expuesta o permisos/RLS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadErrorHint && (
                <div className="text-sm bg-muted/60 p-3 rounded-md">
                  <p className="font-medium mb-1">Sugerencia:</p>
                  <p className="text-muted-foreground">{loadErrorHint}</p>
                </div>
              )}
              <div className="text-xs font-mono break-all bg-muted p-3 rounded-md">
                {formatSupabaseError(loadError.raw ?? loadError)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fetchData()}>
                  Reintentar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const text = formatSupabaseError(loadError.raw ?? loadError)
                    navigator.clipboard?.writeText(text).catch(() => {})
                  }}
                >
                  Copiar error
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Tabla de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos en Inventario</CardTitle>
            <CardDescription>
              Lista de todos los productos en tu inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Búsqueda inteligente */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar producto por nombre, categoría, código de barras, proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <span className="text-lg">×</span>
                  </Button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                </p>
              )}
            </div>
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm 
                  ? 'No se encontraron productos que coincidan con la búsqueda.'
                  : 'No hay productos en el inventario. Agrega uno para comenzar.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Nombre</th>
                      <th className="text-left p-3 font-medium">Categoría</th>
                      <th className="text-left p-3 font-medium">Cantidad</th>
                      <th className="text-left p-3 font-medium">Precio</th>
                      <th className="text-left p-3 font-medium">Vencimiento</th>
                      <th className="text-left p-3 font-medium">Estado</th>
                      <th className="text-left p-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{product.nombre}</div>
                            {product.descripcion && (
                              <div className="text-sm text-muted-foreground">
                                {product.descripcion}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">{product.categoria || '-'}</td>
                        <td className="p-3">
                          {product.cantidad} {product.unidad_medida}
                        </td>
                        <td className="p-3">${product.precio.toFixed(2)}</td>
                        <td className="p-3">
                          {product.fecha_vencimiento ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm">{formatDate(product.fecha_vencimiento)}</div>
                                {(() => {
                                  const vencimientoStatus = getVencimientoStatus(product.fecha_vencimiento)
                                  if (!vencimientoStatus) return null
                                  return (
                                    <div className={`text-xs ${vencimientoStatus.color} flex items-center gap-1 mt-1`}>
                                      {vencimientoStatus.status === 'vencido' && (
                                        <>
                                          <AlertTriangle className="h-3 w-3" />
                                          <span>Vencido hace {vencimientoStatus.dias} {vencimientoStatus.dias === 1 ? 'día' : 'días'}</span>
                                        </>
                                      )}
                                      {vencimientoStatus.status === 'proximo' && (
                                        <>
                                          <AlertTriangle className="h-3 w-3" />
                                          <span>Vence en {vencimientoStatus.dias} {vencimientoStatus.dias === 1 ? 'día' : 'días'}</span>
                                        </>
                                      )}
                                      {vencimientoStatus.status === 'advertencia' && (
                                        <span>Vence en {vencimientoStatus.dias} días</span>
                                      )}
                                      {vencimientoStatus.status === 'ok' && (
                                        <span className="text-muted-foreground">{vencimientoStatus.dias} días restantes</span>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.estado === 'activo'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : product.estado === 'agotado'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}
                          >
                            {product.estado}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de Movimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Movimientos</CardTitle>
            <CardDescription>
              Registro de todos los movimientos del inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay movimientos registrados aún.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Fecha</th>
                      <th className="text-left p-3 font-medium">Producto</th>
                      <th className="text-left p-3 font-medium">Tipo</th>
                      <th className="text-left p-3 font-medium">Cantidad Anterior</th>
                      <th className="text-left p-3 font-medium">Cantidad Nueva</th>
                      <th className="text-left p-3 font-medium">Cambio</th>
                      <th className="text-left p-3 font-medium">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => {
                      const producto = item.productos as any
                      return (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm">
                            {formatDateTime(item.created_at)}
                          </td>
                          <td className="p-3">
                            {producto?.nombre || 'Producto eliminado'}
                          </td>
                          <td className="p-3">
                            <span
                              className={`font-medium ${getMovementTypeColor(
                                item.tipo_movimiento
                              )}`}
                            >
                              {getMovementTypeLabel(item.tipo_movimiento)}
                            </span>
                          </td>
                          <td className="p-3">{item.cantidad_anterior}</td>
                          <td className="p-3">{item.cantidad_nueva}</td>
                          <td className="p-3">
                            <span
                              className={
                                item.cantidad_cambio > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : item.cantidad_cambio < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : ''
                              }
                            >
                              {item.cantidad_cambio > 0 ? '+' : ''}
                              {item.cantidad_cambio}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {item.motivo || '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={editingProduct}
        onProductUpdated={() => {
          fetchData()
          setEditDialogOpen(false)
        }}
      />
    </>
  )
}
