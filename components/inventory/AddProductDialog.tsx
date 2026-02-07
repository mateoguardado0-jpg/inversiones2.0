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
import { Select } from '@/components/ui/select'
import { SI_UNITS, getUnitsByCategory } from '@/lib/si-units'

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductAdded: () => void
}

export default function AddProductDialog({
  open,
  onOpenChange,
  onProductAdded,
}: AddProductDialogProps) {
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
    fecha_vencimiento: '',
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const { error: insertError } = await supabase
        .from('productos')
        .insert([
          {
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
            categoria: formData.categoria || null,
            precio: parseFloat(formData.precio) || 0,
            cantidad: parseInt(formData.cantidad) || 0,
            unidad_medida: formData.unidad_medida,
            proveedor: formData.proveedor || null,
            codigo_barras: formData.codigo_barras || null,
            ubicacion: formData.ubicacion || null,
            fecha_vencimiento: formData.fecha_vencimiento || null,
            user_id: user.id,
          },
        ])

      if (insertError) throw insertError

      // Reset form
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: '',
        cantidad: '',
        unidad_medida: 'unidad',
        proveedor: '',
        codigo_barras: '',
        ubicacion: '',
        fecha_vencimiento: '',
      })

      onProductAdded()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Error al agregar producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Producto</DialogTitle>
          <DialogDescription>
            Completa los campos para agregar un nuevo producto al inventario.
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
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
                placeholder="Nombre del producto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                placeholder="Ej: Electrónica, Ropa, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio *</Label>
              <Input
                id="precio"
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
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
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
              <Label htmlFor="unidad_medida">Unidad de Medida (SI)</Label>
              <Select
                id="unidad_medida"
                value={formData.unidad_medida}
                onChange={(e) =>
                  setFormData({ ...formData, unidad_medida: e.target.value })
                }
              >
                {Object.entries(getUnitsByCategory()).map(([category, units]) => (
                  <optgroup key={category} label={category}>
                    {units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label} {unit.description ? `- ${unit.description}` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                value={formData.proveedor}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
                placeholder="Nombre del proveedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo_barras">Código de Barras</Label>
              <Input
                id="codigo_barras"
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
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacion: e.target.value })
                }
                placeholder="Ubicación en almacén"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_vencimiento: e.target.value })
                }
              />
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
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
