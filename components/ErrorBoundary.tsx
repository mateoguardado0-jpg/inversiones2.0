'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-destructive">
                ⚠️ Error en la Aplicación
              </CardTitle>
              <CardDescription>
                Ha ocurrido un error inesperado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
                <p className="font-semibold mb-2">Detalles del error:</p>
                <p className="text-xs font-mono break-all">
                  {this.state.error?.message || 'Error desconocido'}
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong>Posibles causas:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Variables de entorno no configuradas en Vercel</li>
                  <li>Problema de conexión con Supabase</li>
                  <li>Error en la configuración de la aplicación</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                    window.location.reload()
                  }}
                  className="flex-1"
                >
                  Recargar Página
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/login'}
                  className="flex-1"
                >
                  Ir al Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
