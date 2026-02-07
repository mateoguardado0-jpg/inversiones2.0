-- ============================================
-- Migración: Agregar campo fecha_vencimiento
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- Agregar columna fecha_vencimiento a la tabla productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;

-- Crear índice para mejorar búsquedas por fecha de vencimiento
CREATE INDEX IF NOT EXISTS productos_fecha_vencimiento_idx 
ON productos(fecha_vencimiento);

-- Comentario en la columna
COMMENT ON COLUMN productos.fecha_vencimiento IS 'Fecha de vencimiento del producto';
