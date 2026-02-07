'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Upload, Loader2, CheckCircle2, XCircle, Edit2, Save, X } from 'lucide-react'
import { SI_UNITS, getUnitsByCategory } from '@/lib/si-units'

/**
 * Interfaz para productos extraídos por IA
 */
interface ExtractedProduct {
  nombre: string
  cantidad: number
  precio: number
  categoria: string | null
  descripcion: string | null
  unidad_medida: string
  proveedor: string | null
  codigo_barras: string | null
  ubicacion: string | null
  fecha_vencimiento: string | null
}

/**
 * Componente para ingreso inteligente de productos usando IA
 * Permite subir facturas y extraer productos automáticamente
 */
export default function SmartImportContent() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  /**
   * Maneja la selección de archivo
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Tipo de archivo no soportado. Use imágenes (JPEG, PNG, WEBP) o PDF')
        return
      }

      // Validar tamaño (máximo 20MB)
      const maxSize = 20 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setError('El archivo es demasiado grande. Máximo 20MB')
        return
      }

      setFile(selectedFile)
      setError(null)
      setExtractedProducts([])
    }
  }

  /**
   * Envía el archivo a la API para extraer productos
   */
  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ai/import-products', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el archivo')
      }

      if (data.success) {
        if (data.productos && data.productos.length > 0) {
          setExtractedProducts(data.productos)
        } else {
          setError('No se encontraron productos en la factura. Asegúrate de que la imagen sea clara y contenga productos visibles.')
        }
      } else {
        throw new Error(data.error || 'No se pudieron extraer productos del archivo')
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo')
      console.error('Error en handleUpload:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualiza un producto en la lista de productos extraídos
   */
  const handleProductChange = (index: number, field: keyof ExtractedProduct, value: any) => {
    const updated = [...extractedProducts]
    updated[index] = { ...updated[index], [field]: value }
    setExtractedProducts(updated)
  }

  /**
   * Guarda todos los productos en el inventario
   * Crea productos nuevos o actualiza existentes sumando stock
   */
  const handleSaveAll = async () => {
    if (extractedProducts.length === 0) {
      setError('No hay productos para guardar')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      let createdCount = 0
      let updatedCount = 0

      // Procesar cada producto
      for (const product of extractedProducts) {
        // Buscar producto existente por nombre (case-insensitive)
        const { data: existingProducts } = await supabase
          .from('productos')
          .select('id, nombre, cantidad')
          .eq('user_id', user.id)
          .ilike('nombre', product.nombre)
          .limit(1)

        if (existingProducts && existingProducts.length > 0) {
          // Producto existe: actualizar cantidad sumando al stock existente
          const existingProduct = existingProducts[0]
          const newQuantity = existingProduct.cantidad + (product.cantidad || 1)

          const { error: updateError } = await supabase
            .from('productos')
            .update({
              cantidad: newQuantity,
              precio: product.precio || existingProduct.precio || 0,
              // Actualizar otros campos si están disponibles
              ...(product.categoria && { categoria: product.categoria }),
              ...(product.descripcion && { descripcion: product.descripcion }),
            })
            .eq('id', existingProduct.id)

          if (updateError) {
            console.error(`Error al actualizar producto ${product.nombre}:`, updateError)
            throw new Error(`Error al actualizar producto ${product.nombre}`)
          }

          updatedCount++
        } else {
          // Producto no existe: crear nuevo
          const { error: insertError } = await supabase
            .from('productos')
            .insert([
              {
                nombre: product.nombre,
                descripcion: product.descripcion || null,
                categoria: product.categoria || null,
                precio: product.precio || 0,
                cantidad: product.cantidad || 1,
                unidad_medida: product.unidad_medida || 'unidad',
                proveedor: product.proveedor || null,
                codigo_barras: product.codigo_barras || null,
                ubicacion: product.ubicacion || null,
                fecha_vencimiento: product.fecha_vencimiento || null,
                user_id: user.id,
              },
            ])

          if (insertError) {
            console.error(`Error al crear producto ${product.nombre}:`, insertError)
            throw new Error(`Error al crear producto ${product.nombre}`)
          }

          createdCount++
        }
      }

      // Mostrar mensaje de éxito
      const message = `¡Éxito! ${createdCount} producto(s) creado(s), ${updatedCount} producto(s) actualizado(s).`
      alert(message)

      // Limpiar estado
      setExtractedProducts([])
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Recargar la página para actualizar el inventario
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Error al guardar productos')
      console.error('Error en handleSaveAll:', err)
    } finally {
      setSaving(false)
    }
  }

  /**
   * Elimina un producto de la lista de productos extraídos
   */
  const handleRemoveProduct = (index: number) => {
    const updated = extractedProducts.filter((_, i) => i !== index)
    setExtractedProducts(updated)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Ingreso Inteligente de Productos
          </CardTitle>
          <CardDescription>
            Sube una imagen o PDF de una factura y la IA extraerá automáticamente los productos.
            Podrás revisar y editar la información antes de guardar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de archivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Seleccionar archivo (Imagen o PDF)</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Formatos soportados: JPEG, PNG, WEBP, PDF (máximo 20MB)
            </p>
          </div>

          {/* Botón de procesar */}
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando con IA...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Procesar Archivo
              </>
            )}
          </Button>

          {/* Mensaje de error */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Vista previa de archivo seleccionado */}
          {file && !loading && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm font-medium">Archivo seleccionado:</p>
              <p className="text-sm text-muted-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de productos extraídos */}
      {extractedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Extraídos ({extractedProducts.length})</CardTitle>
            <CardDescription>
              Revisa y edita la información antes de guardar. Los productos se agregarán al inventario.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {extractedProducts.map((product, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6">
                  {editingIndex === index ? (
                    // Modo edición
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nombre *</Label>
                          <Input
                            value={product.nombre}
                            onChange={(e) => handleProductChange(index, 'nombre', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Categoría</Label>
                          <Input
                            value={product.categoria || ''}
                            onChange={(e) => handleProductChange(index, 'categoria', e.target.value || null)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Input
                          value={product.descripcion || ''}
                          onChange={(e) => handleProductChange(index, 'descripcion', e.target.value || null)}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Precio *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={product.precio}
                            onChange={(e) => handleProductChange(index, 'precio', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cantidad *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={product.cantidad}
                            onChange={(e) => handleProductChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unidad de Medida</Label>
                          <Select
                            value={product.unidad_medida}
                            onChange={(e) => handleProductChange(index, 'unidad_medida', e.target.value)}
                          >
                            {Object.entries(getUnitsByCategory()).map(([category, units]) => (
                              <optgroup key={category} label={category}>
                                {units.map((unit) => (
                                  <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingIndex(null)}
                          variant="outline"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditingIndex(null)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo visualización
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{product.nombre}</h3>
                          {product.descripcion && (
                            <p className="text-sm text-muted-foreground">{product.descripcion}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingIndex(index)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cantidad:</span>
                          <p className="font-medium">{product.cantidad} {product.unidad_medida}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Precio:</span>
                          <p className="font-medium">${product.precio.toFixed(2)}</p>
                        </div>
                        {product.categoria && (
                          <div>
                            <span className="text-muted-foreground">Categoría:</span>
                            <p className="font-medium">{product.categoria}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <p className="font-medium">${(product.precio * product.cantidad).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSaveAll}
                disabled={saving || extractedProducts.length === 0}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Guardar Todos los Productos ({extractedProducts.length})
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExtractedProducts([])
                  setFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                disabled={saving}
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
