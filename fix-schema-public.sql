-- ============================================
-- Script para corregir el error "Invalid schema: public"
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- 1. Asegurar que el esquema public existe y está habilitado
CREATE SCHEMA IF NOT EXISTS public;

-- 2. Otorgar permisos necesarios al esquema public
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Asegurar que las tablas existentes estén en el esquema public
-- (Si las tablas ya existen, esto no las moverá, solo verifica)

-- 4. Verificar y crear la tabla productos si no existe
CREATE TABLE IF NOT EXISTS public.productos (
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
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'agotado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- 5. Verificar y crear la tabla historial_inventario si no existe
CREATE TABLE IF NOT EXISTS public.historial_inventario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE NOT NULL,
  tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste', 'creacion', 'edicion', 'eliminacion')),
  cantidad_anterior INTEGER NOT NULL DEFAULT 0,
  cantidad_nueva INTEGER NOT NULL DEFAULT 0,
  cantidad_cambio INTEGER NOT NULL DEFAULT 0,
  motivo TEXT,
  notas TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Otorgar permisos en las tablas
GRANT ALL ON public.productos TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.historial_inventario TO postgres, anon, authenticated, service_role;

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_inventario ENABLE ROW LEVEL SECURITY;

-- 8. Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Users can read own products" ON public.productos;
DROP POLICY IF EXISTS "Users can insert own products" ON public.productos;
DROP POLICY IF EXISTS "Users can update own products" ON public.productos;
DROP POLICY IF EXISTS "Users can delete own products" ON public.productos;
DROP POLICY IF EXISTS "Users can read own inventory history" ON public.historial_inventario;
DROP POLICY IF EXISTS "Users can insert own inventory history" ON public.historial_inventario;

-- 9. Crear políticas RLS para productos
CREATE POLICY "Users can read own products"
  ON public.productos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON public.productos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON public.productos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON public.productos FOR DELETE
  USING (auth.uid() = user_id);

-- 10. Crear políticas RLS para historial
CREATE POLICY "Users can read own inventory history"
  ON public.historial_inventario FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory history"
  ON public.historial_inventario FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 11. Crear/actualizar funciones y triggers necesarios
-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en productos
DROP TRIGGER IF EXISTS update_productos_updated_at ON public.productos;
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear registro en historial al crear producto
CREATE OR REPLACE FUNCTION public.create_inventory_history_on_product_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.historial_inventario (
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
DROP TRIGGER IF EXISTS on_producto_created ON public.productos;
CREATE TRIGGER on_producto_created
  AFTER INSERT ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inventory_history_on_product_create();

-- Función para crear registro en historial al actualizar producto
CREATE OR REPLACE FUNCTION public.create_inventory_history_on_product_update()
RETURNS TRIGGER AS $$
DECLARE
  cantidad_cambio INTEGER;
BEGIN
  cantidad_cambio := NEW.cantidad - OLD.cantidad;
  
  IF cantidad_cambio != 0 THEN
    INSERT INTO public.historial_inventario (
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
    INSERT INTO public.historial_inventario (
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
DROP TRIGGER IF EXISTS on_producto_updated ON public.productos;
CREATE TRIGGER on_producto_updated
  AFTER UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inventory_history_on_product_update();

-- Función para crear registro en historial al eliminar producto
CREATE OR REPLACE FUNCTION public.create_inventory_history_on_product_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.historial_inventario (
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
DROP TRIGGER IF EXISTS on_producto_deleted ON public.productos;
CREATE TRIGGER on_producto_deleted
  BEFORE DELETE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inventory_history_on_product_delete();

-- 12. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS productos_user_id_idx ON public.productos(user_id);
CREATE INDEX IF NOT EXISTS productos_categoria_idx ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS productos_estado_idx ON public.productos(estado);
CREATE INDEX IF NOT EXISTS historial_producto_id_idx ON public.historial_inventario(producto_id);
CREATE INDEX IF NOT EXISTS historial_user_id_idx ON public.historial_inventario(user_id);
CREATE INDEX IF NOT EXISTS historial_created_at_idx ON public.historial_inventario(created_at DESC);

-- 13. Asegurar que el esquema public sea el predeterminado
ALTER DATABASE postgres SET search_path TO public, extensions;

-- 14. Verificar que todo esté correcto
DO $$
BEGIN
  RAISE NOTICE '✅ Esquema public verificado y configurado correctamente';
  RAISE NOTICE '✅ Tablas creadas/verificadas: productos, historial_inventario';
  RAISE NOTICE '✅ RLS habilitado y políticas creadas';
  RAISE NOTICE '✅ Funciones y triggers configurados';
  RAISE NOTICE '✅ Índices creados';
END $$;
