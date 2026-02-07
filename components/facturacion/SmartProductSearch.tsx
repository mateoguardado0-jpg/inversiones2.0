'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Package, ArrowDown, ArrowUp } from 'lucide-react'

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

interface SmartProductSearchProps {
  onSelectProduct: (product: Product) => void
  excludeProductIds?: string[]
  placeholder?: string
  autoFocus?: boolean
}

/**
 * Componente de búsqueda inteligente con autocompletado
 * Muestra sugerencias mientras el usuario escribe
 */
export default function SmartProductSearch({
  onSelectProduct,
  excludeProductIds = [],
  placeholder = "Buscar producto...",
  autoFocus = false,
}: SmartProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm.length >= 1) {
      // Filtrar productos con búsqueda inteligente
      const filtered = products.filter(product => {
        const searchLower = searchTerm.toLowerCase()
        const nombreMatch = product.nombre.toLowerCase().includes(searchLower)
        const categoriaMatch = product.categoria?.toLowerCase().includes(searchLower)
        const codigoMatch = product.codigo_barras?.includes(searchTerm)
        const descripcionMatch = product.descripcion?.toLowerCase().includes(searchLower)
        
        const matches = nombreMatch || categoriaMatch || codigoMatch || descripcionMatch
        const notExcluded = !excludeProductIds.includes(product.id)
        const isActive = product.estado === 'activo'
        const hasStock = product.cantidad > 0
        
        return matches && notExcluded && isActive && hasStock
      })
      
      // Ordenar por relevancia (nombre que empieza con el término primero)
      const sorted = filtered.sort((a, b) => {
        const aStarts = a.nombre.toLowerCase().startsWith(searchTerm.toLowerCase()) ? -1 : 0
        const bStarts = b.nombre.toLowerCase().startsWith(searchTerm.toLowerCase()) ? -1 : 0
        return aStarts - bStarts || a.nombre.localeCompare(b.nombre)
      })
      
      setSuggestions(sorted.slice(0, 8)) // Máximo 8 sugerencias
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
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
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Scroll a la sugerencia seleccionada
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 1 && setShowSuggestions(true)}
          onBlur={() => {
            // Delay para permitir clicks en sugerencias
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          className="pl-10 h-12 text-lg"
          autoFocus={autoFocus}
        />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => {
              setSearchTerm('')
              setShowSuggestions(false)
              inputRef.current?.focus()
            }}
          >
            <span className="text-lg">×</span>
          </Button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg border-2">
          <CardContent className="p-0">
            <div ref={suggestionsRef} className="divide-y">
              {suggestions.map((product, index) => (
                <div
                  key={product.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleSelect(product)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{product.nombre}</span>
                        {product.categoria && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {product.categoria}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                        <span>Stock: {product.cantidad} {product.unidad_medida}</span>
                        <span className="font-semibold text-primary">
                          ${product.precio.toFixed(2)}
                        </span>
                        {product.codigo_barras && (
                          <span className="text-xs">Código: {product.codigo_barras}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(product)
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 text-xs text-muted-foreground bg-muted/50 text-center border-t">
              Usa ↑↓ para navegar, Enter para seleccionar, Esc para cerrar
            </div>
          </CardContent>
        </Card>
      )}

      {showSuggestions && searchTerm.length >= 1 && suggestions.length === 0 && !loading && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border-2">
          <CardContent className="p-4 text-center text-muted-foreground">
            No se encontraron productos
          </CardContent>
        </Card>
      )}
    </div>
  )
}
