'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Printer, X } from 'lucide-react'

interface InvoiceItem {
  id: string
  producto_id: string
  cantidad: number
  precio: number
  subtotal: number
  productos: {
    id: string
    nombre: string
    unidad_medida: string
  }
}

interface Invoice {
  id: string
  total: number
  created_at: string
  items: InvoiceItem[]
}

interface InvoicePrintViewProps {
  invoice: Invoice
  invoiceNumber: string
  onClose: () => void
}

/**
 * Vista de impresión de factura
 */
export default function InvoicePrintView({ invoice, invoiceNumber, onClose }: InvoicePrintViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:p-0 print:bg-white">
      <Card className="w-full max-w-2xl bg-white print:shadow-none print:border-0">
        <div className="p-6 print:p-8">
          {/* Header con botones (oculto al imprimir) */}
          <div className="flex justify-between items-center mb-6 print:hidden">
            <h2 className="text-2xl font-bold">Vista de Impresión</h2>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenido de la factura */}
          <div className="space-y-6">
            {/* Encabezado */}
            <div className="border-b pb-4">
              <h1 className="text-3xl font-bold mb-2">FACTURA</h1>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Número de Factura:</div>
                  <div>{invoiceNumber}</div>
                </div>
                <div>
                  <div className="font-semibold">Fecha:</div>
                  <div>{formatDate(invoice.created_at)}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left p-2 font-semibold">Producto</th>
                    <th className="text-center p-2 font-semibold">Cantidad</th>
                    <th className="text-right p-2 font-semibold">Precio Unit.</th>
                    <th className="text-right p-2 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => {
                    const producto = item.productos as any
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{producto?.nombre || 'Producto eliminado'}</td>
                        <td className="p-2 text-center">
                          {item.cantidad} {producto?.unidad_medida || 'unidad'}
                        </td>
                        <td className="p-2 text-right">${item.precio.toFixed(2)}</td>
                        <td className="p-2 text-right font-medium">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-lg font-semibold border-t-2 border-gray-800 pt-2">
                  <span>TOTAL:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            <div className="border-t pt-4 text-sm text-muted-foreground text-center">
              <p>Gracias por su compra</p>
              <p className="mt-2">Factura generada el {formatDate(invoice.created_at)}</p>
            </div>
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
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  )
}
