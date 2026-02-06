'use client'

import { useState, useEffect } from 'react'
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
  estado: string
}

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onProductUpdated: () => void
}

export default function EditProductDialog({
  open,
  onOpenChange,
  product,
  onProductUpdated,
}: EditProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    cantidad: '',
    unidad_medida: 'unidad',
    proveedor: '',
    codigo_barras: '',
    ubicacion: '',
    estado: 'activo',
  })

  const supabase = createClient()

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        categoria: product.categoria || '',
        precio: product.precio?.toString() || '0',
        cantidad: product.cantidad?.toString() || '0',
        unidad_medida: product.unidad_medida || 'unidad',
        proveedor: product.proveedor || '',
        codigo_barras: product.codigo_barras || '',
        ubicacion: product.ubicacion || '',
        estado: product.estado || 'activo',
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('productos')
        .update({
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          categoria: formData.categoria || null,
          precio: parseFloat(formData.precio) || 0,
          cantidad: parseInt(formData.cantidad) || 0,
          unidad_medida: formData.unidad_medida,
          proveedor: formData.proveedor || null,
          codigo_barras: formData.codigo_barras || null,
          ubicacion: formData.ubicacion || null,
          estado: formData.estado,
        })
        .eq('id', product.id)

      if (updateError) throw updateError

      onProductUpdated()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar producto')
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifica la información del producto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre *</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
                placeholder="Nombre del producto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-categoria">Categoría</Label>
              <Input
                id="edit-categoria"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                placeholder="Ej: Electrónica, Ropa, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-descripcion">Descripción</Label>
            <Input
              id="edit-descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-precio">Precio *</Label>
              <Input
                id="edit-precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: e.target.value })
                }
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cantidad">Cantidad *</Label>
              <Input
                id="edit-cantidad"
                type="number"
                min="0"
                value={formData.cantidad}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad: e.target.value })
                }
                required
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-unidad_medida">Unidad de Medida</Label>
              <Input
                id="edit-unidad_medida"
                value={formData.unidad_medida}
                onChange={(e) =>
                  setFormData({ ...formData, unidad_medida: e.target.value })
                }
                placeholder="unidad, kg, litro, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-proveedor">Proveedor</Label>
              <Input
                id="edit-proveedor"
                value={formData.proveedor}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
                placeholder="Nombre del proveedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-codigo_barras">Código de Barras</Label>
              <Input
                id="edit-codigo_barras"
                value={formData.codigo_barras}
                onChange={(e) =>
                  setFormData({ ...formData, codigo_barras: e.target.value })
                }
                placeholder="Código de barras"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ubicacion">Ubicación</Label>
              <Input
                id="edit-ubicacion"
                value={formData.ubicacion}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacion: e.target.value })
                }
                placeholder="Ubicación en almacén"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <select
                id="edit-estado"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
