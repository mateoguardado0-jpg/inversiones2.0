'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Printer, Download, Settings, X } from 'lucide-react'
import { useState } from 'react'

interface InvoiceItem {
  producto: {
    id: string
    nombre: string
    unidad_medida: string
  }
  cantidad: number
  precio: number
  subtotal: number
}

interface InvoicePreviewProps {
  invoiceNumber: string
  items: InvoiceItem[]
  total: number
  onClose: () => void
  onSave?: () => void
}

/**
 * Vista previa de factura con opciones de impresión y PDF
 */
export default function InvoicePreview({
  invoiceNumber,
  items,
  total,
  onClose,
  onSave,
}: InvoicePreviewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [printSettings, setPrintSettings] = useState({
    showHeader: true,
    showFooter: true,
    showDate: true,
    fontSize: 'normal',
  })

  const formatDate = () => {
    return new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSavePDF = async () => {
    if (!invoiceRef.current) return

    try {
      // Crear una ventana nueva para generar el PDF
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Por favor, permite ventanas emergentes para generar el PDF')
        return
      }

      // Obtener el contenido HTML de la factura
      const invoiceContent = invoiceRef.current.innerHTML

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>Factura ${invoiceNumber}</title>
            <style>
              @page {
                size: A4;
                margin: 1.5cm;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Arial', 'Helvetica', sans-serif;
                font-size: ${printSettings.fontSize === 'small' ? '10pt' : printSettings.fontSize === 'large' ? '14pt' : '12pt'};
                line-height: 1.6;
                color: #000;
                background: white;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                border-bottom: 3px solid #000;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                font-size: 28pt;
                font-weight: bold;
                margin-bottom: 15px;
                text-transform: uppercase;
              }
              .info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              .info div {
                font-size: ${printSettings.fontSize === 'small' ? '9pt' : printSettings.fontSize === 'large' ? '13pt' : '11pt'};
              }
              .info .font-semibold {
                font-weight: bold;
                margin-bottom: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                border: 2px solid #000;
              }
              th {
                background-color: #f0f0f0;
                border: 1px solid #000;
                padding: 12px 8px;
                text-align: left;
                font-weight: bold;
                font-size: ${printSettings.fontSize === 'small' ? '9pt' : printSettings.fontSize === 'large' ? '13pt' : '11pt'};
              }
              td {
                border: 1px solid #000;
                padding: 10px 8px;
                font-size: ${printSettings.fontSize === 'small' ? '9pt' : printSettings.fontSize === 'large' ? '13pt' : '11pt'};
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .font-medium {
                font-weight: bold;
              }
              .total {
                text-align: right;
                font-size: ${printSettings.fontSize === 'small' ? '16pt' : printSettings.fontSize === 'large' ? '22pt' : '18pt'};
                font-weight: bold;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 3px solid #000;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #666;
                text-align: center;
                font-size: ${printSettings.fontSize === 'small' ? '8pt' : printSettings.fontSize === 'large' ? '12pt' : '10pt'};
                color: #666;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                .no-print {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body>
            ${invoiceContent}
          </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Esperar a que cargue completamente
      printWindow.onload = () => {
        setTimeout(() => {
          // Usar el diálogo de impresión del navegador para guardar como PDF
          printWindow.print()
          // Cerrar la ventana después de un tiempo
          setTimeout(() => {
            printWindow.close()
          }, 1000)
        }, 500)
      }

      if (onSave) {
        onSave()
      }
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar PDF. Por favor, usa la opción de imprimir y selecciona "Guardar como PDF" en el diálogo de impresión.')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 print:p-0 print:bg-white">
      <Card className="w-full max-w-4xl bg-white print:shadow-none print:border-0">
        <div className="p-6 print:p-8">
          {/* Controles (ocultos al imprimir) */}
          <div className="flex justify-between items-center mb-6 print:hidden border-b pb-4">
            <h2 className="text-2xl font-bold">Vista Previa de Factura</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSavePDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Guardar PDF
              </Button>
              <Button
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Panel de configuración */}
          {showSettings && (
            <Card className="mb-4 print:hidden">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printSettings.showHeader}
                        onChange={(e) =>
                          setPrintSettings({ ...printSettings, showHeader: e.target.checked })
                        }
                      />
                      <span>Mostrar encabezado</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printSettings.showFooter}
                        onChange={(e) =>
                          setPrintSettings({ ...printSettings, showFooter: e.target.checked })
                        }
                      />
                      <span>Mostrar pie de página</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printSettings.showDate}
                        onChange={(e) =>
                          setPrintSettings({ ...printSettings, showDate: e.target.checked })
                        }
                      />
                      <span>Mostrar fecha</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <span>Tamaño de fuente:</span>
                      <select
                        value={printSettings.fontSize}
                        onChange={(e) =>
                          setPrintSettings({ ...printSettings, fontSize: e.target.value })
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="small">Pequeña</option>
                        <option value="normal">Normal</option>
                        <option value="large">Grande</option>
                      </select>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenido de la factura */}
          <div
            ref={invoiceRef}
            className={`space-y-6 ${
              printSettings.fontSize === 'small' ? 'text-sm' :
              printSettings.fontSize === 'large' ? 'text-lg' : ''
            }`}
          >
            {/* Encabezado */}
            {printSettings.showHeader && (
              <div className="border-b-2 border-gray-800 pb-4">
                <h1 className="text-3xl font-bold mb-4">FACTURA</h1>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold">Número de Factura:</div>
                    <div>{invoiceNumber}</div>
                  </div>
                  {printSettings.showDate && (
                    <div>
                      <div className="font-semibold">Fecha y Hora:</div>
                      <div>{formatDate()}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tabla de items */}
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left p-3 font-semibold">Producto</th>
                    <th className="text-center p-3 font-semibold">Cantidad</th>
                    <th className="text-right p-3 font-semibold">Precio Unit.</th>
                    <th className="text-right p-3 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.producto.nombre}</td>
                      <td className="p-3 text-center">
                        {item.cantidad} {item.producto.unidad_medida}
                      </td>
                      <td className="p-3 text-right">${item.precio.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-lg font-semibold border-t-2 border-gray-800 pt-4">
                  <span>TOTAL:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            {printSettings.showFooter && (
              <div className="border-t pt-4 text-sm text-muted-foreground text-center">
                <p>Gracias por su compra</p>
                {printSettings.showDate && (
                  <p className="mt-2">Factura generada el {formatDate()}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-8,
          .print\\:p-8 * {
            visibility: visible;
          }
          .print\\:p-8 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  )
}
