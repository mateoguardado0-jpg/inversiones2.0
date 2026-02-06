-- ============================================
-- Script de configuración de Inventario
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cantidad INTEGER NOT NULL DEFAULT 0,
  unidad_medida TEXT DEFAULT 'unidad',
  proveedor TEXT,
  codigo_barras TEXT,
  ubicacion TEXT,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'agotado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Crear tabla de historial de inventario
CREATE TABLE IF NOT EXISTS historial_inventario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
  tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste', 'creacion', 'edicion', 'eliminacion')),
  cantidad_anterior INTEGER NOT NULL DEFAULT 0,
  cantidad_nueva INTEGER NOT NULL DEFAULT 0,
  cantidad_cambio INTEGER NOT NULL DEFAULT 0,
  motivo TEXT,
  notas TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_inventario ENABLE ROW LEVEL SECURITY;

-- Políticas para productos
-- Los usuarios pueden leer sus propios productos
CREATE POLICY "Users can read own products"
  ON productos FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propios productos
CREATE POLICY "Users can insert own products"
  ON productos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios productos
CREATE POLICY "Users can update own products"
  ON productos FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios productos
CREATE POLICY "Users can delete own products"
  ON productos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para historial
-- Los usuarios pueden leer el historial de sus productos
CREATE POLICY "Users can read own inventory history"
  ON historial_inventario FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar en su historial
CREATE POLICY "Users can insert own inventory history"
  ON historial_inventario FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en productos
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear registro en historial al crear producto
CREATE OR REPLACE FUNCTION create_inventory_history_on_product_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO historial_inventario (
    producto_id,
    tipo_movimiento,
    cantidad_anterior,
    cantidad_nueva,
    cantidad_cambio,
    motivo,
    user_id
  ) VALUES (
    NEW.id,
    'creacion',
    0,
    NEW.cantidad,
    NEW.cantidad,
    'Producto creado',
    NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear historial al crear producto
CREATE TRIGGER on_producto_created
  AFTER INSERT ON productos
  FOR EACH ROW
  EXECUTE FUNCTION create_inventory_history_on_product_create();

-- Función para crear registro en historial al actualizar producto
CREATE OR REPLACE FUNCTION create_inventory_history_on_product_update()
RETURNS TRIGGER AS $$
DECLARE
  cantidad_cambio INTEGER;
BEGIN
  cantidad_cambio := NEW.cantidad - OLD.cantidad;
  
  IF cantidad_cambio != 0 THEN
    INSERT INTO historial_inventario (
      producto_id,
      tipo_movimiento,
      cantidad_anterior,
      cantidad_nueva,
      cantidad_cambio,
      motivo,
      user_id
    ) VALUES (
      NEW.id,
      CASE 
        WHEN cantidad_cambio > 0 THEN 'entrada'
        WHEN cantidad_cambio < 0 THEN 'salida'
        ELSE 'ajuste'
      END,
      OLD.cantidad,
      NEW.cantidad,
      cantidad_cambio,
      'Actualización de producto',
      NEW.user_id
    );
  ELSE
    -- Si solo cambió información pero no cantidad, registrar como edición
    INSERT INTO historial_inventario (
      producto_id,
      tipo_movimiento,
      cantidad_anterior,
      cantidad_nueva,
      cantidad_cambio,
      motivo,
      user_id
    ) VALUES (
      NEW.id,
      'edicion',
      OLD.cantidad,
      NEW.cantidad,
      0,
      'Edición de información del producto',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear historial al actualizar producto
CREATE TRIGGER on_producto_updated
  AFTER UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION create_inventory_history_on_product_update();

-- Función para crear registro en historial al eliminar producto
CREATE OR REPLACE FUNCTION create_inventory_history_on_product_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO historial_inventario (
    producto_id,
    tipo_movimiento,
    cantidad_anterior,
    cantidad_nueva,
    cantidad_cambio,
    motivo,
    user_id
  ) VALUES (
    OLD.id,
    'eliminacion',
    OLD.cantidad,
    0,
    -OLD.cantidad,
    'Producto eliminado',
    OLD.user_id
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear historial al eliminar producto
CREATE TRIGGER on_producto_deleted
  BEFORE DELETE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION create_inventory_history_on_product_delete();

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS productos_user_id_idx ON productos(user_id);
CREATE INDEX IF NOT EXISTS productos_categoria_idx ON productos(categoria);
CREATE INDEX IF NOT EXISTS productos_estado_idx ON productos(estado);
CREATE INDEX IF NOT EXISTS historial_producto_id_idx ON historial_inventario(producto_id);
CREATE INDEX IF NOT EXISTS historial_user_id_idx ON historial_inventario(user_id);
CREATE INDEX IF NOT EXISTS historial_created_at_idx ON historial_inventario(created_at DESC);
