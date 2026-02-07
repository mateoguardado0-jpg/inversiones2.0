'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { X, Trash2, Plus, Minus, ShoppingCart, Barcode, Edit2, FileText } from 'lucide-react'
import SmartProductSearch from './SmartProductSearch'
import InvoicePreview from './InvoicePreview'

interface Product {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  precio: number
  cantidad: number
  unidad_medida: string
  estado: string
  codigo_barras: string | null
}

interface InvoiceItem {
  producto: Product
  cantidad: number
  precio: number
  subtotal: number
}

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvoiceCreated: () => void
}

/**
 * Dialog para crear una nueva factura - Interfaz tipo POS Supermercado
 * Layout de dos columnas: productos a la izquierda, carrito a la derecha
 */
export default function CreateInvoiceDialog({
  open,
  onOpenChange,
  onInvoiceCreated,
}: CreateInvoiceDialogProps) {
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(1)
  const [showPreview, setShowPreview] = useState(false)
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchProducts()
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categoria && product.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.codigo_barras && product.codigo_barras.includes(searchTerm)) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const notInCart = !items.some(item => item.producto.id === product.id)
      const isActive = product.estado === 'activo'
      const hasStock = product.cantidad > 0
      
      return matchesSearch && notInCart && isActive && hasStock
    })
    setFilteredProducts(filtered.slice(0, 12))
  }, [searchTerm, products, items])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'activo')
        .gt('cantidad', 0)
        .order('nombre', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = (product: Product) => {
    const existingItem = items.find(item => item.producto.id === product.id)
    
    if (existingItem) {
      const newQuantity = existingItem.cantidad + 1
      if (newQuantity > product.cantidad) {
        setError(`Stock insuficiente. Disponible: ${product.cantidad} ${product.unidad_medida}`)
        setTimeout(() => setError(null), 3000)
        return
      }
      updateItemQuantity(product.id, newQuantity)
    } else {
      if (product.cantidad < 1) {
        setError(`Stock insuficiente para ${product.nombre}`)
        setTimeout(() => setError(null), 3000)
        return
      }
      const newItem: InvoiceItem = {
        producto: product,
        cantidad: 1,
        precio: product.precio,
        subtotal: product.precio,
      }
      setItems([...items, newItem])
      setError(null)
      // Activar modo edición para el nuevo item
      setEditingItemId(product.id)
      setEditQuantity(1)
    }
    setSearchTerm('')
  }

  const startEditing = (item: InvoiceItem) => {
    setEditingItemId(item.producto.id)
    setEditQuantity(item.cantidad)
  }

  const saveEdit = (productId: string) => {
    if (editQuantity < 1) {
      removeItem(productId)
    } else {
      updateItemQuantity(productId, editQuantity)
    }
    setEditingItemId(null)
  }

  const cancelEdit = () => {
    setEditingItemId(null)
  }

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    setItems(items.map(item => {
      if (item.producto.id === productId) {
        if (newQuantity > item.producto.cantidad) {
          setError(`Stock insuficiente. Disponible: ${item.producto.cantidad} ${item.producto.unidad_medida}`)
          setTimeout(() => setError(null), 3000)
          return item
        }
        if (newQuantity < 1) {
          removeItem(productId)
          return item
        }
        const updatedItem = {
          ...item,
          cantidad: newQuantity,
          subtotal: newQuantity * item.precio,
        }
        setError(null)
        return updatedItem
      }
      return item
    }))
  }

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.producto.id !== productId))
    setError(null)
    setEditingItemId(null)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const calculateItemsCount = () => {
    return items.reduce((sum, item) => sum + item.cantidad, 0)
  }

  const handleCreateInvoice = async () => {
    if (items.length === 0) {
      setError('Debes agregar al menos un producto a la factura')
      setTimeout(() => setError(null), 3000)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const invoiceItems = items.map(item => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
      }))

      const { data, error: functionError } = await supabase.rpc('crear_factura', {
        p_user_id: user.id,
        p_items: invoiceItems,
      })

      if (functionError) throw functionError

      if (data && data.length > 0 && data[0].error_message) {
        throw new Error(data[0].error_message)
      }

      // Guardar ID de factura creada para mostrar preview
      if (data && data.length > 0 && data[0].factura_id) {
        setCreatedInvoiceId(data[0].factura_id)
        setShowPreview(true)
      } else {
        setItems([])
        setSearchTerm('')
        onInvoiceCreated()
        onOpenChange(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear la factura')
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setItems([])
      setSearchTerm('')
      setError(null)
      setEditingItemId(null)
      setShowPreview(false)
      setCreatedInvoiceId(null)
      onOpenChange(false)
    }
  }

  const handlePreviewClose = () => {
    setShowPreview(false)
    setCreatedInvoiceId(null)
    setItems([])
    setSearchTerm('')
    onInvoiceCreated()
    onOpenChange(false)
  }

  const formatInvoiceNumber = () => {
    if (createdInvoiceId) {
      return `FAC-${createdInvoiceId.substring(0, 8).toUpperCase()}`
    }
    return `FAC-PREVIEW`
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Punto de Venta
          </DialogTitle>
          <DialogDescription>
            Sistema de facturación - Busca productos y agrégalos al carrito
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[calc(95vh-180px)] overflow-hidden">
          {/* Columna Izquierda - Productos */}
          <div className="flex-1 border-r p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
            {/* Barra de búsqueda inteligente */}
            <div className="mb-4">
              <SmartProductSearch
                onSelectProduct={handleAddProduct}
                excludeProductIds={items.map(item => item.producto.id)}
                placeholder="Buscar producto, código de barras o categoría..."
                autoFocus={true}
              />
              {error && (
                <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                  {error}
                </div>
              )}
            </div>

            {/* Grid de productos */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Cargando productos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? 'No se encontraron productos' : 'Escribe para buscar productos'}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary border-2"
                    onClick={() => handleAddProduct(product)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                          {product.nombre}
                        </div>
                        {product.categoria && (
                          <div className="text-xs text-muted-foreground">
                            {product.categoria}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <div className="text-lg font-bold text-primary">
                              ${product.precio.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Stock: {product.cantidad}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddProduct(product)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha - Carrito */}
          <div className="w-full md:w-96 flex flex-col border-t md:border-t-0 md:border-l bg-white dark:bg-gray-950">
            {/* Header del carrito */}
            <div className="p-4 border-b bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-semibold">Carrito</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {calculateItemsCount()} {calculateItemsCount() === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Lista de items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>El carrito está vacío</p>
                  <p className="text-sm mt-2">Busca y agrega productos</p>
                </div>
              ) : (
                items.map((item) => (
                  <Card 
                    key={item.producto.id} 
                    className={`border-2 transition-all ${
                      editingItemId === item.producto.id 
                        ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{item.producto.nombre}</div>
                            <div className="text-xs text-muted-foreground">
                              ${item.precio.toFixed(2)} c/u
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {editingItemId === item.producto.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                  onClick={() => saveEdit(item.producto.id)}
                                  title="Guardar"
                                >
                                  <span className="text-lg">✓</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-gray-600 hover:text-gray-700"
                                  onClick={cancelEdit}
                                  title="Cancelar"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                  onClick={() => startEditing(item)}
                                  title="Editar cantidad"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  onClick={() => removeItem(item.producto.id)}
                                  disabled={loading}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          {editingItemId === item.producto.id ? (
                            <div className="flex items-center gap-2 w-full">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={item.producto.cantidad}
                                value={editQuantity}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1
                                  setEditQuantity(Math.min(newQty, item.producto.cantidad))
                                }}
                                className="w-20 text-center h-8"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveEdit(item.producto.id)
                                  } else if (e.key === 'Escape') {
                                    cancelEdit()
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditQuantity(Math.min(item.producto.cantidad, editQuantity + 1))}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs text-muted-foreground ml-auto">
                                Max: {item.producto.cantidad}
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => updateItemQuantity(item.producto.id, item.cantidad - 1)}
                                  disabled={loading}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-12 text-center font-medium">
                                  {item.cantidad}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => updateItemQuantity(item.producto.id, item.cantidad + 1)}
                                  disabled={loading || item.cantidad >= item.producto.cantidad}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary">
                                  ${item.subtotal.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Stock: {item.producto.cantidad - item.cantidad}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Total y acciones */}
            <div className="border-t p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total:</span>
                <span className="text-3xl font-bold text-primary">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                {items.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Vista Previa
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleCreateInvoice}
                  disabled={loading || items.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {loading ? 'Procesando...' : 'Finalizar Venta'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Vista previa de factura */}
      {showPreview && (
        <InvoicePreview
          invoiceNumber={formatInvoiceNumber()}
          items={items.map(item => ({
            producto: {
              id: item.producto.id,
              nombre: item.producto.nombre,
              unidad_medida: item.producto.unidad_medida,
            },
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.subtotal,
          }))}
          total={calculateTotal()}
          onClose={createdInvoiceId ? handlePreviewClose : () => setShowPreview(false)}
          onSave={createdInvoiceId ? handlePreviewClose : undefined}
        />
      )}
    </Dialog>
  )
}
