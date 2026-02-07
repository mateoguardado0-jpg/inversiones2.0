import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Endpoint para importar productos desde facturas usando Gemini Vision
 * POST /api/ai/import-products
 * 
 * Body: FormData con un archivo (imagen o PDF)
 * 
 * Retorna: JSON con lista de productos extraídos
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar API key de Gemini
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de Gemini no configurada' },
        { status: 500 }
      )
    }

    // Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no soportado. Use imágenes (JPEG, PNG, WEBP) o PDF' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 20MB)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 20MB' },
        { status: 400 }
      )
    }

    // Convertir archivo a base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString('base64')
    const mimeType = file.type

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Prompt optimizado para extraer productos de facturas
    const prompt = `Eres un asistente experto en lectura de facturas comerciales.
Extrae únicamente productos.

Reglas:
- Devuelve SOLO JSON
- No agregues texto extra
- Si un campo no existe, colócalo como null
- Normaliza nombres de productos
- Devuelve una lista de productos

Formato esperado:
[
  { "name": string, "quantity": number, "price": number }
]`

    // Preparar la imagen
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    }

    // Llamar a Gemini Vision
    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()

    // Extraer JSON de la respuesta
    let productosArray: Array<{ name: string; quantity: number; price: number }>
    try {
      // Limpiar la respuesta: remover markdown code blocks si existen
      let cleanedText = text.trim()
      
      // Remover ```json y ``` si están presentes
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
      cleanedText = cleanedText.replace(/\s*```$/i, '')
      cleanedText = cleanedText.trim()
      
      // Intentar encontrar array JSON en la respuesta
      const arrayMatch = cleanedText.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        productosArray = JSON.parse(arrayMatch[0])
      } else {
        // Si no hay array, intentar parsear toda la respuesta
        productosArray = JSON.parse(cleanedText)
      }

      // Validar que sea un array
      if (!Array.isArray(productosArray)) {
        throw new Error('La respuesta no es un array')
      }

      // Validar que el array no esté vacío y tenga la estructura correcta
      if (productosArray.length === 0) {
        return NextResponse.json({
          success: true,
          productos: [],
          total: 0,
          message: 'No se encontraron productos en la factura'
        })
      }
    } catch (parseError) {
      console.error('Error al parsear respuesta de Gemini:', parseError)
      console.error('Respuesta recibida:', text)
      return NextResponse.json(
        { 
          error: 'Error al procesar la respuesta de la IA. Asegúrate de que la factura contenga productos visibles.',
          rawResponse: text.substring(0, 500) // Limitar tamaño de respuesta para no sobrecargar
        },
        { status: 500 }
      )
    }

    // Normalizar productos al formato interno
    const productosNormalizados = productosArray
      .filter((producto: any) => producto && producto.name) // Filtrar productos inválidos
      .map((producto: any) => {
        // Normalizar nombre: trim y capitalizar primera letra
        const nombreNormalizado = (producto.name || 'Producto sin nombre')
          .trim()
          .replace(/^\w/, (c: string) => c.toUpperCase())
        
        return {
          nombre: nombreNormalizado,
          cantidad: Math.max(1, Math.floor(Number(producto.quantity) || 1)), // Mínimo 1, sin decimales
          precio: Math.max(0, Number(producto.price) || 0), // Mínimo 0
          categoria: null,
          descripcion: null,
          unidad_medida: 'unidad', // Por defecto
          proveedor: null,
          codigo_barras: null,
          ubicacion: null,
          fecha_vencimiento: null,
        }
      })

    return NextResponse.json({
      success: true,
      productos: productosNormalizados,
      total: productosNormalizados.length,
    })

  } catch (error: any) {
    console.error('Error en import-products:', error)
    return NextResponse.json(
      {
        error: 'Error al procesar el archivo',
        message: error.message || 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
