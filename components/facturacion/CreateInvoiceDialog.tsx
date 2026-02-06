'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { X, Trash2, Plus } from 'lucide-react'
import ProductSearch from './ProductSearch'

interface Product {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  precio: number
  cantidad: number
  unidad_medida: string
  estado: string
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
 * Dialog para crear una nueva factura
 * Permite buscar productos, agregarlos, validar stock y crear la factura
 */
export default function CreateInvoiceDialog({
  open,
  onOpenChange,
  onInvoiceCreated,
}: CreateInvoiceDialogProps) {
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleAddProduct = (product: Product) => {
    // Verificar si el producto ya está en la factura
    const existingItem = items.find(item => item.producto.id === product.id)
    
    if (existingItem) {
      // Si ya existe, aumentar cantidad si hay stock disponible
      const newQuantity = existingItem.cantidad + 1
      if (newQuantity > product.cantidad) {
        setError(`Stock insuficiente. Disponible: ${product.cantidad} ${product.unidad_medida}`)
        return
      }
      updateItemQuantity(product.id, newQuantity)
    } else {
      // Agregar nuevo producto con cantidad 1
      if (product.cantidad < 1) {
        setError(`Stock insuficiente para ${product.nombre}`)
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
    }
  }

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    setItems(items.map(item => {
      if (item.producto.id === productId) {
        // Validar stock antes de actualizar
        if (newQuantity > item.producto.cantidad) {
          setError(`Stock insuficiente. Disponible: ${item.producto.cantidad} ${item.producto.unidad_medida}`)
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
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleCreateInvoice = async () => {
    if (items.length === 0) {
      setError('Debes agregar al menos un producto a la factura')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Preparar items para la función PostgreSQL
      const invoiceItems = items.map(item => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
      }))

      // Llamar a la función PostgreSQL crear_factura
      const { data, error: functionError } = await supabase.rpc('crear_factura', {
        p_user_id: user.id,
        p_items: invoiceItems,
      })

      if (functionError) throw functionError

      // Verificar si hubo error en la función
      if (data && data.length > 0 && data[0].error_message) {
        throw new Error(data[0].error_message)
      }

      // Limpiar formulario
      setItems([])
      onInvoiceCreated()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Error al crear la factura')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setItems([])
      setError(null)
      onOpenChange(false)
    }
  }

  const excludeProductIds = items.map(item => item.producto.id)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Factura</DialogTitle>
          <DialogDescription>
            Busca productos del inventario y agrégalos a la factura. El stock se descontará automáticamente al confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          {/* Búsqueda de productos */}
          <ProductSearch
            onSelectProduct={handleAddProduct}
            excludeProductIds={excludeProductIds}
          />

          {/* Items de la factura */}
          {items.length > 0 && (
            <div className="space-y-4">
              <Label>Productos en la Factura</Label>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Producto</th>
                        <th className="text-left p-3 font-medium">Cantidad</th>
                        <th className="text-left p-3 font-medium">Precio Unit.</th>
                        <th className="text-left p-3 font-medium">Subtotal</th>
                        <th className="text-left p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.producto.id} className="border-b">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{item.producto.nombre}</div>
                              <div className="text-sm text-muted-foreground">
                                Stock disponible: {item.producto.cantidad} {item.producto.unidad_medida}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.producto.id, Math.max(1, item.cantidad - 1))}
                                disabled={loading}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={item.producto.cantidad}
                                value={item.cantidad}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1
                                  updateItemQuantity(item.producto.id, Math.min(newQty, item.producto.cantidad))
                                }}
                                className="w-20 text-center"
                                disabled={loading}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.producto.id, item.cantidad + 1)}
                                disabled={loading || item.cantidad >= item.producto.cantidad}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          <td className="p-3">${item.precio.toFixed(2)}</td>
                          <td className="p-3 font-medium">${item.subtotal.toFixed(2)}</td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.producto.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </CardContent>
              </Card>

              {/* Total */}
              <div className="flex justify-end">
                <Card className="w-64">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay productos en la factura.</p>
              <p className="text-sm mt-2">Busca y agrega productos usando el campo de búsqueda arriba.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCreateInvoice}
            disabled={loading || items.length === 0}
          >
            {loading ? 'Creando factura...' : 'Crear Factura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
