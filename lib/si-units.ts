/**
 * Unidades del Sistema Internacional (SI) y unidades comunes para inventario
 * Organizadas por categorías para facilitar la selección
 */

export interface SIUnit {
  value: string
  label: string
  category: string
  description?: string
}

export const SI_UNITS: SIUnit[] = [
  // Unidades base del SI
  { value: 'm', label: 'm (metro)', category: 'Longitud', description: 'Unidad base de longitud' },
  { value: 'kg', label: 'kg (kilogramo)', category: 'Masa', description: 'Unidad base de masa' },
  { value: 's', label: 's (segundo)', category: 'Tiempo', description: 'Unidad base de tiempo' },
  { value: 'A', label: 'A (amperio)', category: 'Corriente eléctrica', description: 'Unidad base de corriente' },
  { value: 'K', label: 'K (kelvin)', category: 'Temperatura', description: 'Unidad base de temperatura' },
  { value: 'mol', label: 'mol (mol)', category: 'Cantidad de sustancia', description: 'Unidad base de cantidad' },
  { value: 'cd', label: 'cd (candela)', category: 'Intensidad luminosa', description: 'Unidad base de intensidad' },
  
  // Longitud
  { value: 'mm', label: 'mm (milímetro)', category: 'Longitud' },
  { value: 'cm', label: 'cm (centímetro)', category: 'Longitud' },
  { value: 'dm', label: 'dm (decímetro)', category: 'Longitud' },
  { value: 'km', label: 'km (kilómetro)', category: 'Longitud' },
  
  // Masa
  { value: 'g', label: 'g (gramo)', category: 'Masa' },
  { value: 'mg', label: 'mg (miligramo)', category: 'Masa' },
  { value: 't', label: 't (tonelada)', category: 'Masa', description: '1000 kg' },
  
  // Volumen
  { value: 'L', label: 'L (litro)', category: 'Volumen', description: '1 L = 1 dm³' },
  { value: 'mL', label: 'mL (mililitro)', category: 'Volumen' },
  { value: 'm³', label: 'm³ (metro cúbico)', category: 'Volumen' },
  { value: 'cm³', label: 'cm³ (centímetro cúbico)', category: 'Volumen' },
  { value: 'dm³', label: 'dm³ (decímetro cúbico)', category: 'Volumen' },
  
  // Área
  { value: 'm²', label: 'm² (metro cuadrado)', category: 'Área' },
  { value: 'cm²', label: 'cm² (centímetro cuadrado)', category: 'Área' },
  { value: 'km²', label: 'km² (kilómetro cuadrado)', category: 'Área' },
  { value: 'ha', label: 'ha (hectárea)', category: 'Área', description: '10,000 m²' },
  
  // Unidades derivadas comunes
  { value: 'N', label: 'N (newton)', category: 'Fuerza', description: 'kg·m/s²' },
  { value: 'Pa', label: 'Pa (pascal)', category: 'Presión', description: 'N/m²' },
  { value: 'J', label: 'J (joule)', category: 'Energía', description: 'N·m' },
  { value: 'W', label: 'W (vatio)', category: 'Potencia', description: 'J/s' },
  { value: 'V', label: 'V (voltio)', category: 'Tensión eléctrica', description: 'W/A' },
  { value: 'Hz', label: 'Hz (hercio)', category: 'Frecuencia', description: '1/s' },
  
  // Unidades comunes en inventario (no SI pero ampliamente usadas)
  { value: 'unidad', label: 'unidad', category: 'Cantidad', description: 'Unidad de conteo' },
  { value: 'pieza', label: 'pieza', category: 'Cantidad' },
  { value: 'par', label: 'par', category: 'Cantidad' },
  { value: 'docena', label: 'docena', category: 'Cantidad', description: '12 unidades' },
  { value: 'caja', label: 'caja', category: 'Cantidad' },
  { value: 'paquete', label: 'paquete', category: 'Cantidad' },
  { value: 'rollo', label: 'rollo', category: 'Cantidad' },
  { value: 'metro lineal', label: 'metro lineal', category: 'Longitud' },
]

export const UNIT_CATEGORIES = [
  'Longitud',
  'Masa',
  'Volumen',
  'Área',
  'Tiempo',
  'Cantidad',
  'Fuerza',
  'Presión',
  'Energía',
  'Potencia',
  'Tensión eléctrica',
  'Frecuencia',
  'Temperatura',
  'Corriente eléctrica',
  'Cantidad de sustancia',
  'Intensidad luminosa',
]

/**
 * Obtiene las unidades agrupadas por categoría
 * Ordenadas con las categorías más comunes en inventario primero
 */
export function getUnitsByCategory(): Record<string, SIUnit[]> {
  const grouped: Record<string, SIUnit[]> = {}
  
  SI_UNITS.forEach(unit => {
    if (!grouped[unit.category]) {
      grouped[unit.category] = []
    }
    grouped[unit.category].push(unit)
  })
  
  // Ordenar categorías: las más comunes en inventario primero
  const categoryOrder = [
    'Cantidad',
    'Masa',
    'Volumen',
    'Longitud',
    'Área',
    'Tiempo',
    'Temperatura',
    'Fuerza',
    'Presión',
    'Energía',
    'Potencia',
    'Tensión eléctrica',
    'Frecuencia',
    'Corriente eléctrica',
    'Cantidad de sustancia',
    'Intensidad luminosa',
  ]
  
  const ordered: Record<string, SIUnit[]> = {}
  categoryOrder.forEach(category => {
    if (grouped[category]) {
      ordered[category] = grouped[category]
    }
  })
  
  // Agregar cualquier categoría que no esté en el orden
  Object.keys(grouped).forEach(category => {
    if (!ordered[category]) {
      ordered[category] = grouped[category]
    }
  })
  
  return ordered
}

/**
 * Busca una unidad por su valor
 */
export function findUnitByValue(value: string): SIUnit | undefined {
  return SI_UNITS.find(unit => unit.value === value)
}
