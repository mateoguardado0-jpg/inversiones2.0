'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Package } from 'lucide-react'

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

interface ProductSearchProps {
  onSelectProduct: (product: Product) => void
  excludeProductIds?: string[]
}

/**
 * Componente de búsqueda de productos
 * Permite buscar y seleccionar productos del inventario
 */
export default function ProductSearch({ onSelectProduct, excludeProductIds = [] }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Filtrar productos por término de búsqueda y excluir productos ya agregados
    const filtered = products.filter(product => {
      const matchesSearch = 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categoria && product.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const notExcluded = !excludeProductIds.includes(product.id)
      const isActive = product.estado === 'activo'
      const hasStock = product.cantidad > 0
      
      return matchesSearch && notExcluded && isActive && hasStock
    })
    setFilteredProducts(filtered)
  }, [searchTerm, products, excludeProductIds])

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

  const handleSelect = (product: Product) => {
    onSelectProduct(product)
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Buscar Producto</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Buscar por nombre, categoría o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {searchTerm && (
        <div className="max-h-60 overflow-y-auto border rounded-md">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Cargando productos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No se encontraron productos
            </div>
          ) : (
            <div className="divide-y">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="border-0 rounded-none cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelect(product)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{product.nombre}</span>
                        </div>
                        {product.categoria && (
                          <span className="text-sm text-muted-foreground">
                            {product.categoria}
                          </span>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">
                          Stock: {product.cantidad} {product.unidad_medida} | 
                          Precio: ${product.precio.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(product)
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
