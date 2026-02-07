import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Cliente de Google Gemini AI
 * Configuración para integración con Gemini Vision
 */
let geminiClient: GoogleGenerativeAI | null = null

/**
 * Obtiene el cliente de Gemini
 * Solo se inicializa si la API key está configurada
 * 
 * Nota: En el servidor, puede usar GEMINI_API_KEY o NEXT_PUBLIC_GEMINI_API_KEY
 * En el cliente, solo NEXT_PUBLIC_GEMINI_API_KEY está disponible
 */
export function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('Gemini API key no configurada')
    return null
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey)
  }

  return geminiClient
}

/**
 * Función placeholder para futuras integraciones
 * Por ahora solo retorna null
 */
export async function generateText(prompt: string): Promise<string | null> {
  const client = getGeminiClient()
  
  if (!client) {
    return null
  }

  // TODO: Implementar lógica de generación de texto cuando sea necesario
  console.log('Gemini client inicializado, pero la lógica aún no está implementada')
  return null
}
